import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseVoiceDictationOptions {
  onTranscript?: (text: string) => void;
  language?: string;
}

export function useVoiceDictation({ onTranscript, language = "eng" }: UseVoiceDictationOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        
        try {
          const audioBlob = new Blob(chunksRef.current, { 
            type: mediaRecorder.mimeType 
          });

          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          formData.append("language", language);

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-transcription`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error("Transcription failed");
          }

          const data = await response.json();
          const transcribedText = data.text || "";
          
          setTranscript(transcribedText);
          onTranscript?.(transcribedText);
          
          toast.success("Transcription complete");
        } catch (error) {
          console.error("Transcription error:", error);
          toast.error("Failed to transcribe audio");
        } finally {
          setIsTranscribing(false);
        }

        // Clean up stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      toast.info("Recording started... Speak now");
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to access microphone");
    }
  }, [language, onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    transcript,
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscript: () => setTranscript(""),
  };
}

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mic,
  MicOff,
  FileSignature,
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface NoteTemplate {
  id: string;
  name: string;
  template_content: Record<string, any>;
}

interface SOAPNoteEditorProps {
  encounterId: string;
  existingNoteId?: string;
  onSave?: (noteId: string) => void;
  onClose?: () => void;
}

export function SOAPNoteEditor({ encounterId, existingNoteId, onSave, onClose }: SOAPNoteEditorProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [activeField, setActiveField] = useState<"subjective" | "objective" | "assessment" | "plan">("subjective");
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isAmendment, setIsAmendment] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState("");
  
  const [formData, setFormData] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  const { isRecording, isTranscribing, toggleRecording, transcript } = useVoiceDictation({
    onTranscript: (text) => {
      setFormData((prev) => ({
        ...prev,
        [activeField]: prev[activeField] + (prev[activeField] ? " " : "") + text,
      }));
    },
  });

  useEffect(() => {
    fetchTemplates();
    if (existingNoteId) {
      fetchExistingNote();
    }
  }, [existingNoteId]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("note_templates")
      .select("*")
      .eq("is_active", true);
    setTemplates((data as unknown as NoteTemplate[]) || []);
  };

  const fetchExistingNote = async () => {
    const { data } = await supabase
      .from("clinical_notes")
      .select("*")
      .eq("id", existingNoteId)
      .single();

    if (data) {
      setFormData({
        subjective: data.soap_subjective || "",
        objective: data.soap_objective || "",
        assessment: data.soap_assessment || "",
        plan: data.soap_plan || "",
      });
      setIsSigned(data.is_signed);
      setIsAmendment(data.is_amendment);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      // Template provides placeholders, not content
      toast.info(`Loaded template: ${template.name}`);
    }
  };

  const getPlaceholder = (field: keyof typeof formData) => {
    if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate);
      return template?.template_content[field]?.placeholder || "";
    }
    return "";
  };

  const handleSave = async (shouldSign: boolean = false) => {
    setSaving(true);
    
    try {
      // Get provider ID
      const { data: provider } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!provider) {
        toast.error("Provider record not found");
        return;
      }

      const noteData = {
        encounter_id: encounterId,
        author_id: provider.id,
        note_type: "progress_note",
        soap_subjective: formData.subjective,
        soap_objective: formData.objective,
        soap_assessment: formData.assessment,
        soap_plan: formData.plan,
        template_id: selectedTemplate || null,
        transcription_method: isRecording ? "voice" : "manual",
        is_amendment: isAmendment,
        amendment_reason: isAmendment ? amendmentReason : null,
        amended_from_id: isAmendment && existingNoteId ? existingNoteId : null,
      };

      let noteId = existingNoteId;

      if (existingNoteId && !isAmendment) {
        // Update existing note (only if not signed)
        if (isSigned) {
          toast.error("Cannot edit a signed note. Create an amendment instead.");
          return;
        }
        
        await supabase
          .from("clinical_notes")
          .update(noteData)
          .eq("id", existingNoteId);
      } else {
        // Insert new note
        const { data, error } = await supabase
          .from("clinical_notes")
          .insert(noteData)
          .select("id")
          .single();

        if (error) throw error;
        noteId = data.id;

        // If this is an amendment, create amendment record
        if (isAmendment && existingNoteId) {
          await supabase.from("note_amendments").insert({
            original_note_id: existingNoteId,
            amended_note_id: noteId,
            amendment_reason: amendmentReason,
            amended_by: provider.id,
          });
        }
      }

      toast.success("Note saved successfully");

      // Sign if requested
      if (shouldSign && noteId) {
        await handleSign(noteId);
      }

      onSave?.(noteId!);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async (noteId: string) => {
    setSigning(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/digital-signature`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ note_id: noteId, action: "sign" }),
        }
      );

      if (!response.ok) {
        throw new Error("Signature failed");
      }

      const result = await response.json();
      setIsSigned(true);
      toast.success("Note signed successfully");
      console.log("Signature:", result);
    } catch (error) {
      console.error("Sign error:", error);
      toast.error("Failed to sign note");
    } finally {
      setSigning(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            {isAmendment ? "Amend Clinical Note" : existingNoteId ? "Edit Clinical Note" : "New Clinical Note"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isSigned && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Signed
              </Badge>
            )}
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={toggleRecording}
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4 mr-2" />
              ) : (
                <Mic className="h-4 w-4 mr-2" />
              )}
              {isTranscribing ? "Transcribing..." : isRecording ? "Stop" : "Dictate"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amendment Warning */}
        {isSigned && !isAmendment && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This note is signed and cannot be edited. You can create an amendment instead.
              <Button
                variant="link"
                className="ml-2 p-0 h-auto"
                onClick={() => setIsAmendment(true)}
              >
                Create Amendment
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Amendment Reason */}
        {isAmendment && (
          <div>
            <Label>Amendment Reason *</Label>
            <Textarea
              placeholder="Explain why this amendment is necessary..."
              value={amendmentReason}
              onChange={(e) => setAmendmentReason(e.target.value)}
              className="h-20"
            />
          </div>
        )}

        <Separator />

        {/* SOAP Tabs */}
        <Tabs value={activeField} onValueChange={(v) => setActiveField(v as typeof activeField)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subjective">Subjective</TabsTrigger>
            <TabsTrigger value="objective">Objective</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>

          {(["subjective", "objective", "assessment", "plan"] as const).map((field) => (
            <TabsContent key={field} value={field} className="mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="capitalize text-lg">{field}</Label>
                  {isRecording && activeField === field && (
                    <Badge variant="destructive" className="animate-pulse">
                      <Mic className="h-3 w-3 mr-1" />
                      Recording...
                    </Badge>
                  )}
                </div>
                <Textarea
                  placeholder={getPlaceholder(field) || `Enter ${field} notes...`}
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="min-h-[200px]"
                  disabled={isSigned && !isAmendment}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving || signing || (isSigned && !isAmendment)}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving || signing || (isSigned && !isAmendment) || (isAmendment && !amendmentReason)}
          >
            <FileSignature className="h-4 w-4 mr-2" />
            {signing ? "Signing..." : "Save & Sign"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

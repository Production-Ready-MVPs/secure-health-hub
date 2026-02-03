import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, XCircle, FileSignature, History, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface ClinicalNote {
  id: string;
  note_type: string;
  soap_subjective: string | null;
  soap_objective: string | null;
  soap_assessment: string | null;
  soap_plan: string | null;
  is_signed: boolean;
  signed_at: string | null;
  signature_hash: string | null;
  is_amendment: boolean;
  amendment_reason: string | null;
  amended_from_id: string | null;
  created_at: string;
  providers: { first_name: string; last_name: string } | null;
}

interface Amendment {
  id: string;
  amendment_reason: string;
  amended_at: string;
  amended_note_id: string;
}

interface NoteHistoryViewerProps {
  noteId: string;
  onCreateAmendment?: (noteId: string) => void;
}

export function NoteHistoryViewer({ noteId, onCreateAmendment }: NoteHistoryViewerProps) {
  const [note, setNote] = useState<ClinicalNote | null>(null);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
    fetchAmendments();
    verifySignature();
  }, [noteId]);

  const fetchNote = async () => {
    const { data } = await supabase
      .from("clinical_notes")
      .select(`
        *,
        providers:author_id(first_name, last_name)
      `)
      .eq("id", noteId)
      .single();

    if (data) {
      setNote(data as unknown as ClinicalNote);
    }
    setLoading(false);
  };

  const fetchAmendments = async () => {
    const { data } = await supabase
      .from("note_amendments")
      .select("*")
      .eq("original_note_id", noteId)
      .order("amended_at", { ascending: false });

    setAmendments(data || []);
  };

  const verifySignature = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/digital-signature`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ note_id: noteId, action: "verify" }),
        }
      );

      const result = await response.json();
      setSignatureValid(result.valid);
    } catch (error) {
      console.error("Signature verification failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!note) {
    return <div className="text-center py-8 text-muted-foreground">Note not found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Clinical Note
          </CardTitle>
          <div className="flex items-center gap-2">
            {note.is_amendment && (
              <Badge variant="secondary">
                <History className="h-3 w-3 mr-1" />
                Amendment
              </Badge>
            )}
            {note.is_signed ? (
              <Badge variant={signatureValid ? "default" : "destructive"} className={signatureValid ? "bg-green-600" : ""}>
                {signatureValid ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {signatureValid ? "Verified" : "Invalid Signature"}
              </Badge>
            ) : (
              <Badge variant="outline">Unsigned</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Author:</span>{" "}
            <span className="font-medium">
              Dr. {note.providers?.last_name}, {note.providers?.first_name}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>{" "}
            <span className="font-medium">{format(new Date(note.created_at), "MMM d, yyyy h:mm a")}</span>
          </div>
          {note.is_signed && note.signed_at && (
            <>
              <div>
                <span className="text-muted-foreground">Signed:</span>{" "}
                <span className="font-medium">{format(new Date(note.signed_at), "MMM d, yyyy h:mm a")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Signature:</span>{" "}
                <code className="text-xs bg-muted px-1 rounded">{note.signature_hash?.slice(0, 16)}...</code>
              </div>
            </>
          )}
        </div>

        {/* Amendment Notice */}
        {note.is_amendment && note.amendment_reason && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Amendment Reason</p>
                <p className="text-sm text-yellow-700">{note.amendment_reason}</p>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* SOAP Content */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {note.soap_subjective && (
              <div>
                <h4 className="font-semibold text-primary mb-2">Subjective</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                  {note.soap_subjective}
                </p>
              </div>
            )}
            {note.soap_objective && (
              <div>
                <h4 className="font-semibold text-primary mb-2">Objective</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                  {note.soap_objective}
                </p>
              </div>
            )}
            {note.soap_assessment && (
              <div>
                <h4 className="font-semibold text-primary mb-2">Assessment</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                  {note.soap_assessment}
                </p>
              </div>
            )}
            {note.soap_plan && (
              <div>
                <h4 className="font-semibold text-primary mb-2">Plan</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                  {note.soap_plan}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Amendment History */}
        {amendments.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <History className="h-4 w-4" />
                Amendment History ({amendments.length})
              </h4>
              <Accordion type="single" collapsible>
                {amendments.map((amendment, index) => (
                  <AccordionItem key={amendment.id} value={amendment.id}>
                    <AccordionTrigger className="text-sm">
                      Amendment #{amendments.length - index} -{" "}
                      {format(new Date(amendment.amended_at), "MMM d, yyyy")}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">{amendment.amendment_reason}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </>
        )}

        {/* Actions */}
        {note.is_signed && onCreateAmendment && (
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onCreateAmendment(noteId)}>
              <History className="h-4 w-4 mr-2" />
              Create Amendment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

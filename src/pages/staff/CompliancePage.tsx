import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

interface BreakGlassLog {
  id: string;
  user_id: string;
  patient_id: string;
  access_reason: string;
  justification: string;
  accessed_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
}

export default function CompliancePage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<BreakGlassLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data } = await supabase
      .from("break_glass_logs")
      .select("*")
      .order("accessed_at", { ascending: false });
    
    setLogs(data ?? []);
    setLoading(false);
  }

  async function handleReview(logId: string) {
    await supabase
      .from("break_glass_logs")
      .update({
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
      })
      .eq("id", logId);
    
    setReviewingId(null);
    setReviewNotes("");
    fetchLogs();
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Compliance & Break-Glass Review</h1>

      <Card>
        <CardHeader>
          <CardTitle>Break-Glass Access Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accessed At</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Justification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.accessed_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[100px]">
                      {log.user_id}
                    </TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[100px]">
                      {log.patient_id}
                    </TableCell>
                    <TableCell>{log.access_reason}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.justification}
                    </TableCell>
                    <TableCell>
                      {log.reviewed_at ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!log.reviewed_at && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setReviewingId(log.id)}>
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Break-Glass Access</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <p className="text-sm font-medium">Reason:</p>
                                <p className="text-sm text-muted-foreground">{log.access_reason}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Justification:</p>
                                <p className="text-sm text-muted-foreground">{log.justification}</p>
                              </div>
                              <Textarea
                                placeholder="Review notes..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                              />
                              <Button onClick={() => handleReview(log.id)} className="w-full">
                                Mark as Reviewed
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No break-glass access logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

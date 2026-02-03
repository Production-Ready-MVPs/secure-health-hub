import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Shield } from "lucide-react";

interface AccessLog {
  id: string;
  timestamp: string;
  resource_type: string;
  action: string;
  access_reason: string | null;
}

export default function PatientAccessLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (patient) {
        const { data } = await supabase
          .from("phi_access_logs")
          .select("id, timestamp, resource_type, action, access_reason")
          .eq("patient_id", patient.id)
          .order("timestamp", { ascending: false })
          .limit(100);

        setLogs(data ?? []);
      }
      setLoading(false);
    }
    if (user) fetchLogs();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Who Viewed My Data</h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>HIPAA Access Disclosure</CardTitle>
          </div>
          <CardDescription>
            Under HIPAA, you have the right to know who has accessed your protected health information (PHI).
            This log shows all access to your medical records.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Log</CardTitle>
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
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.resource_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.action === "SELECT" ? "secondary" : "default"}>
                        {log.action === "SELECT" ? "Viewed" : log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.access_reason ?? "Routine clinical care"}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No access logs found
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

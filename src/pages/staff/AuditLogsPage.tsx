import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  patient_id: string | null;
  resource_type: string;
  resource_id: string | null;
  action: string;
  access_reason: string | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from("phi_access_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);
      
      setLogs(data ?? []);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT": return "default";
      case "UPDATE": return "secondary";
      case "DELETE": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">PHI Access Audit Logs</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Access Events</CardTitle>
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
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Resource Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[120px]">
                      {log.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.resource_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionColor(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[120px]">
                      {log.patient_id ?? "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.access_reason ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No audit logs found
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

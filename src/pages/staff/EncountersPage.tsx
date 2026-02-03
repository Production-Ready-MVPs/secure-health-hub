import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Encounter {
  id: string;
  encounter_date: string;
  encounter_type: string;
  status: string;
  chief_complaint: string | null;
  patients: { first_name: string; last_name: string; mrn: string } | null;
  providers: { first_name: string; last_name: string } | null;
}

export default function EncountersPage() {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEncounters() {
      const { data } = await supabase
        .from("encounters")
        .select(`
          id, encounter_date, encounter_type, status, chief_complaint,
          patients(first_name, last_name, mrn),
          providers(first_name, last_name)
        `)
        .order("encounter_date", { ascending: false })
        .limit(100);
      
      setEncounters((data as Encounter[]) ?? []);
      setLoading(false);
    }
    fetchEncounters();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "scheduled": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Encounters</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Encounters</CardTitle>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encounters.map((enc) => (
                  <TableRow key={enc.id}>
                    <TableCell>{format(new Date(enc.encounter_date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium">
                      {enc.patients?.last_name}, {enc.patients?.first_name}
                      <span className="text-muted-foreground text-xs ml-2">({enc.patients?.mrn})</span>
                    </TableCell>
                    <TableCell>
                      Dr. {enc.providers?.last_name}
                    </TableCell>
                    <TableCell>{enc.encounter_type}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {enc.chief_complaint ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(enc.status)}>{enc.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {encounters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No encounters found
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

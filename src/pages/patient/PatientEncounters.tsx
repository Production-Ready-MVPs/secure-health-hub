import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  location: string | null;
  providers: { first_name: string; last_name: string } | null;
}

export default function PatientEncounters() {
  const { user } = useAuth();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEncounters() {
      // First get the patient ID
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (patient) {
        const { data } = await supabase
          .from("encounters")
          .select(`
            id, encounter_date, encounter_type, status, chief_complaint, location,
            providers(first_name, last_name)
          `)
          .eq("patient_id", patient.id)
          .order("encounter_date", { ascending: false });

        setEncounters((data as Encounter[]) ?? []);
      }
      setLoading(false);
    }
    if (user) fetchEncounters();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Visits</h1>

      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
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
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encounters.map((enc) => (
                  <TableRow key={enc.id}>
                    <TableCell>{format(new Date(enc.encounter_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      Dr. {enc.providers?.last_name}, {enc.providers?.first_name}
                    </TableCell>
                    <TableCell>{enc.encounter_type}</TableCell>
                    <TableCell>{enc.location ?? "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {enc.chief_complaint ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{enc.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {encounters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No visits found
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

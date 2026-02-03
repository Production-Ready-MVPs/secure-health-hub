import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Medication {
  id: string;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  route: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  providers: { first_name: string; last_name: string } | null;
}

export default function PatientMedications() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedications() {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (patient) {
        const { data } = await supabase
          .from("medications")
          .select(`
            id, medication_name, dosage, frequency, route, start_date, end_date, status,
            providers:prescriber_id(first_name, last_name)
          `)
          .eq("patient_id", patient.id)
          .order("status")
          .order("start_date", { ascending: false });

        setMedications((data as Medication[]) ?? []);
      }
      setLoading(false);
    }
    if (user) fetchMedications();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Medications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Medication List</CardTitle>
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
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Prescribed By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.medication_name}</TableCell>
                    <TableCell>{med.dosage ?? "-"}</TableCell>
                    <TableCell>{med.frequency ?? "-"}</TableCell>
                    <TableCell>{med.route ?? "-"}</TableCell>
                    <TableCell>
                      {med.providers ? `Dr. ${med.providers.last_name}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={med.status === "active" ? "default" : "secondary"}>
                        {med.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {medications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No medications found
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

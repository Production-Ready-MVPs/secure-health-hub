import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Search, Activity, Heart, Thermometer } from "lucide-react";

interface VitalSignsFormData {
  patient_id: string;
  encounter_id: string;
  bp_systolic: string;
  bp_diastolic: string;
  heart_rate: string;
  respiratory_rate: string;
  temperature_f: string;
  o2_saturation: string;
  weight_lbs: string;
  height_inches: string;
  pain_level: string;
  notes: string;
}

export default function VitalSignsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<VitalSignsFormData>({
    patient_id: "",
    encounter_id: "",
    bp_systolic: "",
    bp_diastolic: "",
    heart_rate: "",
    respiratory_rate: "",
    temperature_f: "",
    o2_saturation: "",
    weight_lbs: "",
    height_inches: "",
    pain_level: "",
    notes: "",
  });

  // Fetch current provider
  const { data: provider } = useQuery({
    queryKey: ["provider", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch patients
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, mrn")
        .is("deleted_at", null)
        .order("last_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch encounters for selected patient
  const { data: encounters } = useQuery({
    queryKey: ["encounters", formData.patient_id],
    queryFn: async () => {
      if (!formData.patient_id) return [];
      const { data, error } = await supabase
        .from("encounters")
        .select("id, encounter_date, encounter_type, status")
        .eq("patient_id", formData.patient_id)
        .order("encounter_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!formData.patient_id,
  });

  // Fetch vital signs
  const { data: vitalSigns, isLoading } = useQuery({
    queryKey: ["vital-signs", selectedPatient],
    queryFn: async () => {
      let query = supabase
        .from("vital_signs")
        .select(`
          *,
          patients:patient_id (first_name, last_name, mrn),
          encounters:encounter_id (encounter_type, encounter_date),
          recorder:recorded_by (first_name, last_name)
        `)
        .order("recorded_at", { ascending: false })
        .limit(100);

      if (selectedPatient && selectedPatient !== "all") {
        query = query.eq("patient_id", selectedPatient);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Create vital signs mutation
  const createMutation = useMutation({
    mutationFn: async (data: VitalSignsFormData) => {
      if (!provider?.id) throw new Error("Provider not found");

      const { error } = await supabase.from("vital_signs").insert({
        patient_id: data.patient_id,
        encounter_id: data.encounter_id,
        recorded_by: provider.id,
        bp_systolic: data.bp_systolic ? parseInt(data.bp_systolic) : null,
        bp_diastolic: data.bp_diastolic ? parseInt(data.bp_diastolic) : null,
        heart_rate: data.heart_rate ? parseInt(data.heart_rate) : null,
        respiratory_rate: data.respiratory_rate ? parseInt(data.respiratory_rate) : null,
        temperature_f: data.temperature_f ? parseFloat(data.temperature_f) : null,
        o2_saturation: data.o2_saturation ? parseInt(data.o2_saturation) : null,
        weight_lbs: data.weight_lbs ? parseFloat(data.weight_lbs) : null,
        height_inches: data.height_inches ? parseFloat(data.height_inches) : null,
        pain_level: data.pain_level ? parseInt(data.pain_level) : null,
        notes: data.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vital-signs"] });
      toast.success("Vital signs recorded");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record vital signs");
    },
  });

  const resetForm = () => {
    setFormData({
      patient_id: "",
      encounter_id: "",
      bp_systolic: "",
      bp_diastolic: "",
      heart_rate: "",
      respiratory_rate: "",
      temperature_f: "",
      o2_saturation: "",
      weight_lbs: "",
      height_inches: "",
      pain_level: "",
      notes: "",
    });
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.encounter_id) {
      toast.error("Please select patient and encounter");
      return;
    }
    createMutation.mutate(formData);
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 120) {
      return <Badge variant="destructive">Crisis</Badge>;
    }
    if (systolic >= 140 || diastolic >= 90) {
      return <Badge className="bg-orange-500">High</Badge>;
    }
    if (systolic >= 130 || diastolic >= 80) {
      return <Badge className="bg-yellow-500">Elevated</Badge>;
    }
    if (systolic < 90 || diastolic < 60) {
      return <Badge className="bg-blue-500">Low</Badge>;
    }
    return <Badge variant="secondary">Normal</Badge>;
  };

  const filteredVitals = vitalSigns?.filter((vital) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      vital.patients?.first_name?.toLowerCase().includes(search) ||
      vital.patients?.last_name?.toLowerCase().includes(search) ||
      vital.patients?.mrn?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vital Signs</h1>
          <p className="text-muted-foreground">Record and monitor patient vital signs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Record Vitals
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Vital Signs</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(v) =>
                      setFormData({ ...formData, patient_id: v, encounter_id: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.last_name}, {p.first_name} ({p.mrn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Encounter *</Label>
                  <Select
                    value={formData.encounter_id}
                    onValueChange={(v) => setFormData({ ...formData, encounter_id: v })}
                    disabled={!formData.patient_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select encounter" />
                    </SelectTrigger>
                    <SelectContent>
                      {encounters?.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {format(new Date(e.encounter_date), "MMM d, yyyy")} - {e.encounter_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Blood Pressure
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Systolic"
                      value={formData.bp_systolic}
                      onChange={(e) => setFormData({ ...formData, bp_systolic: e.target.value })}
                    />
                    <span>/</span>
                    <Input
                      type="number"
                      placeholder="Diastolic"
                      value={formData.bp_diastolic}
                      onChange={(e) => setFormData({ ...formData, bp_diastolic: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Heart Rate (bpm)</Label>
                  <Input
                    type="number"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                    placeholder="60-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Respiratory Rate</Label>
                  <Input
                    type="number"
                    value={formData.respiratory_rate}
                    onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })}
                    placeholder="12-20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    Temperature (°F)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.temperature_f}
                    onChange={(e) => setFormData({ ...formData, temperature_f: e.target.value })}
                    placeholder="98.6"
                  />
                </div>

                <div className="space-y-2">
                  <Label>O₂ Saturation (%)</Label>
                  <Input
                    type="number"
                    value={formData.o2_saturation}
                    onChange={(e) => setFormData({ ...formData, o2_saturation: e.target.value })}
                    placeholder="95-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pain Level (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pain_level}
                    onChange={(e) => setFormData({ ...formData, pain_level: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weight (lbs)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight_lbs}
                    onChange={(e) => setFormData({ ...formData, weight_lbs: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Height (inches)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.height_inches}
                    onChange={(e) => setFormData({ ...formData, height_inches: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional observations..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Vitals"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="All patients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All patients</SelectItem>
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.last_name}, {p.first_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Vital Signs Records ({filteredVitals?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !filteredVitals?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No vital signs recorded
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>BP</TableHead>
                  <TableHead>HR</TableHead>
                  <TableHead>Temp</TableHead>
                  <TableHead>O₂</TableHead>
                  <TableHead>RR</TableHead>
                  <TableHead>Pain</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVitals.map((vital) => (
                  <TableRow key={vital.id}>
                    <TableCell className="font-medium">
                      {vital.patients?.last_name}, {vital.patients?.first_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(vital.recorded_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      {vital.bp_systolic && vital.bp_diastolic ? (
                        <div className="flex items-center gap-2">
                          <span>{vital.bp_systolic}/{vital.bp_diastolic}</span>
                          {getBPStatus(vital.bp_systolic, vital.bp_diastolic)}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{vital.heart_rate || "-"}</TableCell>
                    <TableCell>
                      {vital.temperature_f ? `${vital.temperature_f}°F` : "-"}
                    </TableCell>
                    <TableCell>
                      {vital.o2_saturation ? `${vital.o2_saturation}%` : "-"}
                    </TableCell>
                    <TableCell>{vital.respiratory_rate || "-"}</TableCell>
                    <TableCell>
                      {vital.pain_level !== null ? (
                        <Badge
                          variant={vital.pain_level >= 7 ? "destructive" : vital.pain_level >= 4 ? "default" : "secondary"}
                        >
                          {vital.pain_level}/10
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {vital.recorder?.first_name} {vital.recorder?.last_name}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

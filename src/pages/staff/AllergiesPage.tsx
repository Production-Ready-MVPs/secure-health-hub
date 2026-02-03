import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Plus, Search, AlertTriangle, Edit, Trash2 } from "lucide-react";

interface AllergyFormData {
  patient_id: string;
  allergen: string;
  reaction: string;
  severity: string;
  status: string;
  onset_date: string;
  notes: string;
}

export default function AllergiesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<any>(null);
  const [formData, setFormData] = useState<AllergyFormData>({
    patient_id: "",
    allergen: "",
    reaction: "",
    severity: "mild",
    status: "active",
    onset_date: "",
    notes: "",
  });

  // Fetch patients for selection
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

  // Fetch allergies with patient info
  const { data: allergies, isLoading } = useQuery({
    queryKey: ["allergies", selectedPatient],
    queryFn: async () => {
      let query = supabase
        .from("allergies")
        .select(`
          *,
          patients:patient_id (first_name, last_name, mrn)
        `)
        .order("created_at", { ascending: false });

      if (selectedPatient && selectedPatient !== "all") {
        query = query.eq("patient_id", selectedPatient);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Create/update allergy mutation
  const saveMutation = useMutation({
    mutationFn: async (data: AllergyFormData) => {
      if (editingAllergy) {
        const { error } = await supabase
          .from("allergies")
          .update({
            allergen: data.allergen,
            reaction: data.reaction,
            severity: data.severity,
            status: data.status,
            onset_date: data.onset_date || null,
            notes: data.notes || null,
          })
          .eq("id", editingAllergy.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("allergies").insert({
          patient_id: data.patient_id,
          allergen: data.allergen,
          reaction: data.reaction,
          severity: data.severity,
          status: data.status,
          onset_date: data.onset_date || null,
          notes: data.notes || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allergies"] });
      toast.success(editingAllergy ? "Allergy updated" : "Allergy added");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save allergy");
    },
  });

  // Delete allergy mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("allergies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allergies"] });
      toast.success("Allergy deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete allergy");
    },
  });

  const resetForm = () => {
    setFormData({
      patient_id: "",
      allergen: "",
      reaction: "",
      severity: "mild",
      status: "active",
      onset_date: "",
      notes: "",
    });
    setEditingAllergy(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (allergy: any) => {
    setEditingAllergy(allergy);
    setFormData({
      patient_id: allergy.patient_id,
      allergen: allergy.allergen,
      reaction: allergy.reaction || "",
      severity: allergy.severity || "mild",
      status: allergy.status,
      onset_date: allergy.onset_date || "",
      notes: allergy.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.allergen || (!editingAllergy && !formData.patient_id)) {
      toast.error("Please fill in required fields");
      return;
    }
    saveMutation.mutate(formData);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "severe":
        return <Badge variant="destructive">{severity}</Badge>;
      case "moderate":
        return <Badge className="bg-orange-500">{severity}</Badge>;
      case "mild":
        return <Badge variant="secondary">{severity}</Badge>;
      default:
        return <Badge variant="outline">{severity || "Unknown"}</Badge>;
    }
  };

  const filteredAllergies = allergies?.filter((allergy) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      allergy.allergen.toLowerCase().includes(search) ||
      allergy.reaction?.toLowerCase().includes(search) ||
      allergy.patients?.first_name?.toLowerCase().includes(search) ||
      allergy.patients?.last_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Allergies Management</h1>
          <p className="text-muted-foreground">Track and manage patient allergies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Allergy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAllergy ? "Edit Allergy" : "Add New Allergy"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingAllergy && (
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(v) => setFormData({ ...formData, patient_id: v })}
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
              )}

              <div className="space-y-2">
                <Label>Allergen *</Label>
                <Input
                  value={formData.allergen}
                  onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                  placeholder="e.g., Penicillin, Peanuts"
                />
              </div>

              <div className="space-y-2">
                <Label>Reaction</Label>
                <Input
                  value={formData.reaction}
                  onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                  placeholder="e.g., Hives, Anaphylaxis"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(v) => setFormData({ ...formData, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Onset Date</Label>
                <Input
                  type="date"
                  value={formData.onset_date}
                  onChange={(e) => setFormData({ ...formData, onset_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save"}
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
                  placeholder="Search allergies..."
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

      {/* Allergies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Allergies ({filteredAllergies?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !filteredAllergies?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No allergies found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Allergen</TableHead>
                  <TableHead>Reaction</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Onset</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllergies.map((allergy) => (
                  <TableRow key={allergy.id}>
                    <TableCell className="font-medium">
                      {allergy.patients?.last_name}, {allergy.patients?.first_name}
                    </TableCell>
                    <TableCell>{allergy.allergen}</TableCell>
                    <TableCell>{allergy.reaction || "-"}</TableCell>
                    <TableCell>{getSeverityBadge(allergy.severity)}</TableCell>
                    <TableCell>
                      <Badge variant={allergy.status === "active" ? "default" : "outline"}>
                        {allergy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {allergy.onset_date
                        ? format(new Date(allergy.onset_date), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(allergy)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Delete this allergy record?")) {
                              deleteMutation.mutate(allergy.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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

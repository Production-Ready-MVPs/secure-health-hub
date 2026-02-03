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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Search, Pill, Send, Ban, FileText } from "lucide-react";

interface PrescriptionFormData {
  patient_id: string;
  drug_name: string;
  drug_ndc: string;
  sig: string;
  quantity: string;
  quantity_unit: string;
  refills: string;
  days_supply: string;
  dea_schedule: string;
  dispense_as_written: boolean;
  pharmacy_name: string;
  pharmacy_address: string;
  notes: string;
}

const DEA_SCHEDULES = [
  { value: "none", label: "None (Non-controlled)" },
  { value: "II", label: "Schedule II" },
  { value: "III", label: "Schedule III" },
  { value: "IV", label: "Schedule IV" },
  { value: "V", label: "Schedule V" },
];

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PrescriptionFormData>({
    patient_id: "",
    drug_name: "",
    drug_ndc: "",
    sig: "",
    quantity: "",
    quantity_unit: "tablets",
    refills: "0",
    days_supply: "",
    dea_schedule: "none",
    dispense_as_written: false,
    pharmacy_name: "",
    pharmacy_address: "",
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

  // Fetch prescriptions
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["prescriptions", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("prescriptions")
        .select(`
          *,
          patients:patient_id (first_name, last_name, mrn),
          prescriber:prescriber_id (first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Create prescription mutation
  const createMutation = useMutation({
    mutationFn: async (data: PrescriptionFormData) => {
      if (!provider?.id) throw new Error("Provider not found");

      const { error } = await supabase.from("prescriptions").insert({
        patient_id: data.patient_id,
        prescriber_id: provider.id,
        drug_name: data.drug_name,
        drug_ndc: data.drug_ndc || null,
        sig: data.sig,
        quantity: parseInt(data.quantity),
        quantity_unit: data.quantity_unit,
        refills: parseInt(data.refills),
        days_supply: data.days_supply ? parseInt(data.days_supply) : null,
        dea_schedule: data.dea_schedule === "none" ? null : data.dea_schedule,
        dispense_as_written: data.dispense_as_written,
        pharmacy_name: data.pharmacy_name || null,
        pharmacy_address: data.pharmacy_address || null,
        notes: data.notes || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast.success("Prescription created");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create prescription");
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "sent") {
        updates.sent_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("prescriptions")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast.success("Prescription status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update prescription");
    },
  });

  const resetForm = () => {
    setFormData({
      patient_id: "",
      drug_name: "",
      drug_ndc: "",
      sig: "",
      quantity: "",
      quantity_unit: "tablets",
      refills: "0",
      days_supply: "",
      dea_schedule: "none",
      dispense_as_written: false,
      pharmacy_name: "",
      pharmacy_address: "",
      notes: "",
    });
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.drug_name || !formData.sig || !formData.quantity) {
      toast.error("Please fill in required fields");
      return;
    }
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-500">Sent</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "filled":
        return <Badge className="bg-blue-500">Filled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPrescriptions = prescriptions?.filter((rx) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      rx.drug_name.toLowerCase().includes(search) ||
      rx.patients?.first_name?.toLowerCase().includes(search) ||
      rx.patients?.last_name?.toLowerCase().includes(search) ||
      rx.patients?.mrn?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">Create and manage patient prescriptions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Prescription</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Drug Name *</Label>
                  <Input
                    value={formData.drug_name}
                    onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
                    placeholder="e.g., Lisinopril 10mg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>NDC Code</Label>
                  <Input
                    value={formData.drug_ndc}
                    onChange={(e) => setFormData({ ...formData, drug_ndc: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sig (Directions) *</Label>
                <Input
                  value={formData.sig}
                  onChange={(e) => setFormData({ ...formData, sig: e.target.value })}
                  placeholder="e.g., Take 1 tablet by mouth once daily"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={formData.quantity_unit}
                    onValueChange={(v) => setFormData({ ...formData, quantity_unit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="capsules">Capsules</SelectItem>
                      <SelectItem value="ml">mL</SelectItem>
                      <SelectItem value="patches">Patches</SelectItem>
                      <SelectItem value="inhalers">Inhalers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Refills</Label>
                  <Input
                    type="number"
                    min="0"
                    max="11"
                    value={formData.refills}
                    onChange={(e) => setFormData({ ...formData, refills: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Days Supply</Label>
                  <Input
                    type="number"
                    value={formData.days_supply}
                    onChange={(e) => setFormData({ ...formData, days_supply: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>DEA Schedule</Label>
                  <Select
                    value={formData.dea_schedule}
                    onValueChange={(v) => setFormData({ ...formData, dea_schedule: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Non-controlled" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEA_SCHEDULES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="daw"
                    checked={formData.dispense_as_written}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, dispense_as_written: checked as boolean })
                    }
                  />
                  <Label htmlFor="daw">Dispense As Written (no substitution)</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pharmacy Name</Label>
                  <Input
                    value={formData.pharmacy_name}
                    onChange={(e) => setFormData({ ...formData, pharmacy_name: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pharmacy Address</Label>
                  <Input
                    value={formData.pharmacy_address}
                    onChange={(e) => setFormData({ ...formData, pharmacy_address: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Prescription"}
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
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Prescriptions ({filteredPrescriptions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !filteredPrescriptions?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No prescriptions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Drug</TableHead>
                  <TableHead>Sig</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Refills</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((rx) => (
                  <TableRow key={rx.id}>
                    <TableCell className="font-medium">
                      {rx.patients?.last_name}, {rx.patients?.first_name}
                    </TableCell>
                    <TableCell>
                      <div>
                        {rx.drug_name}
                        {rx.dispense_as_written && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            DAW
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={rx.sig}>
                      {rx.sig}
                    </TableCell>
                    <TableCell>
                      {rx.quantity} {rx.quantity_unit}
                    </TableCell>
                    <TableCell>{rx.refills}</TableCell>
                    <TableCell>
                      {rx.dea_schedule ? (
                        <Badge variant="outline">C-{rx.dea_schedule}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(rx.status)}</TableCell>
                    <TableCell>
                      {format(new Date(rx.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rx.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Send to pharmacy"
                              onClick={() =>
                                updateStatusMutation.mutate({ id: rx.id, status: "sent" })
                              }
                            >
                              <Send className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cancel prescription"
                              onClick={() => {
                                if (confirm("Cancel this prescription?")) {
                                  updateStatusMutation.mutate({ id: rx.id, status: "cancelled" });
                                }
                              }}
                            >
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {rx.status === "sent" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Mark as filled"
                            onClick={() =>
                              updateStatusMutation.mutate({ id: rx.id, status: "filled" })
                            }
                          >
                            <FileText className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
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

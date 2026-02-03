import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { FlaskConical, Clock, AlertTriangle, CheckCircle, FileText } from "lucide-react";

interface LabResult {
  id: string;
  test_component: string;
  value: string;
  unit: string | null;
  reference_range: string | null;
  abnormal_flag: string | null;
  critical_value: boolean;
  resulted_at: string;
  comments: string | null;
}

interface LabOrder {
  id: string;
  test_name: string;
  status: string;
  priority: string;
  ordered_at: string;
  scheduled_date: string | null;
  fasting_required: boolean;
  collection_instructions: string | null;
  notes: string | null;
  providers: { first_name: string; last_name: string } | null;
  lab_results: LabResult[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  collected: "bg-blue-100 text-blue-800",
  resulted: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const priorityColors: Record<string, string> = {
  routine: "bg-gray-100 text-gray-800",
  urgent: "bg-orange-100 text-orange-800",
  stat: "bg-red-100 text-red-800",
};

export default function PatientLabResults() {
  const { user } = useAuth();
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLabResults() {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (patient) {
        const { data } = await supabase
          .from("lab_orders")
          .select(`
            id, test_name, status, priority, ordered_at, scheduled_date,
            fasting_required, collection_instructions, notes,
            providers:ordered_by(first_name, last_name),
            lab_results(
              id, test_component, value, unit, reference_range,
              abnormal_flag, critical_value, resulted_at, comments
            )
          `)
          .eq("patient_id", patient.id)
          .order("ordered_at", { ascending: false });

        setLabOrders((data as unknown as LabOrder[]) ?? []);
      }
      setLoading(false);
    }
    if (user) fetchLabResults();
  }, [user]);

  const pendingOrders = labOrders.filter((order) => order.status === "pending" || order.status === "collected");
  const completedOrders = labOrders.filter((order) => order.status === "resulted");

  const getAbnormalBadge = (flag: string | null, critical: boolean) => {
    if (critical) {
      return <Badge variant="destructive" className="ml-2">Critical</Badge>;
    }
    if (flag === "H" || flag === "high") {
      return <Badge className="ml-2 bg-orange-100 text-orange-800">High</Badge>;
    }
    if (flag === "L" || flag === "low") {
      return <Badge className="ml-2 bg-blue-100 text-blue-800">Low</Badge>;
    }
    if (flag === "A" || flag === "abnormal") {
      return <Badge className="ml-2 bg-yellow-100 text-yellow-800">Abnormal</Badge>;
    }
    return null;
  };

  const LabOrderCard = ({ order }: { order: LabOrder }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              {order.test_name}
            </CardTitle>
            <CardDescription className="mt-1">
              Ordered by Dr. {order.providers?.last_name} on{" "}
              {format(new Date(order.ordered_at), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={priorityColors[order.priority] || "bg-gray-100"}>
              {order.priority}
            </Badge>
            <Badge className={statusColors[order.status] || "bg-gray-100"}>
              {order.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Pending Order Info */}
        {order.status === "pending" && (
          <div className="space-y-2 text-sm">
            {order.scheduled_date && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Scheduled for: {format(new Date(order.scheduled_date), "MMM d, yyyy")}</span>
              </div>
            )}
            {order.fasting_required && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Fasting required before collection</span>
              </div>
            )}
            {order.collection_instructions && (
              <div className="bg-muted/50 p-3 rounded-md mt-2">
                <span className="font-medium">Instructions:</span> {order.collection_instructions}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {order.lab_results && order.lab_results.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Results - {format(new Date(order.lab_results[0].resulted_at), "MMM d, yyyy h:mm a")}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Test</th>
                    <th className="text-left py-2 font-medium">Result</th>
                    <th className="text-left py-2 font-medium">Reference Range</th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {order.lab_results.map((result) => (
                    <tr key={result.id} className="border-b last:border-0">
                      <td className="py-2">{result.test_component}</td>
                      <td className="py-2 font-medium">
                        {result.value} {result.unit}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {result.reference_range || "-"}
                      </td>
                      <td className="py-2">
                        {result.abnormal_flag || result.critical_value ? (
                          getAbnormalBadge(result.abnormal_flag, result.critical_value || false)
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Normal
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {order.lab_results.some((r) => r.comments) && (
              <div className="bg-muted/50 p-3 rounded-md">
                <span className="font-medium">Comments:</span>
                <ul className="mt-1 space-y-1">
                  {order.lab_results.filter((r) => r.comments).map((r) => (
                    <li key={r.id} className="text-sm">
                      <span className="font-medium">{r.test_component}:</span> {r.comments}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium">Note:</span> {order.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Lab Results</h1>

      <Tabs defaultValue="completed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Lab Results</h3>
                <p className="text-muted-foreground">
                  Your lab results will appear here once they're ready.
                </p>
              </CardContent>
            </Card>
          ) : (
            completedOrders.map((order) => (
              <LabOrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Lab Orders</h3>
                <p className="text-muted-foreground">
                  You don't have any pending lab orders.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map((order) => (
              <LabOrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Educational Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Understanding Your Lab Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="ranges">
              <AccordionTrigger>What are reference ranges?</AccordionTrigger>
              <AccordionContent>
                Reference ranges show the typical values for most healthy people. Your results may fall
                outside these ranges for many reasons, and this doesn't always indicate a problem.
                Your provider will interpret your results in the context of your overall health.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="abnormal">
              <AccordionTrigger>What if my result is marked abnormal?</AccordionTrigger>
              <AccordionContent>
                An "abnormal" flag means your result is outside the reference range. This may be
                significant or completely normal for you. Your healthcare provider will review all
                your results and contact you if any follow-up is needed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="critical">
              <AccordionTrigger>What is a critical value?</AccordionTrigger>
              <AccordionContent>
                Critical values are results that require immediate medical attention. If you have a
                critical value, your healthcare team should have already contacted you. If you see
                a critical result and haven't been contacted, please call your provider immediately.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database, 
  Users, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  FileText,
  ClipboardList,
  Shield,
  Activity,
  Pill,
  Calendar,
  FlaskConical,
  Syringe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SeedResult {
  success: boolean;
  message: string;
  results?: Record<string, number>;
  credentials?: {
    physicians: { email: string; password: string; role: string }[];
    nurses: { email: string; password: string; role: string }[];
    admin: { email: string; password: string; role: string };
    compliance: { email: string; password: string; role: string };
    patients: { email: string; password: string; role: string }[];
  };
}

export default function DemoDataPage() {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"seed" | "clear" | null>(null);
  const [result, setResult] = useState<SeedResult | null>(null);

  const handleSeedData = async () => {
    setLoading(true);
    setAction("seed");
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("seed-demo-data", {
        body: { action: "seed" }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Demo data seeded successfully!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to seed demo data";
      toast.error(message);
      setResult({ success: false, message });
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear ALL demo data? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    setAction("clear");
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("seed-demo-data", {
        body: { action: "clear" }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Demo data cleared successfully!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to clear demo data";
      toast.error(message);
      setResult({ success: false, message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demo Data Management</h1>
          <p className="text-muted-foreground mt-1">
            Seed realistic healthcare data for testing and demonstration purposes
          </p>
        </div>
      </div>

      <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">Testing Environment Only</AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          This feature creates synthetic data for testing purposes. Never use in production with real patient data.
          All generated data is fictional and HIPAA-compliant for testing purposes only.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Demo Data
            </CardTitle>
            <CardDescription>
              Create comprehensive test data including users, patients, encounters, and clinical records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>6 Staff Users + 5 Patients</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>35 Patient Records</span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <span>45 Encounters</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>35+ Clinical Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>45 Vital Signs</span>
              </div>
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-muted-foreground" />
                <span>45+ Prescriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
                <span>20 Lab Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>30 Appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <Syringe className="h-4 w-4 text-muted-foreground" />
                <span>100+ Immunizations</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>200+ Audit Logs</span>
              </div>
            </div>
            <Button
              onClick={handleSeedData}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading && action === "seed" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Data...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Demo Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Clear Demo Data
            </CardTitle>
            <CardDescription>
              Remove all demo data from the database. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Destructive Action</AlertTitle>
              <AlertDescription>
                This will permanently delete all demo data including users, patients, 
                encounters, notes, and all associated clinical records.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleClearData}
              disabled={loading}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {loading && action === "clear" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing Data...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Demo Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {result.success ? "Operation Successful" : "Operation Failed"}
            </CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent>
            {result.success && result.results && (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="credentials">Test Credentials</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(result.results).map(([key, value]) => (
                      <div key={key} className="bg-muted p-3 rounded-lg">
                        <div className="text-2xl font-bold">{value}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="credentials">
                  {result.credentials && (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="default">Physicians</Badge>
                          </h3>
                          <div className="space-y-2">
                            {result.credentials.physicians.map((user, i) => (
                              <div key={i} className="bg-muted p-3 rounded-lg text-sm font-mono">
                                <div>Email: {user.email}</div>
                                <div>Password: {user.password}</div>
                                <div className="text-muted-foreground">{user.role}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="secondary">Nurses</Badge>
                          </h3>
                          <div className="space-y-2">
                            {result.credentials.nurses.map((user, i) => (
                              <div key={i} className="bg-muted p-3 rounded-lg text-sm font-mono">
                                <div>Email: {user.email}</div>
                                <div>Password: {user.password}</div>
                                <div className="text-muted-foreground">{user.role}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="outline">Admin & Compliance</Badge>
                          </h3>
                          <div className="space-y-2">
                            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                              <div>Email: {result.credentials.admin.email}</div>
                              <div>Password: {result.credentials.admin.password}</div>
                              <div className="text-muted-foreground">{result.credentials.admin.role}</div>
                            </div>
                            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                              <div>Email: {result.credentials.compliance.email}</div>
                              <div>Password: {result.credentials.compliance.password}</div>
                              <div className="text-muted-foreground">{result.credentials.compliance.role}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="secondary">Patient Portal Users</Badge>
                          </h3>
                          <div className="space-y-2">
                            {result.credentials.patients.map((user, i) => (
                              <div key={i} className="bg-muted p-3 rounded-lg text-sm font-mono">
                                <div>Email: {user.email}</div>
                                <div>Password: {user.password}</div>
                                <div className="text-muted-foreground">{user.role}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  department: string | null;
  is_active: boolean;
  email: string | null;
}

export default function AdminPage() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [rolesRes, providersRes] = await Promise.all([
        supabase.from("user_roles").select("*").order("created_at", { ascending: false }),
        supabase.from("providers").select("*").order("last_name"),
      ]);
      
      setUserRoles(rolesRes.data ?? []);
      setProviders(providersRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case "admin": return "destructive";
      case "compliance_officer": return "secondary";
      case "provider": return "default";
      case "patient": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
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
                      <TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assigned At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.map((ur) => (
                      <TableRow key={ur.id}>
                        <TableCell className="font-mono text-xs">{ur.user_id}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeColor(ur.role)}>{ur.role}</Badge>
                        </TableCell>
                        <TableCell>{new Date(ur.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {userRoles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No user roles assigned
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Provider Directory</CardTitle>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          Dr. {p.last_name}, {p.first_name}
                        </TableCell>
                        <TableCell>{p.email ?? "-"}</TableCell>
                        <TableCell>{p.specialty ?? "-"}</TableCell>
                        <TableCell>{p.department ?? "-"}</TableCell>
                        <TableCell>
                          <Badge variant={p.is_active ? "default" : "secondary"}>
                            {p.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {providers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No providers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

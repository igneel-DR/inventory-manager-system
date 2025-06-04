// TODO: Potentially import KpiCard or other shared components if needed directly here
// For now, assuming kpis is a simple object to display

import { Users, Settings, Activity, Server } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import StockMovementChart from "./StockMovementChart";
import InventoryValueChart from "./InventoryValueChart";

export default function AdminDashboard({ kpis }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Admin Controls</h2>
        <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
          <Users className="mr-2 h-4 w-4" />
          Manage Users
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Users Management</CardTitle>
            <CardDescription>
              Manage user accounts and roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="flex flex-col rounded-lg border p-3">
                <span className="text-xs text-muted-foreground">Active Users</span>
                <span className="text-xl font-semibold">{kpis?.activeUsers || 0}</span>
              </div>
              <div className="flex flex-col rounded-lg border p-3">
                <span className="text-xs text-muted-foreground">Admins</span>
                <span className="text-xl font-semibold">{kpis?.adminCount || 1}</span>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/users")}
              >
                View Users
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">System Status</CardTitle>
            <CardDescription>
              Monitor system performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">All services operational</span>
            </div>
            <div className="mt-4">
              <Button
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activity Log</CardTitle>
            <CardDescription>
              Recent system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kpis ? (
              <div className="rounded-md border">
                <div className="p-3">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">System data loaded successfully</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Database backup completed</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Include both chart components for a complete overview */}
        <div className="flex col-span-2 gap-4">
          <StockMovementChart />
          <InventoryValueChart />
        </div>
      </div>
    </div>
  );
} 
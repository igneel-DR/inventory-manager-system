import { PieChart, BarChart3, DollarSign, FileText, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import InventoryValueChart from "./InventoryValueChart";

// TODO: Potentially import KpiCard or other shared components if needed directly here

export default function AccountantDashboard({ kpis }) {
  const navigate = useNavigate();

  // Calculate inventory value (mocked data)
  const inventoryValue = kpis?.totalStockQuantity ? 
    (kpis.totalStockQuantity * 15.50).toFixed(2) : "0.00"; // Mocked average value per item

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Financial Overview</h2>
        <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
          <FileText className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inventory Valuation</CardTitle>
            <CardDescription>
              Current inventory financial value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="flex flex-col rounded-lg border p-3">
                <span className="text-xs text-muted-foreground">Total Value</span>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xl font-semibold">{inventoryValue}</span>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border p-3">
                <span className="text-xs text-muted-foreground">Total Items</span>
                <span className="text-xl font-semibold">{kpis?.totalProducts || 0}</span>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/inventory-value")}
              >
                <PieChart className="mr-2 h-4 w-4" />
                Detailed Valuation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Financial Reports</CardTitle>
            <CardDescription>
              Access generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="p-3">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Inventory Summary Report</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Stock Movement Report</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/reports")}
              >
                Generate New Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Value Chart */}
        <InventoryValueChart />
      </div>
    </div>
  );
} 
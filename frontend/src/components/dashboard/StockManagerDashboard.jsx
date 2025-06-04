import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import StockMovementChart from "./StockMovementChart";

// TODO: Potentially import KpiCard or other shared components if needed directly here

export default function StockManagerDashboard({ kpis }) {
  const navigate = useNavigate();

  // Get low stock items from the API response
  const lowStockItems = kpis?.lowStockItems || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Inventory Management</h2>
        <Button variant="outline" size="sm" onClick={() => navigate("/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Low Stock Items</CardTitle>
            <CardDescription>
              Products that need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="rounded-md border">
                <div className="max-h-[200px] overflow-auto">
                  {lowStockItems.map((item) => (
                    <div 
                      key={item._id} 
                      className="flex items-center justify-between border-b p-3 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.sku || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-red-600">
                          {item.quantity} / {item.minimumLevel}
                        </span>
                        <AlertTriangle className="ml-2 h-4 w-4 text-red-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/50">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-600">All stock levels are healthy</p>
                </div>
              </div>
            )}
            <div className="mt-4">
              <Button
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/products")}
              >
                View All Products
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Stock Movements</CardTitle>
            <CardDescription>
              Latest inventory transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">Stock In</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">{kpis?.dailyMovements?.find(m => m._id === 'in')?.totalQuantity || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">Stock Out</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="flex items-center text-blue-600">
                  <TrendingDown className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">{kpis?.dailyMovements?.find(m => m._id === 'out')?.totalQuantity || 0}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/stock-movements")}
              >
                View All Movements
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Stock Movement Chart */}
        <StockMovementChart />
      </div>
    </div>
  );
} 
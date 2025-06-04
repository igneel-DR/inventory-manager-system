import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import StockManagerDashboard from "@/components/dashboard/StockManagerDashboard";
import AccountantDashboard from "@/components/dashboard/AccountantDashboard";
import KpiCard from "@/components/dashboard/KpiCard";
import { Package, AlertTriangle, BarChart, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Define the API URL (you might want to move this to a .env file later)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState(null);
  const [period, setPeriod] = useState('week'); // 'day', 'week', 'month', 'year'

  useEffect(() => {
    const fetchKpis = async () => {
      if (!token) {
        setKpiLoading(false);
        return;
      }
      try {
        setKpiLoading(true);
        setKpiError(null);
        const response = await fetch(`${API_URL}/dashboard/kpis?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch KPIs');
        }
        const data = await response.json();
        setKpis(data);
      } catch (error) {
        console.error("Error fetching KPIs:", error);
        setKpiError(error.message);
      } finally {
        setKpiLoading(false);
      }
    };
    fetchKpis();
  }, [token, period]);

  // Helper to format movement data
  const formatMovementSummary = (movements) => {
    const inData = movements?.find(m => m._id === 'in');
    const outData = movements?.find(m => m._id === 'out');
    return {
      in: inData ? inData.totalQuantity : 0,
      out: outData ? outData.totalQuantity : 0
    };
  };

  // Get movement data
  const dailyMovements = kpis ? formatMovementSummary(kpis.dailyMovements || []) : { in: 0, out: 0 };
  const weeklyMovements = kpis ? formatMovementSummary(kpis.weeklyMovements || []) : { in: 0, out: 0 };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name || user.email}. Here's an overview of your inventory.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={period === 'day' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('day')}
          >
            Day
          </Button>
          <Button 
            variant={period === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('week')}
          >
            Week
          </Button>
          <Button 
            variant={period === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* KPIs Display Section */}
      {kpiLoading ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      ) : kpiError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-sm font-medium text-red-600">Error loading metrics: {kpiError}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <KpiCard 
            title="Total Products" 
            value={kpis?.totalProducts ?? 0} 
            icon={Package}
            // Sample change value - replace with actual data when available
            change={5.2}
          />
          <KpiCard 
            title="Total Stock Quantity" 
            value={kpis?.totalStockQuantity ?? 0} 
            icon={BarChart}
            // Sample change value - replace with actual data when available
            change={-2.1}
            variant={kpis?.lowStockProductsCount > 5 ? "warning" : "default"}
          />
          <KpiCard 
            title="Low Stock Alerts" 
            value={kpis?.lowStockProductsCount ?? 0} 
            icon={AlertTriangle}
            variant={kpis?.lowStockProductsCount > 0 ? "danger" : "default"}
          />
          <KpiCard 
            title="Stock In/Out" 
            value={`${dailyMovements.in}/${dailyMovements.out}`} 
            unit="units"
            icon={dailyMovements.in >= dailyMovements.out ? TrendingUp : TrendingDown}
            variant={dailyMovements.in >= dailyMovements.out ? "success" : "info"}
          />
        </div>
      )}
      
      {/* Role-specific Panels */}
      <div className="mt-8">
        {user.role === 'admin' && <AdminDashboard kpis={kpis} />}
        {user.role === 'stock_manager' && <StockManagerDashboard kpis={kpis} />}
        {user.role === 'accountant' && <AccountantDashboard kpis={kpis} />}
      </div>
    </div>
  );
} 
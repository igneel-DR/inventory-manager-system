import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Info, RefreshCcw, DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function InventoryValueChart() {
  const { token, user } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trend, setTrend] = useState({ direction: null, percentage: 0 });
  const [singleDayData, setSingleDayData] = useState(false);
  const [chartType, setChartType] = useState('area'); // 'area' or 'line'
  
  // Only allow admin and accountant roles
  const canAccessChart = user && (user.role === 'admin' || user.role === 'accountant');

  const fetchChartData = async () => {
    if (!token || !canAccessChart) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/dashboard/charts/inventory-value`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch chart data');
      }
      
      const data = await response.json();
      
      // Check if we have only one unique date
      const uniqueDates = new Set(data.labels);
      if (uniqueDates.size === 1) {
        setSingleDayData(true);
      } else {
        setSingleDayData(false);
      }
      
      // Transform the data for the recharts format
      const formattedData = data.labels.map((date, index) => ({
        date,
        fullDate: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        value: data.datasets[0]?.data?.[index] || 0,
        formattedValue: formatCurrency(data.datasets[0]?.data?.[index] || 0)
      }));
      
      // Filter out days with zero value (though this is unlikely)
      const filteredData = formattedData.filter(item => item.value > 0);
      
      // If no data with value, use the original data
      setChartData(filteredData.length > 0 ? filteredData : formattedData);
      
      // Calculate trend only if we have meaningful data
      if (filteredData.length >= 2) {
        const firstValue = filteredData[0].value;
        const lastValue = filteredData[filteredData.length - 1].value;
        const trendChange = ((lastValue - firstValue) / Math.abs(firstValue || 1)) * 100;
        
        setTrend({
          direction: trendChange >= 0 ? 'up' : 'down',
          percentage: Math.abs(trendChange).toFixed(1)
        });
      } else if (filteredData.length === 1) {
        // When only one day has data, show the value
        setTrend({
          direction: 'up',
          percentage: 'N/A'
        });
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchChartData();
  }, [token, canAccessChart]);

  // Chart configuration
  const chartConfig = {
    value: {
      label: "Inventory Value",
      color: "hsl(262.1, 83.3%, 57.8%)" // Purple color
    },
  };

  // Get date range for the footer
  const getDateRange = () => {
    if (!chartData || chartData.length === 0) return "No data available";
    if (chartData.length === 1 || singleDayData) return chartData[0].fullDate;
    
    return `${chartData[0].fullDate} - ${chartData[chartData.length - 1].fullDate}`;
  };
  
  const handleRefresh = () => {
    fetchChartData();
  };
  
  const toggleChartType = () => {
    setChartType(chartType === 'area' ? 'line' : 'area');
  };

  if (!canAccessChart) {
    return null; // Don't render anything for unauthorized users
  }

  if (loading) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Inventory Value Trend</CardTitle>
            <CardDescription>
              Total inventory value
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Inventory Value Trend</CardTitle>
            <CardDescription>
              Total inventory value
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-red-500">Error loading chart: {error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the current inventory value (last value in the dataset)
  const currentValue = chartData && chartData.length > 0 
    ? chartData[chartData.length - 1].value 
    : 0;
    
  // Get the min and max values for the dataset
  const minValue = chartData ? Math.min(...chartData.map(item => item.value)) : 0;
  const maxValue = chartData ? Math.max(...chartData.map(item => item.value)) : 0;
  
  const valueChange = maxValue - minValue;
  const valueChangePercentage = minValue > 0 
    ? ((maxValue - minValue) / minValue * 100).toFixed(1) 
    : 0;
  
  const renderAreaChart = () => (
    <AreaChart
      data={chartData}
      margin={{
        top: 5,
        right: 10,
        left: 10,
        bottom: 0,
      }}
    >
      <defs>
        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0.1}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
      <XAxis 
        dataKey="date" 
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => {
          // Format date as MM/DD
          const date = new Date(value);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }}
        className="text-xs text-muted-foreground"
      />
      <YAxis 
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => `$${(value / 100).toFixed(0)}k`}
        className="text-xs text-muted-foreground"
      />
      <ChartTooltip
        cursor={false}
        formatter={(value) => [`${formatCurrency(value)}`, "Value"]}
        content={<ChartTooltipContent indicator="dot" />}
      />
      <Area
        type="monotone"
        dataKey="value"
        name="Inventory Value"
        stroke={chartConfig.value.color}
        fillOpacity={0.3}
        fill="url(#colorValue)"
      />
      <Legend />
    </AreaChart>
  );
  
  const renderLineChart = () => (
    <LineChart
      data={chartData}
      margin={{
        top: 5,
        right: 10,
        left: 10,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
      <XAxis 
        dataKey="date" 
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => {
          // Format date as MM/DD
          const date = new Date(value);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }}
        className="text-xs text-muted-foreground"
      />
      <YAxis 
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => `$${(value / 100).toFixed(0)}k`}
        className="text-xs text-muted-foreground"
      />
      <ChartTooltip
        cursor={{ stroke: 'rgba(0, 0, 0, 0.15)', strokeWidth: 1 }}
        formatter={(value) => [`${formatCurrency(value)}`, "Value"]}
        content={<ChartTooltipContent indicator="dot" />}
      />
      <Line
        type="monotone"
        dataKey="value"
        name="Inventory Value"
        stroke={chartConfig.value.color}
        strokeWidth={2}
        dot={true}
        activeDot={{ r: 6 }}
      />
      <Legend />
    </LineChart>
  );

  return (
    <Card className="col-span-1 md:col-span-2 w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">Inventory Value Trend</CardTitle>
          <CardDescription>
            Total inventory value
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={toggleChartType}>
            {chartType === 'area' ? 'Line Chart' : 'Area Chart'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData && chartData.length > 0 ? (
          <>
            <ChartContainer config={chartConfig}>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? renderAreaChart() : renderLineChart()}
                </ResponsiveContainer>
              </div>
            </ChartContainer>
            
            {/* Value summary */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                <div className="font-medium">Current Value</div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(currentValue)}
                </div>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="font-medium">Minimum Value</div>
                <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                  {formatCurrency(minValue)}
                </div>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                <div className="font-medium">Maximum Value</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(maxValue)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Info className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No value data available</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      {chartData && chartData.length > 0 && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              {trend.direction && !singleDayData && trend.percentage !== 'N/A' && (
                <div className="flex items-center gap-2 font-medium leading-none">
                  {trend.direction === 'up' ? (
                    <>
                      Trending up by {trend.percentage}% <TrendingUp className="h-4 w-4 text-green-500" />
                    </>
                  ) : (
                    <>
                      Trending down by {trend.percentage}% <TrendingDown className="h-4 w-4 text-red-500" />
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                {getDateRange()}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 
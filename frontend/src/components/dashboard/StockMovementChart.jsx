"use client"

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Info, RefreshCcw, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Bar, BarChart } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function StockMovementChart() {
  const { token } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [singleDayData, setSingleDayData] = useState(false);
  const [chartType, setChartType] = useState('area'); // 'area' or 'bar'
  
  // Summary statistics
  const [totalStockIn, setTotalStockIn] = useState(0);
  const [totalStockOut, setTotalStockOut] = useState(0);
  const [netChange, setNetChange] = useState(0);

  const fetchChartData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/dashboard/charts/stock-movements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch chart data');
      }
      
      const data = await response.json();
      
      // Check if we have only one unique date with non-zero data
      const uniqueDatesWithData = new Set();
      data.labels.forEach((date, index) => {
        if (data.datasets[0].data[index] > 0 || data.datasets[1].data[index] > 0) {
          uniqueDatesWithData.add(date);
        }
      });
      
      setSingleDayData(uniqueDatesWithData.size <= 1);
      
      // Calculate totals
      let stockInTotal = 0;
      let stockOutTotal = 0;
      
      data.datasets[0].data.forEach(value => {
        stockInTotal += value;
      });
      
      data.datasets[1].data.forEach(value => {
        stockOutTotal += value;
      });
      
      setTotalStockIn(stockInTotal);
      setTotalStockOut(stockOutTotal);
      setNetChange(stockInTotal - stockOutTotal);
      
      // Transform the data for recharts format
      const formattedData = data.labels.map((date, index) => ({
        date,
        fullDate: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        stockIn: data.datasets[0].data[index] || 0,
        stockOut: data.datasets[1].data[index] || 0
      }));
      
      setChartData(formattedData);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchChartData();
  }, [token]);

  // Chart configuration
  const chartConfig = {
    stockIn: {
      label: "Stock In",
      color: "#22c55e" // Green color
    },
    stockOut: {
      label: "Stock Out",
      color: "#ef4444" // Red color
    }
  };
  
  const handleRefresh = () => {
    fetchChartData();
  };
  
  const toggleChartType = () => {
    setChartType(chartType === 'area' ? 'bar' : 'area');
  };

  if (loading) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Stock Movement</CardTitle>
            <CardDescription>
              Daily stock in/out movement
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
            <CardTitle className="text-base">Stock Movement</CardTitle>
            <CardDescription>
              Daily stock in/out movement
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
  
  // Get date range for the footer
  const getDateRange = () => {
    if (!chartData || chartData.length === 0) return "No data available";
    if (chartData.length === 1 || singleDayData) return chartData[0].fullDate;
    
    return `${chartData[0].fullDate} - ${chartData[chartData.length - 1].fullDate}`;
  };
  
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
        <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
        </linearGradient>
        <linearGradient id="colorStockOut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
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
        className="text-xs text-muted-foreground"
      />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent indicator="dot" />}
      />
      <Area
        type="monotone"
        dataKey="stockIn"
        name="Stock In"
        stroke={chartConfig.stockIn.color}
        fillOpacity={0.3}
        fill="url(#colorStockIn)"
      />
      <Area
        type="monotone"
        dataKey="stockOut"
        name="Stock Out"
        stroke={chartConfig.stockOut.color}
        fillOpacity={0.3}
        fill="url(#colorStockOut)"
      />
      <Legend />
    </AreaChart>
  );
  
  const renderBarChart = () => (
    <BarChart
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
        className="text-xs text-muted-foreground"
      />
      <ChartTooltip
        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
        content={<ChartTooltipContent indicator="square" />}
      />
      <Bar
        dataKey="stockIn"
        name="Stock In"
        fill={chartConfig.stockIn.color}
        radius={[4, 4, 0, 0]}
      />
      <Bar
        dataKey="stockOut"
        name="Stock Out"
        fill={chartConfig.stockOut.color}
        radius={[4, 4, 0, 0]}
      />
      <Legend />
    </BarChart>
  );

  return (
    <Card className="col-span-1 md:col-span-2 w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">Stock Movement</CardTitle>
          <CardDescription>
            Daily stock in/out movement
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={toggleChartType}>
            {chartType === 'area' ? 'Bar Chart' : 'Area Chart'}
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
                  {chartType === 'area' ? renderAreaChart() : renderBarChart()}
                </ResponsiveContainer>
              </div>
            </ChartContainer>
            
            {/* Summary */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center p-2 rounded-lg bg-green-50 dark:bg-green-950">
                <div className="font-medium">Stock In</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center">
                  {totalStockIn}
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </div>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-red-50 dark:bg-red-950">
                <div className="font-medium">Stock Out</div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center">
                  {totalStockOut}
                  <ArrowDownRight className="h-4 w-4 ml-1" />
                </div>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="font-medium">Net Change</div>
                <div className={`text-lg font-bold flex items-center ${netChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {netChange}
                  {netChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 ml-1" />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Info className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No stock movement data available</p>
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
            <div className="grid gap-1">
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

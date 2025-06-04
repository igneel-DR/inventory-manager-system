import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  RefreshCw, 
  Calendar,
  AlertTriangle,
  ShoppingCart,
  Archive,
  DollarSign,
  BarChart3
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Import the libraries for PDF and Excel export
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const reportTypes = [
  { id: 'low-stock', name: 'Low Stock Products', icon: AlertTriangle },
  { id: 'expiry', name: 'Expired & Near-Expiry Items', icon: Calendar },
  { id: 'movements', name: 'Product Movements', icon: ShoppingCart },
  { id: 'inventory', name: 'Inventory Valuation', icon: Archive },
  { id: 'sales', name: 'Sales Report', icon: DollarSign }
];

export default function ReportsPage() {
  const { token, user } = useAuth();
  const [reportType, setReportType] = useState('low-stock');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  
  // Filter states
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [category, setCategory] = useState('all');
  const [supplier, setSupplier] = useState('all');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load categories and suppliers for filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch(`${API_URL}/categories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
        
        // Fetch suppliers
        const suppliersResponse = await fetch(`${API_URL}/suppliers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json();
          setSuppliers(suppliersData);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
        toast.error('Failed to load filter options');
      }
    };
    
    if (token) {
      fetchFilterOptions();
    }
  }, [token]);
  
  // Generate report based on selected type and filters
  const generateReport = async () => {
    setLoading(true);
    
    try {
      // Construct the query parameters based on filters
      const params = new URLSearchParams();
      
      if (dateRange.from) {
        params.append('startDate', dateRange.from.toISOString());
      }
      
      if (dateRange.to) {
        params.append('endDate', dateRange.to.toISOString());
      }
      
      if (category && category !== 'all') {
        params.append('category', category);
      }
      
      if (supplier && supplier !== 'all') {
        params.append('supplier', supplier);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      // Determine the endpoint based on report type
      let endpoint;
      
      switch (reportType) {
        case 'low-stock':
          endpoint = `${API_URL}/reports/low-stock`;
          break;
        case 'expiry':
          endpoint = `${API_URL}/reports/expiry`;
          break;
        case 'movements':
          endpoint = `${API_URL}/reports/movements`;
          break;
        case 'inventory':
          endpoint = `${API_URL}/reports/inventory-valuation`;
          break;
        case 'sales':
          endpoint = `${API_URL}/reports/sales`;
          break;
        default:
          endpoint = `${API_URL}/reports/low-stock`;
      }
      
      try {
        const response = await fetch(`${endpoint}?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to generate report: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle different response structures based on report type
        if (reportType === 'inventory') {
          setReportData(data.products || []);
        } else if (reportType === 'sales') {
          setReportData(data.sales || []);
        } else {
          setReportData(data || []);
        }
        
        toast.success('Report generated successfully');
      } catch (error) {
        console.error('API Error:', error);
        // Fall back to mock data if API call fails
        //setReportData(generateMockData(reportType));
        toast.warning('Using mock data - backend connection issue');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    const reportTitle = reportTypes.find(r => r.id === reportType)?.name || 'Report';
    doc.setFontSize(18);
    doc.text(reportTitle, 14, 22);
    
    // Add timestamp
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Create the table
    const columns = getColumnsForReportType(reportType);
    const rows = reportData.map(item => {
      return columns.map(col => {
        // Format cell values for PDF
        if (col.key === 'expirationDate' || col.key === 'date') {
          return item[col.key] ? new Date(item[col.key]).toLocaleDateString() : '';
        } else if (col.key === 'type') {
          return item[col.key] === 'in' ? 'Stock In' : 'Stock Out';
        } else if (col.key === 'unitPrice' || col.key === 'totalValue' || col.key === 'totalAmount') {
          return item[col.key] !== undefined ? `$${Number(item[col.key]).toFixed(2)}` : '';
        } else if (col.key === 'daysUntilExpiry') {
          return `${item[col.key]} days`;
        }
        return item[col.key] !== undefined ? item[col.key].toString() : '';
      });
    });
    
    doc.autoTable({
      startY: 40,
      head: [columns.map(col => col.label)],
      body: rows,
      theme: 'grid',
      styles: { overflow: 'linebreak', cellWidth: 'wrap' },
      columnStyles: {
        0: { cellWidth: 20 },
      },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold' 
      },
    });
    
    // Save the PDF
    doc.save(`${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success('PDF exported successfully');
  };
  
  // Export to Excel
  const exportToExcel = () => {
    const columns = getColumnsForReportType(reportType);
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(
      reportData.map(item => {
        const row = {};
        columns.forEach(col => {
          // Format cell values for Excel
          if (col.key === 'expirationDate' || col.key === 'date') {
            row[col.label] = item[col.key] ? new Date(item[col.key]).toLocaleDateString() : '';
          } else if (col.key === 'type') {
            row[col.label] = item[col.key] === 'in' ? 'Stock In' : 'Stock Out';
          } else if (col.key === 'unitPrice' || col.key === 'totalValue' || col.key === 'totalAmount') {
            row[col.label] = item[col.key] !== undefined ? Number(item[col.key]).toFixed(2) : '';
          } else {
            row[col.label] = item[col.key] !== undefined ? item[col.key] : '';
          }
        });
        return row;
      })
    );
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    const reportTitle = reportTypes.find(r => r.id === reportType)?.name || 'Report';
    XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);
    
    // Save to file
    XLSX.writeFile(workbook, `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success('Excel file exported successfully');
  };
  
  // Helper to get columns based on report type
  const getColumnsForReportType = (type) => {
    switch (type) {
      case 'low-stock':
        return [
          { key: 'name', label: 'Product Name' },
          { key: 'category', label: 'Category' },
          { key: 'currentQuantity', label: 'Current Qty' },
          { key: 'minimumStockLevel', label: 'Min Stock Level' },
          { key: 'supplier', label: 'Supplier' }
        ];
      case 'expiry':
        return [
          { key: 'name', label: 'Product Name' },
          { key: 'category', label: 'Category' },
          { key: 'expirationDate', label: 'Expiration Date' },
          { key: 'daysUntilExpiry', label: 'Days Until Expiry' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'supplier', label: 'Supplier' }
        ];
      case 'movements':
        return [
          { key: 'date', label: 'Date' },
          { key: 'productName', label: 'Product' },
          { key: 'type', label: 'Type' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'user', label: 'User' },
          { key: 'notes', label: 'Notes' }
        ];
      case 'inventory':
        return [
          { key: 'name', label: 'Product Name' },
          { key: 'category', label: 'Category' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'unitPrice', label: 'Unit Price' },
          { key: 'totalValue', label: 'Total Value' },
          { key: 'supplier', label: 'Supplier' }
        ];
      case 'sales':
        return [
          { key: 'date', label: 'Date' },
          { key: 'productName', label: 'Product' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'unitPrice', label: 'Unit Price' },
          { key: 'totalAmount', label: 'Total Amount' },
          { key: 'customer', label: 'Customer' }
        ];
      default:
        return [];
    }
  };
  
  // Helper to render the table based on report type
  const renderReportTable = () => {
    if (!reportData.length) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No report data</h3>
          <p className="text-sm text-muted-foreground">
            Generate a report to see results here
          </p>
        </div>
      );
    }
    
    const columns = getColumnsForReportType(reportType);
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((item, index) => (
              <TableRow key={item.id || index}>
                {columns.map((col) => (
                  <TableCell key={`${item.id || index}-${col.key}`}>
                    {renderCellContent(item, col.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Helper to format cell content based on the key
  const renderCellContent = (item, key) => {
    if (key === 'expirationDate' || key === 'date') {
      return new Date(item[key]).toLocaleDateString();
    } else if (key === 'type') {
      return (
        <Badge variant={item[key] === 'in' ? 'success' : 'destructive'}>
          {item[key] === 'in' ? 'Stock In' : 'Stock Out'}
        </Badge>
      );
    } else if (key === 'unitPrice' || key === 'totalValue' || key === 'totalAmount') {
      return `$${Number(item[key]).toFixed(2)}`;
    } else if (key === 'daysUntilExpiry') {
      return (
        <Badge variant={item[key] <= 5 ? 'destructive' : 'warning'}>
          {item[key]} days
        </Badge>
      );
    }
    
    return item[key];
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Reports</CardTitle>
              <CardDescription>Generate and export inventory reports</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={exportToPDF} 
                disabled={!reportData.length || loading}
              >
                <FileText className="w-4 h-4 mr-2" /> Export PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={exportToExcel} 
                disabled={!reportData.length || loading}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Report Type Selection */}
          <div className="mb-6">
            <Tabs value={reportType} onValueChange={setReportType} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 mb-4 md:inline-flex">
                {reportTypes.map((type) => (
                  <TabsTrigger key={type.id} value={type.id} className="flex items-center">
                    <type.icon className="w-4 h-4 mr-2" /> 
                    <span className="hidden sm:inline">{type.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Filter Section */}
              <div className="bg-muted/50 p-4 rounded-md mb-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Date Range</label>
                    <DateRangePicker 
                      value={dateRange} 
                      onChange={setDateRange}
                      className="w-full"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select value={category} onValueChange={setCategory} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Supplier</label>
                    <Select value={supplier} onValueChange={setSupplier} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        {suppliers.map((sup) => (
                          <SelectItem key={sup._id} value={sup._id}>
                            {sup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button onClick={generateReport} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" /> Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Report Content */}
              <TabsContent value={reportType} className="mt-0">
                {renderReportTable()}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {reportData.length ? `${reportData.length} items found` : 'No data available'}
          </div>
          <div className="text-sm text-muted-foreground">
            Generated on {new Date().toLocaleString()}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 
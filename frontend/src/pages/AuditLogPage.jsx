import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  ClipboardList,
  RefreshCw,
  Filter,
  Search,
  FileSpreadsheet,
  Clock,
  User as UserIcon,
  Database
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Action types for filtering
const actionTypes = [
  { value: 'CREATE', label: 'Create' },
  { value: 'READ', label: 'Read' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' }
];

// Entity types for filtering
const entityTypes = [
  { value: 'product', label: 'Product' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'category', label: 'Category' },
  { value: 'stock', label: 'Stock Movement' },
  { value: 'user', label: 'User' },
  { value: 'setting', label: 'Setting' }
];

const AuditLogPage = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    action: 'all',
    entityType: 'all',
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      to: new Date()
    }
  });
  
  // Load audit logs based on filters and pagination
  useEffect(() => {
    const fetchAuditLogs = async () => {
      // Only admins should be able to view audit logs
      if (!token || user?.role !== 'admin') return;
      
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', pagination.page);
        params.append('limit', pagination.limit);
        
        if (filters.search) {
          params.append('search', filters.search);
        }
        
        if (filters.action && filters.action !== 'all') {
          params.append('action', filters.action);
        }
        
        if (filters.entityType && filters.entityType !== 'all') {
          params.append('entityType', filters.entityType);
        }
        
        if (filters.dateRange.from) {
          params.append('startDate', filters.dateRange.from.toISOString());
        }
        
        if (filters.dateRange.to) {
          params.append('endDate', filters.dateRange.to.toISOString());
        }
        
        // Make API call
        const response = await fetch(`${API_URL}/audit-logs?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch audit logs');
        }
        
        const data = await response.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuditLogs();
  }, [token, user?.role, pagination.page, pagination.limit, filters]);
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle date range change
  const handleDateRangeChange = (dateRange) => {
    setFilters(prev => ({ ...prev, dateRange }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      action: 'all',
      entityType: 'all',
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  // Export to Excel (simplified version - placeholder)
  const exportToExcel = () => {
    toast.info('Export functionality would be implemented here');
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get badge style based on action
  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="success">{action}</Badge>;
      case 'UPDATE':
        return <Badge variant="warning">{action}</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">{action}</Badge>;
      case 'READ':
        return <Badge variant="outline">{action}</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };
  
  // Access check - only allow admins
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view the audit trail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This page is only accessible to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Audit Trail</CardTitle>
              <CardDescription>View system activities and changes</CardDescription>
            </div>
            <div>
              <Button variant="outline" onClick={exportToExcel} disabled={loading || !logs.length}>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="bg-muted/50 p-4 rounded-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <DateRangePicker
                  value={filters.dateRange}
                  onChange={handleDateRangeChange}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Action</label>
                <Select 
                  value={filters.action} 
                  onValueChange={(value) => handleFilterChange('action', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {actionTypes.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Entity Type</label>
                <Select
                  value={filters.entityType}
                  onValueChange={(value) => handleFilterChange('entityType', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    {entityTypes.map((entity) => (
                      <SelectItem key={entity.value} value={entity.value}>
                        {entity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search description..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {!loading && logs.length > 0
                  ? `Showing ${logs.length} of ${pagination.total} entries`
                  : 'No logs found'
                }
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetFilters} disabled={loading}>
                  <Filter className="w-4 h-4 mr-2" /> Reset Filters
                </Button>
                <Button variant="default" size="sm" onClick={() => handlePageChange(1)} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Logs Table */}
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No audit logs found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> Date/Time
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" /> User
                      </div>
                    </TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <Database className="w-4 h-4 mr-1" /> Entity Type
                      </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        {log.user?.name || log.user?.email || 'Unknown User'}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="capitalize">{log.entityType}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="text-sm text-muted-foreground border-t pt-4">
          The audit trail records all significant actions performed in the system.
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuditLogPage; 
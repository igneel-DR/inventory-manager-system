import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, FileText, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export function StockMovementTable({ stockMovements, loading, error }) {
  // Helper function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border bg-card">
        <div className="flex flex-col items-center gap-2 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading stock movements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Stock Movement History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements.length > 0 ? (
                stockMovements.map((movement) => (
                  <TableRow key={movement._id}>
                    <TableCell>
                      <div className="font-medium">
                        {movement.product ? movement.product.name : 'Unknown Product'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {movement.product?.productId || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {movement.movementType === 'in' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
                          <ArrowUpCircle className="mr-1 h-3 w-3" />
                          Stock In
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                          <ArrowDownCircle className="mr-1 h-3 w-3" />
                          Stock Out
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {movement.quantity}
                    </TableCell>
                    <TableCell>
                      {movement.reason || 'No reason provided'}
                    </TableCell>
                    <TableCell>
                      {formatDate(movement.movementDate)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No stock movements found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 
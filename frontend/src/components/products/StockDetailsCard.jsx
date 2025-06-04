import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function StockDetailsCard({ product }) {
  if (!product) return null;
  
  const isLowStock = product.isLowStock || (product.currentQuantity < product.minimumStockLevel);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-medium">
          <PackageOpen className="mr-2 h-5 w-5 text-muted-foreground" />
          Stock Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Quantity</span>
            <span className="font-semibold">{product.currentQuantity}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Minimum Stock Level</span>
            <span className="text-sm">{product.minimumStockLevel || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Stock Status</span>
            <div className="flex items-center gap-2">
              {isLowStock ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <Badge variant="destructive">Low Stock</Badge>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <Badge variant="success">In Stock</Badge>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Created: {new Date(product.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last Updated: {new Date(product.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
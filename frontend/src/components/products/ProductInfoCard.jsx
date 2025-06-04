import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, ClipboardList, FileText, DollarSign } from 'lucide-react';

export function ProductInfoCard({ product }) {
  if (!product) return null;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-medium">
          <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
          Product Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {product.description ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
          </div>
        ) : (
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">No description provided for this product.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Category</h3>
            <div className="flex items-center text-sm">
              <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{product.category ? product.category.name : 'Uncategorized'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Supplier</h3>
            <div className="flex items-center text-sm">
              <Building className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {product.supplier 
                  ? (product.supplier.name || product.supplier.companyName) 
                  : 'Not specified'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Price</h3>
            <div className="flex items-center text-sm">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {product.price 
                  ? `$${product.price.toFixed(2)}` 
                  : 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
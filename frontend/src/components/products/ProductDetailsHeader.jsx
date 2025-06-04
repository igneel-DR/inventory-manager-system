import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Package, Tag } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export function ProductDetailsHeader({ product }) {
  if (!product) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link 
          to="/products" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Products
        </Link>
      </div>
      
      <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Tag className="mr-1 h-3.5 w-3.5" />
              ID: {product.productId || product._id.substring(0, 8)}
            </div>
            {product.category && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center">
                  <Package className="mr-1 h-3.5 w-3.5" />
                  {product.category.name}
                </div>
              </>
            )}
            {product.expirationDate && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center" title={`Expires: ${new Date(product.expirationDate).toLocaleDateString()}`}>
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  Expires: {new Date(product.expirationDate).toLocaleDateString()}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:self-start">
          <Badge variant={product.isLowStock ? "destructive" : "success"} className="h-6 px-3">
            {product.isLowStock ? 'Low Stock' : 'In Stock'}
          </Badge>
        </div>
      </div>
    </div>
  );
} 
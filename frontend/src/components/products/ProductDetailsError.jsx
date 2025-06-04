import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function ProductDetailsError({ error }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link 
          to="/products" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Products
        </Link>
      </div>
      
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Error Loading Product</h2>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          {error || "There was a problem loading the product details. Please try again."}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button asChild size="sm">
            <Link to="/products">
              <Home className="mr-2 h-4 w-4" />
              Return to Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 
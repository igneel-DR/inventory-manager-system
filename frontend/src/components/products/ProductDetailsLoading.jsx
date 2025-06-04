import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export function ProductDetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-28 bg-muted/60 rounded animate-pulse"></div>
      
      <div className="space-y-3">
        <div className="h-8 w-2/3 bg-muted/60 rounded animate-pulse"></div>
        <div className="h-4 w-1/3 bg-muted/60 rounded animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 animate-pulse">
          <CardHeader className="pb-3">
            <div className="h-6 w-1/3 bg-muted/60 rounded"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-1/4 bg-muted/60 rounded"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted/60 rounded"></div>
                <div className="h-3 bg-muted/60 rounded"></div>
                <div className="h-3 w-2/3 bg-muted/60 rounded"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="h-4 w-1/3 bg-muted/60 rounded"></div>
                <div className="h-4 w-2/3 bg-muted/60 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-1/3 bg-muted/60 rounded"></div>
                <div className="h-4 w-2/3 bg-muted/60 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="h-6 w-1/2 bg-muted/60 rounded"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-1/3 bg-muted/60 rounded"></div>
                <div className="h-4 w-8 bg-muted/60 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-1/3 bg-muted/60 rounded"></div>
                <div className="h-4 w-8 bg-muted/60 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-1/3 bg-muted/60 rounded"></div>
                <div className="h-5 w-16 bg-muted/60 rounded-full"></div>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="h-3 w-2/3 bg-muted/60 rounded"></div>
              <div className="h-3 w-2/3 bg-muted/60 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading product details...</span>
      </div>
    </div>
  );
} 
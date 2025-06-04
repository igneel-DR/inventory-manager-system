import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, FileText, Edit, ExternalLink, Trash2 } from 'lucide-react';

export function ProductTable({ 
  products, 
  filteredProducts, 
  loading, 
  error, 
  handleEditClick, 
  handleDeleteClick,
  searchQuery,
  filterCategory,
  setSearchQuery,
  setFilterCategory
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border bg-card">
        <div className="flex flex-col items-center gap-2 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading products...</p>
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
        <div className="flex items-center justify-between">
          <CardTitle>Product Catalog</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Info</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Min. Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product._id} className="group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {product.productId || product._id.substring(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.category ? product.category.name : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {product.supplier ? (product.supplier.name || product.supplier.companyName) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {product.price ? `$${product.price.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.currentQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.minimumStockLevel}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isLowStock ? "destructive" : "success"}>
                        {product.isLowStock ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(product)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/products/${product._id}`)}>
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(product._id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No products found</p>
                      {(searchQuery || filterCategory !== 'all') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSearchQuery('');
                            setFilterCategory('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
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
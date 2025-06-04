import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EditProductModal({
  isOpen,
  setIsOpen,
  editingProduct,
  setEditingProduct,
  handleEditInputChange,
  handleEditSelectChange,
  handleUpdateProduct,
  loadingCategories,
  errorCategories,
  categories,
  loadingSuppliers,
  errorSuppliers,
  suppliers
}) {
  if (!editingProduct) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for {editingProduct.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdateProduct}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input id="edit-name" name="name" value={editingProduct.name} onChange={handleEditInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Input id="edit-description" name="description" value={editingProduct.description || ''} onChange={handleEditInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-productId" className="text-right">Product ID <span className="text-xs text-muted-foreground">(Optional)</span></Label>
              <Input id="edit-productId" name="productId" value={editingProduct.productId || ''} onChange={handleEditInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">Category</Label>
              <Select name="category" value={editingProduct.category} onValueChange={(value) => handleEditSelectChange("category", value)} disabled={loadingCategories}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {errorCategories && <p className="p-2 text-destructive text-sm">{errorCategories}</p>}
                  {!loadingCategories && categories.length === 0 && !errorCategories && <p className="p-2 text-sm text-muted-foreground">No categories found.</p>}
                  {categories.map((cat) => (<SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-supplier" className="text-right">Supplier</Label>
              <Select name="supplier" value={editingProduct.supplier} onValueChange={(value) => handleEditSelectChange("supplier", value)} disabled={loadingSuppliers}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={loadingSuppliers ? "Loading..." : "Select a supplier"} />
                </SelectTrigger>
                <SelectContent>
                  {errorSuppliers && <p className="p-2 text-destructive text-sm">{errorSuppliers}</p>}
                  {!loadingSuppliers && suppliers.length === 0 && !errorSuppliers && <p className="p-2 text-sm text-muted-foreground">No suppliers found.</p>}
                  {suppliers.map((sup) => (<SelectItem key={sup._id} value={sup._id}>{sup.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-currentQuantity" className="text-right">Quantity</Label>
              <Input id="edit-currentQuantity" name="currentQuantity" type="number" value={editingProduct.currentQuantity} onChange={handleEditInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-minimumStockLevel" className="text-right">Min. Stock</Label>
              <Input id="edit-minimumStockLevel" name="minimumStockLevel" type="number" value={editingProduct.minimumStockLevel} onChange={handleEditInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">Price ($)</Label>
              <Input 
                id="edit-price" 
                name="price" 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="0.00" 
                value={editingProduct.price || ''} 
                onChange={handleEditInputChange} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-expirationDate" className="text-right">Expiration Date</Label>
              <Input id="edit-expirationDate" name="expirationDate" type="date" value={editingProduct.expirationDate || ''} onChange={handleEditInputChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setIsOpen(false); setEditingProduct(null); }}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
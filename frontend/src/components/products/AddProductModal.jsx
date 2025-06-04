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

export function AddProductModal({
  isOpen,
  setIsOpen,
  newProductData,
  handleInputChange,
  handleSelectChange,
  handleAddNewProduct,
  loadingCategories,
  errorCategories,
  categories,
  loadingSuppliers,
  errorSuppliers,
  suppliers
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to the catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddNewProduct}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={newProductData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={newProductData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productId" className="text-right">
                Product ID <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="productId"
                name="productId"
                value={newProductData.productId}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                name="category"
                value={newProductData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
                disabled={loadingCategories}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {errorCategories && <p className="p-2 text-destructive text-sm">{errorCategories}</p>}
                  {!loadingCategories && categories.length === 0 && !errorCategories && <p className="p-2 text-sm text-muted-foreground">No categories found.</p>}
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}> 
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">
                Supplier
              </Label>
              <Select
                name="supplier"
                value={newProductData.supplier}
                onValueChange={(value) => handleSelectChange("supplier", value)}
                disabled={loadingSuppliers}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={loadingSuppliers ? "Loading..." : "Select a supplier"} />
                </SelectTrigger>
                <SelectContent>
                  {errorSuppliers && <p className="p-2 text-destructive text-sm">{errorSuppliers}</p>}
                  {!loadingSuppliers && suppliers.length === 0 && !errorSuppliers && <p className="p-2 text-sm text-muted-foreground">No suppliers found.</p>}
                  {suppliers.map((sup) => (
                    <SelectItem key={sup._id} value={sup._id}> 
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentQuantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="currentQuantity"
                name="currentQuantity"
                type="number"
                value={newProductData.currentQuantity}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minimumStockLevel" className="text-right">
                Min. Stock
              </Label>
              <Input
                id="minimumStockLevel"
                name="minimumStockLevel"
                type="number"
                value={newProductData.minimumStockLevel}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newProductData.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expirationDate" className="text-right">
                Expiration Date
              </Label>
              <Input
                id="expirationDate"
                name="expirationDate"
                type="date"
                value={newProductData.expirationDate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
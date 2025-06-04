import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export function AddStockMovementDialog({ isOpen, onClose, onAddStockMovement, products = [] }) {
  const [formData, setFormData] = useState({
    product: "",
    movementType: "",
    quantity: "",
    reason: "",
    movementDate: new Date().toISOString().split('T')[0], // Default to today
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const resetForm = () => {
    setFormData({
      product: "",
      movementType: "",
      quantity: "",
      reason: "",
      movementDate: new Date().toISOString().split('T')[0],
    });
    setIsSubmitting(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.product) {
      toast.error("Please select a product");
      return;
    }
    
    if (!formData.movementType) {
      toast.error("Please select a movement type");
      return;
    }
    
    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }
    
    if (!formData.movementDate) {
      toast.error("Please select a movement date");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await onAddStockMovement({
        product: formData.product,
        movementType: formData.movementType,
        quantity: formData.quantity,
        reason: formData.reason.trim() || undefined,
        movementDate: formData.movementDate
      });
      
      if (success) {
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Stock Movement</DialogTitle>
            <DialogDescription>
              Record a new inventory movement. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Product *
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.product} 
                  onValueChange={(value) => handleSelectChange("product", value)}
                  required
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No products found</div>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="movementType" className="text-right">
                Type *
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.movementType} 
                  onValueChange={(value) => handleSelectChange("movementType", value)}
                  required
                >
                  <SelectTrigger id="movementType">
                    <SelectValue placeholder="Select movement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">
                      <div className="flex items-center">
                        <ArrowUpCircle className="mr-2 h-4 w-4 text-green-600" />
                        Stock In
                      </div>
                    </SelectItem>
                    <SelectItem value="out">
                      <div className="flex items-center">
                        <ArrowDownCircle className="mr-2 h-4 w-4 text-blue-600" />
                        Stock Out
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity *
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="movementDate" className="text-right">
                Date *
              </Label>
              <Input
                id="movementDate"
                name="movementDate"
                type="date"
                value={formData.movementDate}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="reason" className="text-right pt-2">
                Reason
              </Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Explain the reason for this stock movement"
                className="col-span-3 h-20"
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Movement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
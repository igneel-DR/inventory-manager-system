import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from 'lucide-react';
import { cn } from "@/lib/utils";

// Import the extracted components
import { ProductTable } from '@/components/products/ProductTable';
import { SearchAndFilter } from '@/components/products/SearchAndFilter';
import { AddProductModal } from '@/components/products/AddProductModal';
import { EditProductModal } from '@/components/products/EditProductModal';
import { DeleteConfirmDialog } from '@/components/products/DeleteConfirmDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function ProductPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorSuppliers, setErrorSuppliers] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: "",
    description: "",
    productId: "",
    category: "",
    supplier: "",
    currentQuantity: 0,
    minimumStockLevel: 0,
    price: "",
    expirationDate: "",
  });
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);

  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // State for Delete Confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        setLoading(false);
        setError("Authentication token not found.");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) {
        setLoadingCategories(false);
        return;
      }
      try {
        setLoadingCategories(true);
        setErrorCategories(null);
        const response = await fetch(`${API_URL}/categories`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setErrorCategories(err.message);
        toast.error("Could not load categories: " + err.message);
      } finally {
        setLoadingCategories(false);
      }
    };
    if (isAddModalOpen || isEditModalOpen) { // Fetch only when a modal is opened
        fetchCategories();
    }
  }, [token, isAddModalOpen, isEditModalOpen]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!token) {
        setLoadingSuppliers(false);
        return;
      }
      try {
        setLoadingSuppliers(true);
        setErrorSuppliers(null);
        const response = await fetch(`${API_URL}/suppliers`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch suppliers');
        }
        const data = await response.json();
        setSuppliers(data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        setErrorSuppliers(err.message);
        toast.error("Could not load suppliers: " + err.message);
      } finally {
        setLoadingSuppliers(false);
      }
    };
    if (isAddModalOpen || isEditModalOpen) { // Fetch only when a modal is opened
        fetchSuppliers();
    }
  }, [token, isAddModalOpen, isEditModalOpen]);

  // Filter products based on search query and category
  useEffect(() => {
    let result = [...products];
    
    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) || 
        (product.productId && product.productId.toLowerCase().includes(lowerQuery)) ||
        (product.description && product.description.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Filter by category
    if (filterCategory && filterCategory !== 'all') {
      result = result.filter(product => product.category && product.category._id === filterCategory);
    }
    
    setFilteredProducts(result);
  }, [searchQuery, filterCategory, products]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setNewProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Input change handler for Edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Select change handler for Edit form
  const handleEditSelectChange = (name, value) => {
    setEditingProduct((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    // --- Start Validation ---
    if (!token) {
      toast.error("Authentication Error: You must be logged in.");
      return;
    }
    if (!newProductData.name.trim()) {
      toast.error("Validation Error: Product name is required.");
      return;
    }
    if (!newProductData.category) {
      toast.error("Validation Error: Please select a category.");
      return;
    }
    
    const currentQuantity = parseInt(newProductData.currentQuantity, 10);
    if (isNaN(currentQuantity) || currentQuantity < 0) {
      toast.error("Validation Error: Quantity must be a non-negative number.");
      return;
    }

    let minimumStockLevel = newProductData.minimumStockLevel !== null && newProductData.minimumStockLevel !== '' ? parseInt(newProductData.minimumStockLevel, 10) : 0;
    if (isNaN(minimumStockLevel) || minimumStockLevel < 0) {
      toast.error("Validation Error: Minimum Stock Level must be a non-negative number.");
      return;
    }
    
    let price = newProductData.price !== null && newProductData.price !== '' ? parseFloat(newProductData.price) : null;
    if (newProductData.price && (isNaN(price) || price < 0)) {
      toast.error("Validation Error: Price must be a non-negative number.");
      return;
    }
    
    if (newProductData.expirationDate && isNaN(new Date(newProductData.expirationDate).getTime())) {
        toast.error("Validation Error: Invalid Expiration Date.");
        return;
    }
    // --- End Validation ---

    const productDataPayload = {
      name: newProductData.name.trim(),
      description: newProductData.description.trim() || undefined,
      productId: newProductData.productId.trim() || undefined,
      category: newProductData.category,
      supplier: newProductData.supplier || undefined,
      initialQuantity: currentQuantity,
      minimumStockLevel: minimumStockLevel,
      price: price || undefined,
      expirationDate: newProductData.expirationDate || undefined,
    };

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productDataPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      const addedProduct = await response.json();

      // Add the new product to the existing list
      setProducts((prevProducts) => [addedProduct, ...prevProducts]);
      setIsAddModalOpen(false);
      toast.success("Product Added Successfully!");
      // Reset form
      setNewProductData({
        name: "",
        description: "",
        productId: "",
        category: "",
        supplier: "",
        currentQuantity: 0,
        minimumStockLevel: 0,
        price: "",
        expirationDate: "",
      });

    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("Error adding product:", err.message);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct({
      ...product,
      description: product.description || "",
      productId: product.productId || "",
      category: product.category?._id || "",
      supplier: product.supplier?._id || "",
      price: product.price || "",
      expirationDate: product.expirationDate ? new Date(product.expirationDate).toISOString().split('T')[0] : "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    // --- Start Validation ---
    if (!editingProduct || !editingProduct._id) {
      toast.error("Error: No product selected for editing.");
      return;
    }
    if (!token) {
      toast.error("Authentication Error: You must be logged in.");
      return;
    }
    if (!editingProduct.name.trim()) {
      toast.error("Validation Error: Product name is required.");
      return;
    }
    if (!editingProduct.category) {
      toast.error("Validation Error: Please select a category.");
      return;
    }

    const currentQuantity = parseInt(editingProduct.currentQuantity, 10);
    if (isNaN(currentQuantity) || currentQuantity < 0) {
      toast.error("Validation Error: Quantity must be a non-negative number.");
      return;
    }

    let minimumStockLevel = editingProduct.minimumStockLevel !== null && editingProduct.minimumStockLevel !== '' ? parseInt(editingProduct.minimumStockLevel, 10) : 0;
    if (isNaN(minimumStockLevel) || minimumStockLevel < 0) {
      toast.error("Validation Error: Minimum Stock Level must be a non-negative number.");
      return;
    }
    
    let price = editingProduct.price !== null && editingProduct.price !== '' ? parseFloat(editingProduct.price) : null;
    if (editingProduct.price && (isNaN(price) || price < 0)) {
      toast.error("Validation Error: Price must be a non-negative number.");
      return;
    }

    if (editingProduct.expirationDate && isNaN(new Date(editingProduct.expirationDate).getTime())) {
        toast.error("Validation Error: Invalid Expiration Date.");
        return;
    }
    // --- End Validation ---

    const { _id, category: categoryId, supplier: supplierId, ...updateData } = editingProduct;
    
    const productDataPayload = {
      name: updateData.name.trim(),
      description: updateData.description?.trim() || undefined,
      productId: updateData.productId?.trim() || undefined,
      category: categoryId,
      supplier: supplierId || undefined,
      currentQuantity: currentQuantity,
      minimumStockLevel: minimumStockLevel,
      price: price || undefined,
      expirationDate: updateData.expirationDate || undefined,
    };

    try {
      const response = await fetch(`${API_URL}/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productDataPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const updatedProduct = await response.json();

      setProducts((prevProducts) =>
        prevProducts.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
      setIsEditModalOpen(false);
      setEditingProduct(null);
      toast.success("Product Updated Successfully!");

    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Error updating product: " + err.message);
    }
  };

  const handleDeleteClick = (productId) => {
    setDeletingProductId(productId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) {
      toast.error("No product selected for deletion.");
      setIsDeleteConfirmOpen(false);
      return;
    }
    if (!token) {
      toast.error("You must be logged in to delete products.");
      setIsDeleteConfirmOpen(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${deletingProductId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      setProducts((prevProducts) =>
        prevProducts.filter((p) => p._id !== deletingProductId)
      );
      toast.success("Product Deleted Successfully!");

    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Error deleting product: " + err.message);
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your inventory and product catalog
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filter Tools */}
      <SearchAndFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
      />

      {/* Product Table */}
      <ProductTable 
        products={products}
        filteredProducts={filteredProducts}
        loading={loading}
        error={error}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
        searchQuery={searchQuery}
        filterCategory={filterCategory}
        setSearchQuery={setSearchQuery}
        setFilterCategory={setFilterCategory}
      />
      
      {/* Add Product Modal */}
      <AddProductModal 
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        newProductData={newProductData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleAddNewProduct={handleAddNewProduct}
        loadingCategories={loadingCategories}
        errorCategories={errorCategories}
        categories={categories}
        loadingSuppliers={loadingSuppliers}
        errorSuppliers={errorSuppliers}
        suppliers={suppliers}
      />

      {/* Edit Product Modal */}
      <EditProductModal 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        handleEditInputChange={handleEditInputChange}
        handleEditSelectChange={handleEditSelectChange}
        handleUpdateProduct={handleUpdateProduct}
        loadingCategories={loadingCategories}
        errorCategories={errorCategories}
        categories={categories}
        loadingSuppliers={loadingSuppliers}
        errorSuppliers={errorSuppliers}
        suppliers={suppliers}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        isOpen={isDeleteConfirmOpen}
        setIsOpen={setIsDeleteConfirmOpen}
        onCancel={() => setDeletingProductId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
} 
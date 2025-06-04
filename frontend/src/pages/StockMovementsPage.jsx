import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Filter } from 'lucide-react';

// Import components
import { StockMovementTable } from '@/components/stock-movements/StockMovementTable';
import { StockMovementFilters } from '@/components/stock-movements/StockMovementFilters';
import { AddStockMovementDialog } from '@/components/stock-movements/AddStockMovementDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function StockMovementsPage() {
  const { token } = useAuth();
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Products list for the dropdown
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Add movement dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch all stock movements (with optional filters)
  useEffect(() => {
    const fetchStockMovements = async () => {
      if (!token) {
        setLoading(false);
        setError("Authentication token not found.");
        return;
      }
      try {
        setLoading(true);
        setError(null);

        // Build query string with filters
        let queryParams = new URLSearchParams();
        
        // Only add filters that are not 'all' (which means no filter)
        if (filterProduct && filterProduct !== 'all') {
          queryParams.append('product', filterProduct);
        }
        
        if (filterType && filterType !== 'all') {
          queryParams.append('type', filterType);
        }
        
        if (filterStartDate) {
          queryParams.append('startDate', filterStartDate);
        }
        
        if (filterEndDate) {
          queryParams.append('endDate', filterEndDate);
        }
        
        const response = await fetch(`${API_URL}/stock-movements?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch stock movements');
        }
        
        const data = await response.json();
        setStockMovements(data);
      } catch (err) {
        console.error("Error fetching stock movements:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockMovements();
  }, [token, filterProduct, filterType, filterStartDate, filterEndDate]);

  // Fetch products for the filter dropdown and add dialog
  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) return;
      
      try {
        setLoadingProducts(true);
        const response = await fetch(`${API_URL}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("Could not load products for filter");
      } finally {
        setLoadingProducts(false);
      }
    };
    
    // Fetch products when filters are shown OR add dialog is opened
    if (showFilters || isAddDialogOpen) {
      fetchProducts();
    }
  }, [token, showFilters, isAddDialogOpen]);

  // Add new stock movement
  const handleAddStockMovement = async (movementData) => {
    if (!token) {
      toast.error("You must be logged in to add stock movements.");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/stock-movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(movementData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add stock movement');
      }
      
      const newMovement = await response.json();
      
      // Add the new movement to the list
      setStockMovements(prevMovements => [newMovement, ...prevMovements]);
      
      toast.success("Stock movement added successfully!");
      return true;
    } catch (err) {
      console.error("Error adding stock movement:", err);
      toast.error(err.message);
      return false;
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterProduct('all');
    setFilterType('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stock Movements</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage inventory movements
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Movement
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <StockMovementFilters 
          products={products}
          loadingProducts={loadingProducts}
          filterProduct={filterProduct}
          setFilterProduct={setFilterProduct}
          filterType={filterType}
          setFilterType={setFilterType}
          filterStartDate={filterStartDate}
          setFilterStartDate={setFilterStartDate}
          filterEndDate={filterEndDate}
          setFilterEndDate={setFilterEndDate}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Stock Movements Table */}
      <StockMovementTable 
        stockMovements={stockMovements}
        loading={loading}
        error={error}
      />
      
      {/* Add Stock Movement Dialog */}
      <AddStockMovementDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddStockMovement={handleAddStockMovement}
        products={products}
      />
    </div>
  );
} 
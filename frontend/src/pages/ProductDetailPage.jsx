import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Import our components
import { ProductDetailsHeader } from '@/components/products/ProductDetailsHeader';
import { ProductInfoCard } from '@/components/products/ProductInfoCard';
import { StockDetailsCard } from '@/components/products/StockDetailsCard';
import { ProductDetailsLoading } from '@/components/products/ProductDetailsLoading';
import { ProductDetailsError } from '@/components/products/ProductDetailsError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }
      if (!productId) {
        setError('Product ID not found in URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch product details');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, token]);

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <ProductDetailsLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-6">
        <ProductDetailsError error={error} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-8 p-6">
        <ProductDetailsError error="Product not found." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <ProductDetailsHeader product={product} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ProductInfoCard product={product} />
        </div>
        <div>
          <StockDetailsCard product={product} />
        </div>
      </div>
    </div>
  );
} 
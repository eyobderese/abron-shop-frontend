import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { api } from '../../lib/apiClient';
import CategoryBadge from '../ui/CategoryBadge';
import ImageGallery from '../ui/ImageGallery';
import { formatMoney, productCurrency } from '../../lib/currency';

export default function ProductDetailModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    api.get(`/products/${encodeURIComponent(productId)}`)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [productId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-lg font-semibold">Product Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !product ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-lg">Product not found or has been deleted.</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Image Gallery */}
            <div className="mb-6">
              <ImageGallery product={product} />
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CategoryBadge category={product.category} />
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.in_stock
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>

              {product.price != null && (
                <p className="text-xl font-bold text-primary">
                  {formatMoney(product.price, productCurrency(product))}
                </p>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created</h4>
                  <p className="text-sm text-gray-700">
                    {new Date(product.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                  <p className="text-sm text-gray-700">
                    {new Date(product.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

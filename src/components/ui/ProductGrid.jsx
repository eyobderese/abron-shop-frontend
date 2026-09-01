import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function ProductGrid({
  products,
  loading,
  emptyMessage = 'No products available.',
}) {
  if (loading) return <LoadingSpinner />;
  if (!products || products.length === 0)
    return <EmptyState message={emptyMessage} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

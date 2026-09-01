import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Menu } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { useAdminCategories, collectDescendantIds } from '../../hooks/useCategories';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ProductFormModal from '../../components/admin/ProductFormModal';
import CategoryBadge from '../../components/ui/CategoryBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCatId, setFilterCatId] = useState('all');
  const [modalProduct, setModalProduct] = useState(undefined);
  const { categories, tree } = useAdminCategories();

  const filterIds = useMemo(() => {
    if (filterCatId === 'all') return null;
    return collectDescendantIds(categories, filterCatId);
  }, [filterCatId, categories]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterIds?.length) params.set('categoryIds', filterIds.join(','));
      setProducts((await api.get(`/admin/products?${params}`)) ?? []);
    } catch (err) {
      toast.error(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCatId, categories.length]);

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`))
      return;

    try {
      await api.delete(`/admin/products/${encodeURIComponent(product.id)}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-bold uppercase tracking-wider">
              Products
            </h1>
          </div>
          <button
            onClick={() => setModalProduct(null)}
            className="bg-ink text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black flex items-center gap-2"
          >
            <Plus size={14} /> Add Product
          </button>
        </header>

        <div className="p-4 lg:p-8">
          {/* Filter */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Filter:
            </label>
            <select
              value={filterCatId}
              onChange={(e) => setFilterCatId(e.target.value)}
              className="border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-ink"
            >
              <option value="all">All categories</option>
              {tree.flatMap(function flat(node, depth = 0) {
                const items = [
                  <option key={node.id} value={node.id}>
                    {'— '.repeat(depth)}
                    {node.name_en}
                    {node.name_am ? ` · ${node.name_am}` : ''}
                  </option>,
                ];
                node.children?.forEach((c) =>
                  items.push(...flat(c, depth + 1))
                );
                return items;
              })}
            </select>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-ink-muted">
              <p className="text-sm">No products found.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Image
                      </th>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Name
                      </th>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Category
                      </th>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Price
                      </th>
                      <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Stock
                      </th>
                      <th className="py-2.5 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="w-12 h-12 overflow-hidden bg-gray-100">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-ink-muted text-xs">
                                N/A
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {product.brand && (
                            <p className="text-[10px] font-bold uppercase tracking-wider text-ink">
                              {product.brand}
                            </p>
                          )}
                          <p className="text-sm text-ink-soft">
                            {product.name}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <CategoryBadge category={product.categories} />
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {product.price != null ? (
                            <span className="font-semibold">
                              ${Number(product.price).toFixed(2)}
                            </span>
                          ) : (
                            '—'
                          )}
                          {product.was_price != null && (
                            <span className="text-xs text-ink-muted line-through ml-1">
                              ${Number(product.was_price).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              product.in_stock
                                ? 'text-emerald-600'
                                : 'text-sale'
                            }`}
                          >
                            {product.in_stock ? 'In Stock' : 'Out'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setModalProduct(product)}
                              className="p-1.5 text-ink-muted hover:bg-gray-100 hover:text-ink"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-1.5 text-ink-muted hover:bg-red-50 hover:text-sale"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalProduct !== undefined && (
        <ProductFormModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
}

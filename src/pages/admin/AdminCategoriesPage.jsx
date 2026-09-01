import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Menu,
  ChevronDown,
  ChevronRight,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { useAdminCategories } from '../../hooks/useCategories';
import AdminSidebar from '../../components/admin/AdminSidebar';
import CategoryFormModal from '../../components/admin/CategoryFormModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function TreeRow({ node, depth, onEdit, onDelete, onAddChild }) {
  const [open, setOpen] = useState(depth < 1);
  const hasKids = node.children?.length > 0;

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-2 pr-4" style={{ paddingLeft: 16 + depth * 20 }}>
          <div className="flex items-center gap-2">
            {hasKids ? (
              <button
                onClick={() => setOpen((v) => !v)}
                className="p-0.5 text-ink-muted hover:text-ink"
              >
                {open ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <span className="text-sm font-medium text-ink">{node.name_en}</span>
            {node.name_am && (
              <span className="font-amharic text-sm text-ink-muted">
                · {node.name_am}
              </span>
            )}
            {!node.is_active && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-gray-100 px-1.5 py-0.5">
                <EyeOff size={10} /> hidden
              </span>
            )}
          </div>
        </td>
        <td className="py-2 px-4 text-xs text-ink-muted">
          <code>/category/{node.slug}</code>
        </td>
        <td className="py-2 px-4 text-xs text-ink-muted">{node.sort_order}</td>
        <td className="py-2 px-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onAddChild(node)}
              className="p-1.5 text-ink-muted hover:bg-gray-100 hover:text-ink"
              title="Add child"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => onEdit(node)}
              className="p-1.5 text-ink-muted hover:bg-gray-100 hover:text-ink"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(node)}
              className="p-1.5 text-ink-muted hover:bg-red-50 hover:text-sale"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      {open &&
        node.children?.map((c) => (
          <TreeRow
            key={c.id}
            node={c}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
          />
        ))}
    </>
  );
}

export default function AdminCategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { categories, tree, loading, refetch } = useAdminCategories();
  const [modalState, setModalState] = useState(null);
  // modalState: null | {category?, defaultParentId?}

  async function handleDelete(cat) {
    const confirmed = window.confirm(
      `Delete "${cat.name_en}"? All descendant categories will also be deleted and products in them will be unassigned.`
    );
    if (!confirmed) return;
    try {
      await api.delete(`/admin/categories/${encodeURIComponent(cat.id)}`);
      toast.success('Category deleted');
      refetch();
    } catch (error) {
      toast.error(error.message);
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
              Categories
            </h1>
          </div>
          <button
            onClick={() => setModalState({})}
            className="bg-ink text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black flex items-center gap-2"
          >
            <Plus size={14} /> New Category
          </button>
        </header>

        <div className="p-4 lg:p-8">
          <p className="text-sm text-ink-muted mb-6 max-w-2xl">
            Organize your storefront into a tree. Drag not supported yet — use{' '}
            <strong>sort order</strong> and <strong>parent</strong> on each
            category to arrange them. Products are assigned to the leaf
            (deepest) category when you edit a product.
          </p>

          {loading ? (
            <LoadingSpinner />
          ) : categories.length === 0 ? (
            <div className="bg-white border border-gray-200 p-10 text-center">
              <p className="text-sm text-ink-muted mb-4">
                No categories yet. Create your first top-level category (e.g.
                Women, Men, Shoes).
              </p>
              <button
                onClick={() => setModalState({})}
                className="bg-ink text-white px-5 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Create First Category
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Category
                    </th>
                    <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Slug
                    </th>
                    <th className="text-left py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Order
                    </th>
                    <th className="py-2.5 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {tree.map((node) => (
                    <TreeRow
                      key={node.id}
                      node={node}
                      depth={0}
                      onEdit={(cat) => setModalState({ category: cat })}
                      onDelete={handleDelete}
                      onAddChild={(cat) =>
                        setModalState({ defaultParentId: cat.id })
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalState && (
        <CategoryFormModal
          category={modalState.category}
          defaultParentId={modalState.defaultParentId}
          tree={tree}
          onClose={() => setModalState(null)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

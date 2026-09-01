import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';

// Render a flat <option> list of the full tree, indented, while excluding a
// subtree (so you can't reparent a category under itself or a descendant).
function treeOptions(tree, excludeId = null, depth = 0, out = []) {
  for (const node of tree) {
    if (node.id === excludeId) continue;
    const second = node.name_am || node.name_or;
    out.push({
      id: node.id,
      label: `${'— '.repeat(depth)}${node.name_en}${second ? ` · ${second}` : ''}`,
    });
    if (node.children?.length) {
      treeOptions(node.children, excludeId, depth + 1, out);
    }
  }
  return out;
}

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoryFormModal({
  category,
  tree,
  defaultParentId = null,
  onClose,
  onSaved,
}) {
  const isEdit = !!category;
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(
    category?.image_url || null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: category
      ? {
          name_en: category.name_en,
          name_am: category.name_am || '',
          name_or: category.name_or || '',
          slug: category.slug,
          parent_id: category.parent_id || '',
          sort_order: category.sort_order ?? 0,
          is_active: category.is_active,
        }
      : {
          name_en: '',
          name_am: '',
          name_or: '',
          slug: '',
          parent_id: defaultParentId || '',
          sort_order: 0,
          is_active: true,
        },
  });

  const nameEn = watch('name_en');
  const slug = watch('slug');

  // Auto-suggest slug from name when creating and slug is still empty.
  if (!isEdit && nameEn && !slug) {
    setValue('slug', slugify(nameEn));
  }

  const options = treeOptions(tree, isEdit ? category?.id : null);

  const inputClass =
    'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink';

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      let imageUrl = existingImage;
      if (imageFile) {
        imageUrl = (await api.upload('/admin/media?folder=categories', imageFile)).url;
      }

      const payload = {
        name_en: data.name_en.trim(),
        name_am: data.name_am?.trim() || null,
        name_or: data.name_or?.trim() || null,
        slug: slugify(data.slug || data.name_en),
        parent_id: data.parent_id || null,
        sort_order: Number(data.sort_order) || 0,
        is_active: !!data.is_active,
        image_url: imageUrl,
      };

      if (isEdit) {
        await api.patch(`/admin/categories/${encodeURIComponent(category.id)}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', payload);
        toast.success('Category created');
      }

      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-base font-bold uppercase tracking-wider">
            {isEdit ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Name (English) *
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Women"
              {...register('name_en', { required: 'English name is required' })}
            />
            {errors.name_en && (
              <p className="text-sale text-xs mt-1">{errors.name_en.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Name (Amharic) · ስም
            </label>
            <input
              type="text"
              className={`${inputClass} font-amharic`}
              placeholder="ለምሳሌ፡ ሴቶች"
              {...register('name_am')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Name (Afaan Oromo) · Maqaa
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Fakkeenyaaf: Dubartoota"
              {...register('name_or')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Slug (URL) *
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="women-dresses"
              {...register('slug', {
                required: 'Slug is required',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Lowercase letters, numbers, and dashes only',
                },
              })}
            />
            {errors.slug && (
              <p className="text-sale text-xs mt-1">{errors.slug.message}</p>
            )}
            <p className="text-xs text-ink-muted mt-1">
              Used in the URL: /category/<code>{slug || 'your-slug'}</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Parent Category
            </label>
            <select className={inputClass} {...register('parent_id')}>
              <option value="">— None (top level) —</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Sort order
              </label>
              <input
                type="number"
                className={inputClass}
                {...register('sort_order')}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-ink"
                  {...register('is_active')}
                />
                <span className="text-sm">Active (visible to shoppers)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
              Tile image (optional)
            </label>
            {existingImage && (
              <div className="relative w-24 h-24 mb-2">
                <img
                  src={existingImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setExistingImage(null)}
                  className="absolute -top-1 -right-1 bg-sale text-white rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 p-4 cursor-pointer hover:border-ink">
              <Upload size={18} className="text-ink-muted" />
              <span className="text-sm text-ink-muted">
                {imageFile ? imageFile.name : 'Click to upload'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-ink text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-black disabled:opacity-50"
            >
              {submitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 text-ink px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

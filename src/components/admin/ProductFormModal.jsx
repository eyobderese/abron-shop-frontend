import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { X, Upload, ChevronUp, ChevronDown, Languages } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { useAdminCategories } from '../../hooks/useCategories';
import {
  VIEW_LABEL_OPTIONS,
  defaultViewLabel,
  getProductViews,
  viewsToPayload,
} from '../../lib/productViews';
import { DEFAULT_CURRENCY, PRODUCT_CURRENCIES } from '../../lib/currency';

function treeOptions(tree, depth = 0, out = []) {
  for (const node of tree) {
    const second = node.name_am || node.name_or;
    out.push({
      id: node.id,
      label: `${'— '.repeat(depth)}${node.name_en}${second ? ` · ${second}` : ''}`,
      isLeaf: !node.children?.length,
    });
    if (node.children?.length) treeOptions(node.children, depth + 1, out);
  }
  return out;
}

let viewKeyCounter = 0;
function nextKey() {
  viewKeyCounter += 1;
  return viewKeyCounter;
}

function initViews(product) {
  if (!product) return [];
  return getProductViews(product).map((v) => ({
    key: nextKey(),
    url: v.url,
    label: v.label,
    file: null,
  }));
}

async function uploadImageFile(file) {
  return (await api.upload('/admin/media?folder=products', file)).url;
}

export default function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [views, setViews] = useState(() => initViews(product));
  const { tree, loading: catsLoading } = useAdminCategories();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: product
      ? {
          name: product.name,
          name_am: product.name_am || '',
          name_or: product.name_or || '',
          description: product.description,
          description_am: product.description_am || '',
          description_or: product.description_or || '',
          category_id: product.category_id || '',
          brand: product.brand || '',
          price: product.price ?? '',
          was_price: product.was_price ?? '',
          currency: product.currency || DEFAULT_CURRENCY,
          in_stock: product.in_stock,
        }
      : {
          name: '',
          name_am: '',
          name_or: '',
          description: '',
          description_am: '',
          description_or: '',
          category_id: '',
          brand: '',
          price: '',
          was_price: '',
          currency: DEFAULT_CURRENCY,
          in_stock: true,
        },
  });

  const inputClass =
    'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink';
  const options = treeOptions(tree);

  function removeView(key) {
    setViews((prev) => prev.filter((v) => v.key !== key));
  }

  function updateViewLabel(key, label) {
    setViews((prev) =>
      prev.map((v) => (v.key === key ? { ...v, label } : v))
    );
  }

  function moveView(key, dir) {
    setViews((prev) => {
      const idx = prev.findIndex((v) => v.key === key);
      if (idx === -1) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  }

  function addFiles(files) {
    const list = Array.from(files);
    if (!list.length) return;
    setViews((prev) => [
      ...prev,
      ...list.map((file, i) => ({
        key: nextKey(),
        url: URL.createObjectURL(file),
        label: defaultViewLabel(prev.length + i),
        file,
      })),
    ]);
  }

  async function generateTranslationDrafts() {
    const name = getValues('name')?.trim();
    const description = getValues('description')?.trim();
    if (!name || !description) {
      toast.error('Enter the English name and description first.');
      return;
    }

    const translatedFields = [
      'name_am',
      'description_am',
      'name_or',
      'description_or',
    ];
    const hasExistingTranslation = translatedFields.some((field) =>
      getValues(field)?.trim(),
    );
    if (
      hasExistingTranslation &&
      !window.confirm(
        'Replace the existing Amharic and Afaan Oromo text with new drafts?',
      )
    ) {
      return;
    }

    setTranslating(true);
    try {
      const draft = await api.post('/admin/translations/product-draft', {
        name,
        description,
      });
      let populated = 0;
      for (const field of translatedFields) {
        if (typeof draft[field] === 'string' && draft[field].trim()) {
          setValue(field, draft[field], { shouldDirty: true, shouldValidate: true });
          populated += 1;
        }
      }
      if (!populated) throw new Error('No translation drafts were returned');

      if (draft.warnings?.length) {
        toast.error(draft.warnings.join('. '));
      } else {
        toast.success('Translation drafts generated. Please review them.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate translation drafts');
    } finally {
      setTranslating(false);
    }
  }

  async function onSubmit(data) {
    if (views.length === 0) {
      toast.error('Please add at least one product view (image).');
      return;
    }
    if (!data.category_id) {
      toast.error('Please pick a category.');
      return;
    }

    setSubmitting(true);
    try {
      const resolved = [];
      for (const view of views) {
        if (view.file) {
          const url = await uploadImageFile(view.file);
          resolved.push({ url, label: view.label });
        } else if (view.url) {
          resolved.push({ url: view.url, label: view.label });
        }
      }

      const { image_views, images } = viewsToPayload(resolved);

      const payload = {
        name: data.name,
        name_am: data.name_am?.trim() || null,
        name_or: data.name_or?.trim() || null,
        description: data.description,
        description_am: data.description_am?.trim() || null,
        description_or: data.description_or?.trim() || null,
        category_id: data.category_id,
        brand: data.brand?.trim() || null,
        price: data.price === '' ? null : Number(data.price),
        was_price: data.was_price === '' ? null : Number(data.was_price),
        currency: data.currency || DEFAULT_CURRENCY,
        in_stock: !!data.in_stock,
        image_views,
        images,
      };

      if (isEdit) {
        await api.patch(`/admin/products/${encodeURIComponent(product.id)}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created!');
      }

      onSaved();
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
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold uppercase tracking-wider">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100">
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
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-sale text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Brand
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Nike, Zara, Nordstrom…"
              {...register('brand')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Description (English) *
            </label>
            <textarea
              className={inputClass}
              rows={3}
              {...register('description', {
                required: 'Description is required',
              })}
            />
            {errors.description && (
              <p className="text-sale text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="border border-blue-200 bg-blue-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Translation drafts
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Generate Amharic and Afaan Oromo drafts from the English text.
                  Review and edit them before saving the product.
                </p>
              </div>
              <button
                type="button"
                onClick={generateTranslationDrafts}
                disabled={translating || submitting}
                className="inline-flex shrink-0 items-center justify-center gap-2 bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Languages size={16} />
                {translating ? 'Translating…' : 'Generate drafts'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Name (Amharic) · ስም
            </label>
            <input
              type="text"
              className={`${inputClass} font-amharic`}
              placeholder="በአማርኛ የምርት ስም"
              {...register('name_am')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Description (Amharic) · መግለጫ
            </label>
            <textarea
              className={`${inputClass} font-amharic`}
              rows={3}
              placeholder="በአማርኛ መግለጫ"
              {...register('description_am')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Name (Afaan Oromo) · Maqaa
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Maqaa oomishaa Afaan Oromoo"
              {...register('name_or')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Description (Afaan Oromo) · Ibsa
            </label>
            <textarea
              className={inputClass}
              rows={3}
              placeholder="Ibsa Afaan Oromoo"
              {...register('description_or')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Category *
            </label>
            {catsLoading ? (
              <p className="text-xs text-ink-muted">Loading categories…</p>
            ) : options.length === 0 ? (
              <p className="text-xs text-sale">
                No categories yet. Create one in{' '}
                <a href="/admin/categories" className="underline">
                  Categories
                </a>{' '}
                first.
              </p>
            ) : (
              <select
                className={inputClass}
                {...register('category_id', { required: true })}
              >
                <option value="">— Select —</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-ink-muted mt-1">
              Tip: assign to the most specific (leaf) category. Parent categories
              will still include it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Currency
              </label>
              <select className={inputClass} {...register('currency')}>
                {PRODUCT_CURRENCIES.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                placeholder="0.00"
                {...register('price')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Was price
              </label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                placeholder="Original price"
                {...register('was_price')}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="accent-ink"
              {...register('in_stock')}
            />
            <span className="text-sm">In stock</span>
          </label>

          {/* Product views */}
          <div className="border border-gray-200 p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider">
                Product Views *
              </label>
              <p className="text-xs text-ink-muted mt-1">
                Upload photos from different angles — front, back, side, detail,
                etc. Shoppers can switch between views on the product page.
              </p>
            </div>

            {views.length > 0 && (
              <ul className="space-y-2">
                {views.map((view, index) => (
                  <li
                    key={view.key}
                    className="flex items-center gap-3 bg-gray-50 p-2 border border-gray-100"
                  >
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-200 overflow-hidden">
                      <img
                        src={view.url}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <select
                      value={view.label}
                      onChange={(e) => updateViewLabel(view.key, e.target.value)}
                      className="flex-1 min-w-0 border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-ink"
                    >
                      {VIEW_LABEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.en}
                        </option>
                      ))}
                    </select>

                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveView(view.key, -1)}
                        className="p-1 hover:bg-gray-200 disabled:opacity-30"
                        aria-label="Move view up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={index === views.length - 1}
                        onClick={() => moveView(view.key, 1)}
                        className="p-1 hover:bg-gray-200 disabled:opacity-30"
                        aria-label="Move view down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeView(view.key)}
                      className="p-1.5 text-sale hover:bg-red-50"
                      aria-label="Remove view"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 p-4 cursor-pointer hover:border-ink">
              <Upload size={18} className="text-ink-muted" />
              <span className="text-sm text-ink-muted">
                {views.length ? 'Add another view' : 'Upload product views'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
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

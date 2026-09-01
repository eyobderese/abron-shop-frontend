import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/apiClient';
import { useAdminCategories } from '../../hooks/useCategories';

const PLACEMENTS = [
  { v: 'home_hero', l: 'Home — hero strip (below the big banner)' },
  { v: 'home_strip', l: 'Home — between product rows' },
  { v: 'category_top', l: 'Category — top of listing (pick a category)' },
];

async function uploadFile(file) {
  return (await api.upload('/admin/media?folder=ads', file)).url;
}

export default function AdFormModal({ ad, onClose, onSaved }) {
  const isEdit = !!ad;
  const [submitting, setSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const { tree, loading: catsLoading } = useAdminCategories();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: ad
      ? {
          title: ad.title,
          media_type: ad.media_type,
          placement: ad.placement,
          category_id: ad.category_id || '',
          link_url: ad.link_url || '',
          sort_order: ad.sort_order ?? 0,
          is_active: ad.is_active,
          starts_at: ad.starts_at ? ad.starts_at.slice(0, 16) : '',
          ends_at: ad.ends_at ? ad.ends_at.slice(0, 16) : '',
        }
      : {
          media_type: 'image',
          placement: 'home_hero',
          category_id: '',
          sort_order: 0,
          is_active: true,
        },
  });

  const mediaType = watch('media_type');
  const placement = watch('placement');

  const inputClass =
    'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink';

  const categoryOptions = (() => {
    const out = [];
    const walk = (nodes, depth = 0) => {
      for (const n of nodes) {
        out.push({
          id: n.id,
          label: `${'— '.repeat(depth)}${n.name_en}`,
        });
        if (n.children?.length) walk(n.children, depth + 1);
      }
    };
    walk(tree);
    return out;
  })();

  async function onSubmit(data) {
    if (!isEdit && !mediaFile) {
      toast.error('Upload the ad media file.');
      return;
    }
    if (data.placement === 'category_top' && !data.category_id) {
      toast.error('Pick a category for a category_top ad.');
      return;
    }

    setSubmitting(true);
    try {
      let mediaUrl = ad?.media_url;
      let posterUrl = ad?.poster_url ?? null;
      if (mediaFile) mediaUrl = await uploadFile(mediaFile);
      if (posterFile) posterUrl = await uploadFile(posterFile);

      const payload = {
        title: data.title.trim(),
        media_url: mediaUrl,
        media_type: data.media_type,
        poster_url: data.media_type === 'video' ? posterUrl : null,
        link_url: data.link_url?.trim() || null,
        placement: data.placement,
        category_id:
          data.placement === 'category_top' ? data.category_id : null,
        sort_order: Number(data.sort_order) || 0,
        is_active: !!data.is_active,
        starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : null,
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
      };

      if (isEdit) {
        await api.patch(`/admin/advertisements/${encodeURIComponent(ad.id)}`, payload);
        toast.success('Ad updated');
      } else {
        await api.post('/admin/advertisements', payload);
        toast.success('Ad created');
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
            {isEdit ? 'Edit Ad' : 'New Ad'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Internal label (not shown to shoppers)"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="text-sale text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Media type *
              </label>
              <select className={inputClass} {...register('media_type')}>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Placement *
              </label>
              <select className={inputClass} {...register('placement')}>
                {PLACEMENTS.map((p) => (
                  <option key={p.v} value={p.v}>
                    {p.l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {placement === 'category_top' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Target category *
              </label>
              {catsLoading ? (
                <p className="text-xs text-ink-muted">Loading categories…</p>
              ) : (
                <select className={inputClass} {...register('category_id')}>
                  <option value="">— Select —</option>
                  {categoryOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              {mediaType === 'video' ? 'Video file' : 'Image file'}{' '}
              {isEdit ? '(leave empty to keep current)' : '*'}
            </label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 p-4 cursor-pointer hover:border-ink">
              <Upload size={18} className="text-ink-muted" />
              <span className="text-sm text-ink-muted">
                {mediaFile
                  ? mediaFile.name
                  : isEdit
                    ? 'Replace media'
                    : 'Click to upload'}
              </span>
              <input
                type="file"
                accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              />
            </label>
            {ad?.media_url && !mediaFile && (
              <p className="text-[11px] text-ink-muted mt-1 truncate">
                Current: {ad.media_url}
              </p>
            )}
          </div>

          {mediaType === 'video' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Poster image (optional — shown before video plays)
              </label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 p-3 cursor-pointer hover:border-ink">
                <Upload size={16} className="text-ink-muted" />
                <span className="text-sm text-ink-muted">
                  {posterFile ? posterFile.name : 'Click to upload'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
              Click-through URL (optional)
            </label>
            <input
              type="url"
              className={inputClass}
              placeholder="https://example.com/promo"
              {...register('link_url')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Starts at
              </label>
              <input
                type="datetime-local"
                className={inputClass}
                {...register('starts_at')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Ends at
              </label>
              <input
                type="datetime-local"
                className={inputClass}
                {...register('ends_at')}
              />
            </div>
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
              <p className="text-[11px] text-ink-muted mt-1">
                Lower = higher priority. #1 wins the slot.
              </p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-ink"
                  {...register('is_active')}
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
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

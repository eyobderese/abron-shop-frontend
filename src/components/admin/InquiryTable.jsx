import { useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';
import ProductDetailModal from './ProductDetailModal';

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-green-100 text-green-700',
};

const statusOptions = ['new', 'contacted', 'closed'];

export default function InquiryTable({ inquiries, onStatusChange }) {
  const [expandedId, setExpandedId] = useState(null);
  const [viewProductId, setViewProductId] = useState(null);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Telegram</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Message</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 whitespace-nowrap">{formatDate(inq.created_at)}</td>
                <td className="py-3 px-4">
                  {inq.product_id ? (
                    <button
                      onClick={() => setViewProductId(inq.product_id)}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {inq.product_name}
                      <Eye size={14} />
                    </button>
                  ) : (
                    <span className="text-gray-500">{inq.product_name}</span>
                  )}
                </td>
                <td className="py-3 px-4">{inq.full_name}</td>
                <td className="py-3 px-4 whitespace-nowrap">{inq.phone}</td>
                <td className="py-3 px-4">{inq.telegram}</td>
                <td className="py-3 px-4 max-w-[200px]">
                  {inq.message ? (
                    <div>
                      <p className={expandedId === inq.id ? '' : 'truncate'}>
                        {inq.message}
                      </p>
                      {inq.message.length > 50 && (
                        <button
                          className="text-primary text-xs hover:underline"
                          onClick={() =>
                            setExpandedId(expandedId === inq.id ? null : inq.id)
                          }
                        >
                          {expandedId === inq.id ? 'Less' : 'More'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-300">&mdash;</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="relative inline-block">
                    <select
                      value={inq.status}
                      onChange={(e) => onStatusChange(inq.id, e.target.value)}
                      className={`appearance-none pr-7 pl-2 py-1 rounded-full text-xs font-medium cursor-pointer border-0 ${
                        statusColors[inq.status]
                      }`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Detail Modal */}
      {viewProductId && (
        <ProductDetailModal
          productId={viewProductId}
          onClose={() => setViewProductId(null)}
        />
      )}
    </>
  );
}

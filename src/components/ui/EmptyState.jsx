import { PackageOpen } from 'lucide-react';

export default function EmptyState({ message = 'Nothing to show yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <PackageOpen className="w-16 h-16 mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
}

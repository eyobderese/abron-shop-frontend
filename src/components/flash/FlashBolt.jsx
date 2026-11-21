import { Zap } from 'lucide-react';

export default function FlashBolt({ size = 20, className = '' }) {
  return (
    <Zap
      size={size}
      className={`fill-eth-yellow text-eth-yellow motion-safe:animate-flash-bolt ${className}`}
      aria-hidden="true"
    />
  );
}

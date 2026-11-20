import { Gift } from 'lucide-react';
import { useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#4D142C] via-[#340C1D] to-[#230814]"
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E84F82] to-[#B81D52] flex items-center justify-center mb-3 text-[#FFF4F8] shadow-atelier-rest">
          <Gift className="w-5 h-5" />
        </div>
        <span className="font-serif-editorial text-lg font-semibold text-[#FCE7EF]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

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
        className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#F9E4EB] via-[#FDF2F5] to-[#F4C2D2]"
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full bg-[#161013] flex items-center justify-center mb-3 text-[#FDF2F5]">
          <Gift className="w-5 h-5" />
        </div>
        <span className="font-serif-editorial text-lg font-semibold text-[#161013]">
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

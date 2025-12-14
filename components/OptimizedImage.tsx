import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number; // Target width for resizing
  height?: number;
  className?: string;
  priority?: boolean; // If true, eager load (for hero images)
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width = 800, 
  className = "", 
  priority = false,
  ...props 
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Helper to construct optimized URL
  const getOptimizedUrl = (url: string, w: number) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    
    // Using wsrv.nl (free global CDN/Proxy) for on-the-fly optimization
    // w: width, q: quality (75 is good balance), output: webp (faster)
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&q=75&output=webp`;
  };

  const optimizedSrc = getOptimizedUrl(src, width);

  if (error || !src) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-300 ${className}`}>
        <ImageIcon size={24} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
        {/* Placeholder skeleton while loading */}
        {!loaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
        )}
        
        <img
            src={optimizedSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-500 z-10 relative ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            {...props}
        />
    </div>
  );
};
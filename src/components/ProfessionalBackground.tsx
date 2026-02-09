import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getResponsiveImageConfig, detectDeviceType, getProfessionalPreset } from '@/utils/responsive-image';

interface ProfessionalBackgroundProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
  parallax?: boolean;
  responsive?: boolean;
  preset?: 'hero' | 'card' | 'section';
  position?: 'top' | 'center' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const ProfessionalBackground = ({
  src,
  alt,
  children,
  className,
  overlay = true,
  parallax = false,
  responsive = true,
  preset = 'hero',
  position = 'center'
}: ProfessionalBackgroundProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Device detection and responsive configuration
  useEffect(() => {
    const updateDeviceType = () => {
      setDeviceType(detectDeviceType());
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  // Image loading detection with timeout
  useEffect(() => {
    const preloadImage = () => {
      const img = new Image();
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
      };

      img.onload = () => {
        cleanup();
        setIsLoaded(true);
      };

      img.onerror = () => {
        cleanup();
        console.warn('Failed to load background image:', src);
        setIsLoaded(true); // Set loaded to true to prevent infinite loading
      };

      // Set a timeout to prevent infinite loading (5 seconds)
      timeoutId = setTimeout(() => {
        console.warn('Image loading timeout for:', src);
        setIsLoaded(true);
      }, 5000);

      img.src = src;

      return cleanup;
    };

    if (src) {
      setIsLoaded(false); // Reset loading state when src changes
      return preloadImage();
    }
  }, [src]);

  // Parallax effect
  useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  const parallaxTransform = parallax ? `translateY(${scrollY * 0.5}px)` : '';

  // Get responsive configuration
  const config = preset ? getProfessionalPreset(preset) : getResponsiveImageConfig();
  const currentConfig = config[deviceType];

  // Position classes
  const positionClass = position === 'center' ? 'bg-position-center' :
    position === 'top' ? 'bg-position-top' :
      position === 'bottom' ? 'bg-position-bottom' :
        position === 'left' ? 'bg-position-left' :
          position === 'right' ? 'bg-position-right' : 'bg-position-center';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Professional Background Image */}
      <div
        className={cn(
          'absolute inset-0 bg-no-repeat transition-all duration-1000',
          positionClass,
          responsive && deviceType === 'mobile' ? 'professional-bg-mobile' : 'professional-bg',
          isLoaded && 'opacity-100',
          !isLoaded && 'opacity-0'
        )}
        style={{
          backgroundImage: `url("${src}")`,
          backgroundPosition: currentConfig.position,
          backgroundAttachment: parallax ? 'fixed' : currentConfig.attachment,
          backgroundSize: currentConfig.size,
          transform: parallaxTransform
        }}
      >
        {/* Professional Gradient Overlays */}
        {overlay && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10"></div>
          </>
        )}

        {/* Professional Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/90 to-muted/80 animate-pulse">
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default ProfessionalBackground;

// Responsive Background Image Hook
export const useResponsiveBackground = () => {
  const [imageSize, setImageSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateImageSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setImageSize('mobile');
      } else if (width < 1024) {
        setImageSize('tablet');
      } else {
        setImageSize('desktop');
      }
    };

    updateImageSize();
    window.addEventListener('resize', updateImageSize);
    return () => window.removeEventListener('resize', updateImageSize);
  }, []);

  return imageSize;
};

// Professional Image Positioner Component
export const ProfessionalImagePositioner = ({
  children,
  position = 'center',
  className
}: {
  children: React.ReactNode;
  position?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  className?: string;
}) => {
  const positionClasses = {
    top: 'items-start justify-center pt-8',
    center: 'items-center justify-center',
    bottom: 'items-end justify-center pb-8',
    left: 'items-center justify-start pl-8',
    right: 'items-center justify-end pr-8'
  };

  return (
    <div className={cn(
      'absolute inset-0 flex',
      positionClasses[position],
      className
    )}>
      {children}
    </div>
  );
};

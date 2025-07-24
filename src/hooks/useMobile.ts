import { useState, useEffect } from 'react';

interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: string;
  orientation: 'portrait' | 'landscape';
}

export const useMobile = (): MobileInfo => {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    platform: 'unknown',
    orientation: 'portrait'
  });

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detect platform
      let platform = 'unknown';
      if (userAgent.includes('android')) platform = 'android';
      else if (userAgent.includes('iphone') || userAgent.includes('ipad')) platform = 'ios';
      else if (userAgent.includes('windows')) platform = 'windows';
      else if (userAgent.includes('mac')) platform = 'mac';
      else if (userAgent.includes('linux')) platform = 'linux';

      // Detect device type
      const isMobile = width <= 768 || /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = width > 768 && width <= 1024 || /ipad|tablet/i.test(userAgent);
      const isDesktop = !isMobile && !isTablet;

      // Detect orientation
      const orientation = height > width ? 'portrait' : 'landscape';

      setMobileInfo({
        isMobile,
        isTablet,
        isDesktop,
        platform,
        orientation
      });
    };

    // Check on mount
    checkDevice();

    // Listen for resize events
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return mobileInfo;
}; 
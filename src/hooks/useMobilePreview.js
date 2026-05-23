import { useEffect, useState } from 'react';

function getPreviewMobileFromUrl() {
  return new URLSearchParams(window.location.search).get('mobile') === '1';
}

export default function useMobilePreview() {
  const [forceMobile] = useState(getPreviewMobileFromUrl);
  const [viewportMobile, setViewportMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setViewportMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = forceMobile || viewportMobile;
  const showPhoneFrame = forceMobile && !viewportMobile;

  return { isMobile, showPhoneFrame, forceMobile };
}

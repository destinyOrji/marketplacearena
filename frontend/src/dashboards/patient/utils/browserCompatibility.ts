/**
 * Browser Compatibility Utilities
 * Detects browser types and handles browser-specific issues
 */

export interface BrowserInfo {
  name: string;
  version: string;
  isMobile: boolean;
  isTablet: boolean;
  supportsWebP: boolean;
  supportsFlexGap: boolean;
}

/**
 * Detect the current browser
 */
export const detectBrowser = (): BrowserInfo => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  // Detect browser
  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }

  // Detect mobile/tablet
  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);

  return {
    name: browserName,
    version: browserVersion,
    isMobile,
    isTablet,
    supportsWebP: checkWebPSupport(),
    supportsFlexGap: checkFlexGapSupport(),
  };
};

/**
 * Check if browser supports WebP images
 */
const checkWebPSupport = (): boolean => {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Check if browser supports CSS flex gap property
 */
const checkFlexGapSupport = (): boolean => {
  const flex = document.createElement('div');
  flex.style.display = 'flex';
  flex.style.flexDirection = 'column';
  flex.style.rowGap = '1px';

  document.body.appendChild(flex);
  const isSupported = flex.scrollHeight === 1;
  document.body.removeChild(flex);

  return isSupported;
};

/**
 * Add browser-specific class to document root
 */
export const addBrowserClass = (): void => {
  const browser = detectBrowser();
  const root = document.documentElement;

  root.classList.add(`browser-${browser.name.toLowerCase()}`);
  
  if (browser.isMobile) {
    root.classList.add('is-mobile');
  }
  
  if (browser.isTablet) {
    root.classList.add('is-tablet');
  }

  if (!browser.supportsFlexGap) {
    root.classList.add('no-flex-gap');
  }
};

/**
 * Check if browser is supported
 */
export const isBrowserSupported = (): boolean => {
  const browser = detectBrowser();
  
  // Define minimum supported versions
  const minVersions: Record<string, number> = {
    Chrome: 90,
    Firefox: 88,
    Safari: 14,
    Edge: 90,
  };

  const minVersion = minVersions[browser.name];
  if (!minVersion) {
    return false; // Unknown browser
  }

  const currentVersion = parseFloat(browser.version);
  return currentVersion >= minVersion;
};

/**
 * Show unsupported browser warning
 */
export const showUnsupportedBrowserWarning = (): void => {
  const warning = document.createElement('div');
  warning.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f59e0b;
    color: white;
    padding: 12px;
    text-align: center;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  `;
  warning.innerHTML = `
    <strong>Unsupported Browser:</strong> 
    For the best experience, please use the latest version of Chrome, Firefox, Safari, or Edge.
  `;
  document.body.insertBefore(warning, document.body.firstChild);
};

/**
 * Polyfill for smooth scroll behavior (Safari < 15.4)
 */
export const polyfillSmoothScroll = (): void => {
  if (!('scrollBehavior' in document.documentElement.style)) {
    // Add smooth scroll polyfill for older browsers
    const style = document.createElement('style');
    style.textContent = `
      * {
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * Fix for iOS Safari 100vh issue
 */
export const fixIOSViewportHeight = (): void => {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
};

/**
 * Initialize all browser compatibility fixes
 */
export const initBrowserCompatibility = (): void => {
  addBrowserClass();
  polyfillSmoothScroll();
  fixIOSViewportHeight();

  if (!isBrowserSupported()) {
    showUnsupportedBrowserWarning();
  }
};

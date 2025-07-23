// Production configuration for console logging
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// Override console methods for cleaner production output
if (isProduction) {
  // Keep original methods for critical logging
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Completely disable development logs in production
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  
  // Filter errors to only show critical ones
  console.error = (...args) => {
    const message = args.join(' ');
    // Only log critical errors, not development debugging
    if (!message.includes('Cache hit') && 
        !message.includes('Cache miss') && 
        !message.includes('Response status:') &&
        !message.includes('Making API request') &&
        !message.includes('Response data for') &&
        !message.includes('Products data from API') &&
        !message.includes('FilterContext:') &&
        !message.includes('Category options') &&
        !message.includes('Preloading') &&
        !message.includes('First visit detected') &&
        !message.includes('cached in')) {
      originalError.apply(console, args);
    }
  };
  
  console.warn = (...args) => {
    const message = args.join(' ');
    // Only log important warnings, not development info
    if (!message.includes('Failed to preload') && 
        !message.includes('Cache') &&
        !message.includes('FilterContext') &&
        !message.includes('Category options')) {
      originalWarn.apply(console, args);
    }
  };
} else {
  // In development, also reduce some verbose logs
  const originalLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    // Reduce verbose development logs
    if (!message.includes('Products data from API') &&
        !message.includes('FilterContext:') &&
        !message.includes('Category options preloaded') &&
        !message.includes('All category options loaded') &&
        !message.includes('cached in') &&
        !message.includes('Preloading category options') &&
        !message.includes('Category options preloading completed') &&
        !message.includes('First visit detected')) {
      originalLog.apply(console, args);
    }
  };
}

export default {
  isProduction,
  isDevelopment: !isProduction
};

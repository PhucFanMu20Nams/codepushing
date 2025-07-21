// Production configuration for console logging
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// Override console methods in production
if (isProduction) {
  // Keep error and warn for important issues
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Disable info and debug logs in production
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  
  // Keep errors but filter out development-only errors
  console.error = (...args) => {
    const message = args.join(' ');
    // Only log critical errors, not development debugging
    if (!message.includes('Cache hit') && 
        !message.includes('Cache miss') && 
        !message.includes('Response status:') &&
        !message.includes('Making API request') &&
        !message.includes('Response data for')) {
      originalError.apply(console, args);
    }
  };
  
  console.warn = (...args) => {
    const message = args.join(' ');
    // Only log important warnings
    if (!message.includes('Failed to preload') && 
        !message.includes('Cache')) {
      originalWarn.apply(console, args);
    }
  };
}

export default {
  isProduction,
  isDevelopment: !isProduction
};

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config();

// Get configuration from environment variables with enhanced security validation
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'images/products';
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || (5 * 1024 * 1024); // Default 5MB
const MAX_FILES = parseInt(process.env.UPLOAD_MAX_FILES) || 10;
const ALLOWED_EXTENSIONS = process.env.UPLOAD_ALLOWED_EXTENSIONS || 'jpg,JPG,jpeg,JPEG,png,PNG,gif,GIF,webp,WEBP';

// Security validation for production
if (process.env.NODE_ENV === 'production') {
  // Validate upload directory is not in sensitive locations
  const normalizedDir = path.normalize(UPLOAD_DIR);
  const dangerousPaths = ['/', '/etc', '/usr', '/var', '/root', '/home', 'C:\\', 'C:\\Windows', 'C:\\Users'];
  
  if (dangerousPaths.some(dangerous => normalizedDir.startsWith(dangerous))) {
    console.error('🚨 CRITICAL: Upload directory points to sensitive system location!');
    process.exit(1);
  }
  
  // Validate file size limits are reasonable for production
  if (MAX_FILE_SIZE > 50 * 1024 * 1024) { // 50MB
    console.warn('⚠️ WARNING: Upload file size limit is very high for production!');
  }
  
  if (MAX_FILES > 50) {
    console.warn('⚠️ WARNING: Maximum files per upload is very high for production!');
  }
}

// Ensure the directory exists with secure permissions
const uploadDir = path.resolve(__dirname, '..', UPLOAD_DIR);

// Security check: Ensure upload directory is within project boundaries
const projectRoot = path.resolve(__dirname, '..', '..');
if (!uploadDir.startsWith(projectRoot)) {
  throw new Error('🚨 SECURITY: Upload directory must be within project boundaries!');
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { 
    recursive: true,
    mode: 0o755 // Set secure permissions (owner: rwx, group: r-x, others: r-x)
  });
}

// Set up storage with enhanced security
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use crypto for more secure filename generation
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    // Sanitize original filename and get extension
    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '');
    const ext = path.extname(sanitizedName).toLowerCase();
    
    // Generate secure filename
    const secureFilename = `${uniqueSuffix}${ext}`;
    cb(null, secureFilename);
  }
});

// Enhanced file filter with security validations
const fileFilter = (req, file, cb) => {
  try {
    // Security check: Validate MIME type
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. MIME type ${file.mimetype} not allowed.`), false);
    }
    
    // Get allowed extensions from environment
    const allowedExtensions = ALLOWED_EXTENSIONS.split(',').map(ext => ext.toLowerCase());
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    
    // Check if file extension is allowed
    const isAllowed = allowedExtensions.includes(fileExtension);
    
    if (!isAllowed) {
      return cb(new Error(`File extension .${fileExtension} not allowed. Allowed: ${ALLOWED_EXTENSIONS}`), false);
    }
    
    // Security check: Validate filename doesn't contain dangerous characters
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.originalname)) {
      return cb(new Error('Filename contains invalid characters'), false);
    }
    
    // Security check: Validate filename length
    if (file.originalname.length > 255) {
      return cb(new Error('Filename too long (max 255 characters)'), false);
    }
    
    // Check for double extensions (security risk)
    const doubleExtension = /\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
    if (doubleExtension.test(file.originalname)) {
      return cb(new Error('Double file extensions not allowed'), false);
    }
    
    cb(null, true);
  } catch (error) {
    cb(new Error('File validation error: ' + error.message), false);
  }
};

// Export multer configuration with enhanced security
module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    fields: 25, // Allow up to 25 non-file fields to accommodate complex forms
    fieldNameSize: 100, // Limit field name size
    fieldSize: 1024 * 1024, // Limit field value size to 1MB
    headerPairs: 2000 // Limit number of header key-value pairs
  },
  // Additional security: Preserve file path to prevent directory traversal
  preservePath: false
});

// Export configuration for debugging/logging (without sensitive data)
module.exports.config = {
  maxFileSize: MAX_FILE_SIZE,
  maxFiles: MAX_FILES,
  uploadDir: UPLOAD_DIR,
  allowedExtensions: ALLOWED_EXTENSIONS.split(','),
  isProduction: process.env.NODE_ENV === 'production'
};
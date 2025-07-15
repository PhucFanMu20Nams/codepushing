const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Get configuration from environment variables
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'images/products';
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || (5 * 1024 * 1024); // Default 5MB
const ALLOWED_EXTENSIONS = process.env.UPLOAD_ALLOWED_EXTENSIONS || 'jpg,JPG,jpeg,JPEG,png,PNG,gif,GIF,webp,WEBP';

// Ensure the directory exists
const uploadDir = path.join(__dirname, '..', UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Get file extension
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Get allowed extensions from environment
  const allowedExtensions = ALLOWED_EXTENSIONS.split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  // Check if file extension is allowed
  const isAllowed = allowedExtensions.some(ext => 
    ext.toLowerCase() === fileExtension || ext === fileExtension
  );
  
  if (!isAllowed) {
    return cb(new Error(`Only these file types are allowed: ${ALLOWED_EXTENSIONS}`), false);
  }
  cb(null, true);
};

// Export multer configuration
module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: MAX_FILE_SIZE,
    files: parseInt(process.env.UPLOAD_MAX_FILES) || 10 // Max number of files
  }
});
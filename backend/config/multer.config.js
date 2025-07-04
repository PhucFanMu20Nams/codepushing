const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the directory exists
const uploadDir = path.join(__dirname, '../images/products');
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
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Export multer configuration
module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const upload = require('../config/multer.config');

exports.uploadProductImages = upload.array('images', 10);
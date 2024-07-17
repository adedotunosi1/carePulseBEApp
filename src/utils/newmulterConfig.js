const fs = require('fs-extra');
const multer = require('multer'); 
const path = require('path');

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../services/userimages');
    try {
      await fs.ensureDir(uploadDir); // Ensure the directory exists
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const type = req.body.type || 'profileImage'; // Default to 'profileImage' if no type is provided
    cb(null, `${type}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadnew = multer({ storage: storage });

module.exports = {
  uploadnew
};

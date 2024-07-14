const fs = require('fs');
const multer = require('multer'); 
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../services/userimages'));
    },
    filename: function (req, file, cb) {
      cb(null, 'profileImage-' + Date.now() + path.extname(file.originalname));
    },
  });
  
  const uploadnew = multer({ storage: storage});
  

  module.exports = {
    uploadnew,
  };
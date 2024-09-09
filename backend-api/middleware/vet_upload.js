// ปรับปรุงไฟล์ middleware/vet_upload.js (รวมการอัปโหลดทั้งหมดไว้ในไฟล์เดียว)

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let dest = './public/veterinary/';
    switch(file.fieldname) {
      case 'passport':
        dest += 'vet_card';
        break;
      case 'photo':
        dest += 'vet_photo';
        break;
      case 'license':
        dest += 'vet_license';
        break;
      default:
        dest += 'other';
    }
    cb(null, dest);
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  const filetypes = /jpeg|jpg|png|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only images (JPEG, JPG, PNG) and PDF files are allowed!');
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB file size limit
  fileFilter: fileFilter
}).fields([
  { name: 'passport', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'license', maxCount: 1 }
]);

module.exports = upload;
const multer = require('multer');
const path = require('path');
const { storage: cloudinaryStorage } = require('../utils/cloudinary');

// === Upload gambar ke Cloudinary ===
const uploadImage = multer({ storage: cloudinaryStorage });

// === Upload file Excel ke folder lokal ===
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pastikan folder 'uploads' ada
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const excelFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file Excel (.xlsx, .xls) yang diizinkan'), false);
  }
};

const uploadExcel = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
});

module.exports = {
  uploadImage,
  uploadExcel,
};

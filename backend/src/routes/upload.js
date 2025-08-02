import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
      const dir = path.join(process.cwd(), 'public/uploads', folder);
      fs.mkdirSync(dir, { recursive: true });
      console.log('📁 Tạo thư mục:', dir);
      cb(null, dir);
    } catch (err) {
      console.error('❌ Lỗi tạo thư mục upload:', err);
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});


// Cấu hình multer với giới hạn file 200MB
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // ✅ 200MB
  fileFilter: (req, file, cb) => {
  try {
    if (!file?.mimetype) {
      console.error('❌ Không có mimetype:', file);
      return cb(new Error('Invalid file: no mimetype'), false);
    }

    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      console.warn('⚠️ Định dạng không hợp lệ:', file.mimetype);
      return cb(new Error('Only image/video files are allowed'), false);
    }

    cb(null, true);
  } catch (err) {
    console.error('❌ Lỗi trong fileFilter:', err);
    cb(err, false);
  }
}
});

// Route chính: POST /api/upload
router.post('/', upload.any(), (req, res) => {
  try {
    console.log('📥 Bắt đầu upload');
    console.log('🧾 req.files:', req.files);
    console.log('🧾 req.body:', req.body);

    if (!req.files || req.files.length === 0) {
      console.warn('⚠️ Không có file nào được nhận');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = req.files.map(file => {
      const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
      return `${baseUrl}/uploads/${folder}/${file.filename}`;
    });

    console.log('✅ Upload xong:', urls);
    res.json({ urls });
  } catch (err) {
    console.error('❌ Upload error (catch):', err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});


// Middleware xử lý lỗi của multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File quá lớn. Giới hạn là 200MB.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: 'Lỗi server: ' + err.message });
  }
  next();
});

export default router;

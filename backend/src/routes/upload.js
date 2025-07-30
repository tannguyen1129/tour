import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
    const dir = path.join(process.cwd(), 'public/uploads', folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // nâng giới hạn lên 50MB nếu cần
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only image/video files are allowed'), false);
    }
    cb(null, true);
  }
});

// Cho phép upload bất kỳ field nào, nhiều file
router.post('/', upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const urls = req.files.map(file => {
    const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
    return `${baseUrl}/uploads/${folder}/${file.filename}`;
  });

  res.json({ urls });
});

export default router;

// 后端入口文件
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// 允许跨域
app.use(cors());

// 静态文件服务（用于前端访问已上传的Excel文件）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 上传Excel接口
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

// 获取所有已上传的Excel文件列表
app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: '读取文件失败' });
    // 只返回Excel文件，且按时间倒序排列
    const excelFiles = (files || [])
      .filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'))
      .sort((a, b) => b.localeCompare(a));
    res.json({ files: excelFiles });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

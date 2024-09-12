const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gis_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// API untuk mendapatkan semua kelurahan
app.get('/api/kelurahan', (req, res) => {
  const sql = `SELECT kelurahan.*, kecamatan.nama_kecamatan 
               FROM kelurahan 
               JOIN kecamatan ON kelurahan.id_kecamatan = kecamatan.id`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// API to upload image and update database with image path
app.post('/api/kelurahan/upload', upload.single('image'), (req, res) => {
  const id = req.body.id;  // Assuming you pass the kelurahan id in the body
  const imagePath = `/uploads/${req.file.filename}`;
  const sql = `UPDATE kelurahan SET gambar = ? WHERE id = ?`;

  db.query(sql, [imagePath, id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Image uploaded successfully', imagePath });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

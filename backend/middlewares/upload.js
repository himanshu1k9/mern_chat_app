const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '..', 'uploades');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploades/');
    },
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 119);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|avif/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowed.test(file.mimetype);

    if(extname && mimeType) {
        return cb(null, true);
    } else {
        cb('Only Image allowed.');
    }
}

const upload = multer({
    storage,
    limits: {fileSize: 2 * 1024 * 1024},
    fileFilter
});

module.exports = upload;
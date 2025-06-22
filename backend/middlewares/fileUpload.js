const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '..', 'uploades/chatfiles');
if(!fs.existsSync) fs.mkdirSync(dir);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cd(null, dir);
    },
    filename: function(req, file, cb) {
        const name = Date.now() + '-' + Math.round(Math.random() * 1000);
        const ext = path.extname(file.originalname);
        cb(null, name + ext);
    }
});

const allowed = /jpeg|jpg|png|gif|webp|avif|pdf|mp4|doc|docx|txt|mp3/;
const fileFilter = (req, file, cb) => {
    const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowed.test(file.mimetype);
    if(extValid && mimeValid) {
        cb(null, true);
    } else {
        cb('Unsupported file type', false);
    }
}

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});
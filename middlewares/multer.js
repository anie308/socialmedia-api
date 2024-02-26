
const multer = require('multer');

const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb('Invalid file format! Only images and videos are allowed.', false);
    }
};

module.exports = multer({ storage, fileFilter });

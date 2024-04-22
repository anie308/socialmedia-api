
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the destination folder
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        // Generate a unique file name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb('Invalid file format! Only images and videos are allowed.', false);
    }
};

module.exports = multer({ storage, fileFilter });

const router = require("express").Router();
const { postComment, getPostComments } = require("../controllers/misc/comment.controller");
const multer = require("../middlewares/multer");
// 
const { verifyToken } = require("../middlewares/verifyPerson");

router.post("/new/:postId", verifyToken, multer.single("media"),  postComment);
router.get("/:postId", verifyToken,   getPostComments);


module.exports = router;
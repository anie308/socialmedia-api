const router = require("express").Router();
const multer = require("../middlewares/multer");

const { newPost, editPost, likePost, unlikePost, getUserPosts, singlePost,  loadFeed } = require("../controllers/post.controller");
const { verifyToken } = require("../middlewares/verifyPerson");
const { validateFields } = require("../middlewares/validateFields");

router.post("/new",verifyToken,   multer.single("media"), newPost);
router.get("/feed", loadFeed);
router.get("/me", verifyToken,  getUserPosts);
router.put("/edit/:postId", verifyToken, validateFields(["content"]),  editPost);
router.put("/like/:postId", verifyToken,  likePost);
router.put("/unlike/:postId", verifyToken,  unlikePost);
router.get("/:postId", verifyToken,  singlePost);
// router.put("/unlike/:postId", verifyToken,  unlikePost);

module.exports = router;
const router = require("express").Router();
const { verifyToken } = require("../middlewares/verifyPerson");
const { addFriend, acceptFriend, getRequests, getAllFriends, declineFriend } = require("../controllers/friend.controller");

router.post("/add",verifyToken,  addFriend);
router.post("/accept",verifyToken,  acceptFriend);
router.post("/decline",verifyToken,  declineFriend);
router.get("/requests",verifyToken,  getRequests);
router.get("/all",verifyToken,  getAllFriends);

module.exports = router;
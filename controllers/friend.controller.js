const FriendRequest = require("../models/friendRequest.model");
const Friend = require("../models/friend.model");
const User = require("../models/user.model");
const { notification } = require("./misc/notify.controller");
const jwt = require("jsonwebtoken");

const addFriend = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const { id } = req.body;
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    if (userId === id) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "You cannot send a friend request to yourself",
      });
    }

    const user = await User.findById(userId);
    const senderId = user._id;
    const senderName = `${user.firstname} ${user.lastname}`;
    console.log(user);

    const areAlreadyFriends = await Friend.findOne({
      user: userId,
      friends: id,
    });

    if (areAlreadyFriends) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "You are already friends with this user",
      });
    }

    // Check if a friend request already exists
    const existingFriendRequest = await FriendRequest.findOne({
      fromUser: senderId,
      toUser: id,
      status: "pending",
    });

    if (existingFriendRequest) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "Friend request already sent",
      });
    }

    const friendRequest = new FriendRequest({
      fromUser: senderId,
      toUser: id,
    });

    await friendRequest.save();

    await notification({
      user: id,
      type: "friendRequest",
      content: `${senderName} wants to be your friend`,
      sourceUser: senderId,
    });

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Friend request sent",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal Server Error",
    });
    console.log(error);
  }
};

const acceptFriend = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const { id } = req.body;
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const friendRequest = await FriendRequest.findById(id);
    console.log(friendRequest);

    if (!friendRequest) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Friend request not found",
      });
    }

    // Update friend request status to "accepted"
    friendRequest.status = "accepted";
    await friendRequest.save();

    const currentUser = await User.findById(userId);
    const friendId = friendRequest.fromUser;

    // Add each other as friends
    await Promise.all([
      Friend.findOneAndUpdate(
        { user: userId },
        { $addToSet: { friends: friendId } },
        { upsert: true }
      ),
      Friend.findOneAndUpdate(
        { user: friendId },
        { $addToSet: { friends: userId } },
        { upsert: true }
      ),
    ]);

    // Notify the user who sent the friend request
    await notification({
      user: friendId,
      type: "friendRequest",
      content: `${currentUser.firstname} ${currentUser.lastname} accepted your friend request`,
      sourceUser: userId,
    });

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Friend request accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal Server Error",
    });
  }
};
const declineFriend = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const { id } = req.body;
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const friendRequest = await FriendRequest.findById(id);

    if (!friendRequest) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Friend request not found",
      });
    }

    // Update friend request status to "accepted"
    await FriendRequest.findByIdAndDelete(id);



    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Friend request declined successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal Server Error",
    });
  }
};

const getRequests = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const friendRequests = await FriendRequest.find({
      toUser: userId,
      status: "pending",
    }).populate("fromUser", "firstname lastname username _id");

    const sanitizedFriendRequests = friendRequests.map((request) => ({
      id: request.fromUser._id,
      firstname: request.fromUser.firstname,
      lastname: request.fromUser.lastname,
      username: request.fromUser.username,
    }));

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Friend requests",
      data: sanitizedFriendRequests,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal Server Error",
    });
  }
};

const getAllFriends = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Assuming you have a Friend model
    const friendData = await Friend.findOne({ user: userId }).populate(
      "friends",
      "firstname lastname username _id"
    );

    if (!friendData) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Friend data not found",
      });
    }

    const friends = friendData.friends.map((friend) => ({
      id: friend._id,
      firstname: friend.firstname,
      lastname: friend.lastname,
      username: friend.username,
    }));

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Friends retrieved successfully",
      data: friends,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addFriend,
  acceptFriend,
  getRequests,
  getAllFriends,
  declineFriend,
};

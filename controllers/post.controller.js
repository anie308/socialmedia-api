const User = require("../models/user.model");
const Post = require("../models/post.model");
const Friend = require("../models/friend.model");
const jwt = require("jsonwebtoken");
const cloudinary = require("../cloud");
const { notification } = require("./misc/notify.controller");

const newPost = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const { content } = req.body;
  const { file } = req;
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;
    const user = await User.findById(userId);
    console.log(content)
    console.log(file)

    // if (!user) {
    //   return res.status(404).json({
    //     statusCode: 404,
    //     status: false,
    //     message: "User not found",
    //   });
    // } else {
    //   const id = user._id;
    //   const post = new Post({
    //     owner: id,
    //     content,
    //   });

    //   if (file) {
    //     const { secure_url: url, public_id, error } = await cloudinary.uploader.upload(
    //       file.path
    //     );
    //     post.media = { url, public_id };
    //     console.log(error);
    //   }

    //   await post.save();

    //   const senderName = `${user.firstname} ${user.lastname}`;

    //   const friendList = await Friend.findOne({ user: id });

    //   if (friendList && friendList.friends.length > 0) {
    //     // Loop through the friends and send notifications
    //     for (const friendId of friendList.friends) {
    //       notification({
    //         user: friendId,
    //         type: "post",
    //         content: `${senderName} added a post`,
    //         sourceUser: id,
    //         post: post._id,
    //       });
    //     }
    //   }

    //   res.status(201).json({
    //     message: "Post created successfully",
    //     statusCode: 201,
    //   });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal Server Error",
    });
  }
};

const editPost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "User not found",
      });
    } else {
      const id = user._id;
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({
          statusCode: 404,
          status: false,
          message: "Post not found",
        });
      } else {
        if (post.owner.toString() !== id.toString()) {
          return res.status(403).json({
            statusCode: 403,
            status: false,
            message: "You are not authorized to edit this post",
          });
        } else {
          if (content) {
            post.content = content;
          }

          await post.save();
          res.status(200).json({
            statusCode: 200,
            status: true,
            message: "Post updated successfully",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal Server Error",
    });
  }
};

const likePost = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];
  const { postId } = req.params;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Check if the post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Post not found",
      });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "You have already liked this post",
      });
    }

    // Add user ID to the likes array
    post.likes.push(userId);
    await post.save();

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Post liked successfully",
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

const unlikePost = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];
  const { postId } = req.params;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Check if the post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Post not found",
      });
    }

    // Check if the user has liked the post
    if (!post.likes.includes(userId)) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "You have not liked this post",
      });
    }

    // Remove user ID from the likes array
    post.likes = post.likes.filter((likeId) => likeId.toString() !== userId);
    await post.save();

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Post unliked successfully",
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

const deletePost = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];
  const { postId } = req.params;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Check if the post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Post not found",
      });
    }

    // Check if the user is the owner of the post
    if (post.owner.toString() !== userId) {
      return res.status(403).json({
        statusCode: 403,
        status: false,
        message: "You are not authorized to delete this post",
      });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Post deleted successfully",
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

const getUserPosts = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const posts = await Post.find({ owner: userId }).sort({ createdAt: -1 });

    const postsWithLikesInfo = await Promise.all(
      posts.map(async (post) => {
        const likesCount = post.likes.length;

        return {
          ...post.toObject(),
          likesCount,
        };
      })
    );

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Posts retrieved successfully",
      data: postsWithLikesInfo,
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

const singlePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Post not found",
      });
    }

    // Assuming you also want to retrieve likesCount and likersNames
    const likesCount = post.likes.length;
    const likers = await User.find({ _id: { $in: post.likes } }).select(
      "firstname lastname"
    );
    const likersNames = likers.map(
      (liker) => `${liker.firstname} ${liker.lastname}`
    );

    const postWithLikesInfo = {
      ...post.toObject(),
      likesCount,
      likersNames,
    };

    res.status(200).json({
      statusCode: 200,
      status: true,
      message: "Post retrieved successfully",
      data: postWithLikesInfo,
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

const loadFeed = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;
    const user = await User.findById(userId);
    console.log(user);

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "User not found",
      });
    } else {
      const id = user._id;
      console.log(id);
      const friendList = await Friend.findOne({ user: id });

      if (!friendList) {
        return res.status(200).json({
          statusCode: 200,
          status: true,
          message: "Your feed is empty",
          data: [],
        });
      } else {
        const friends = friendList.friends;
        const posts = await Post.find({ owner: { $in: friends } }).sort({
          createdAt: -1,
        });

        const postsWithLikesInfo = await Promise.all(
          posts.map(async (post) => {
            const likesCount = post.likes.length;
            const owner = await User.findById(post.owner).select(
              "firstname lastname"
            );
            const ownerName = `${owner.firstname} ${owner.lastname}`;

            return {
              ...post.toObject(),
              likesCount,
              ownerName,
            };
          })
        );

        res.status(200).json({
          statusCode: 200,
          status: true,
          message: "Feed retrieved successfully",
          data: postsWithLikesInfo,
        });
      }
    }
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
  newPost,
  editPost,
  likePost,
  unlikePost,
  deletePost,
  getUserPosts,
  singlePost,
  loadFeed,
};

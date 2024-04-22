const User = require("../../models/user.model");
const Post = require("../../models/post.model");
const Comment = require("../../models/comment.model");
const jwt = require("jsonwebtoken");
const cloudinary = require("../../cloud");
const { GetTransacEmailContent } = require("@getbrevo/brevo");


const postComment = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const { content } = req.body;
  const { file } = req;
  const { postId } = req.params;
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
      } 

      const comment = new Comment({
        post: postId,
        user: id,
        content,
      });

      console.log(comment);

      if (file) {
        const { secure_url: url, public_id } = await cloudinary.uploader.upload(
          file.path
        );
        comment.media = { url, public_id };
      }

      await comment.save();


      res.status(201).json({
        message: "Comment added successfully",
        statusCode: 201,
        status: true,
        data: comment,
      });
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

const getPostComments = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const { postId } = req.params;
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
      } 

      const comments = await Comment.find({ post: postId });

      res.status(200).json({
        message: "Comments retrieved successfully",
        statusCode: 200,
        status: true,
        data: {
          comments,
          count: comments.length,
        },
      });
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
  postComment,
  getPostComments
};

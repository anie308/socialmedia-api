const express = require("express");
require("dotenv").config();
require("./db");
const morgan = require("morgan");
const path = require('path');
const port = process.env.PORT || 3000;
const cors = require("cors");
const app = express();
const apiSeedUrl = "/api/v1";

const authRoute = require("./routes/auth.route");
const postRoute = require("./routes/post.route");
const friendRoute = require("./routes/friend.route");
const commentRoute = require("./routes/comment.route");
const previewRoute = require("./routes/preview.route");


app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



app.use(`${apiSeedUrl}`, previewRoute);
app.use(`${apiSeedUrl}/auth`, authRoute);
app.use(`${apiSeedUrl}/post`, postRoute);
app.use(`${apiSeedUrl}/friend`, friendRoute);
app.use(`${apiSeedUrl}/comment`, commentRoute);


app.listen(port, () => {
    console.log(`Server listening on port ${port} and "http://localhost:${port}/api/v1"`);
  });
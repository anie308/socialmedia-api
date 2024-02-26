const mongoose = require('mongoose');

mongoose
.connect("mongodb://localhost:27017/talebook")
// .connect(process.env.MONGO_URL)
.then(
    () => console.log('Database Connected')
)
.catch(
    err=> console.log('db connection failed:', err.message || err)
)
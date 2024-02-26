const Notification = require("../../models/notication.model")


 const notification = async({user, type, content, sourceUser, post}) => {
 const newNotification = new Notification({
    user,
    type,
    content,
    sourceUser,
    post
 })

 await newNotification.save()
}


module.exports = {
    notification
}


// user: The user who will receive the notification.
// type: The type of notification (e.g., friend request, post like, post comment).
// content: A brief description or content of the notification.
// isRead: Indicates whether the user has read the notification.
// sourceUser: The user responsible for the notification (e.g., the one who sent the friend request or liked the post).
// post: Reference to the Post model, if applicable.
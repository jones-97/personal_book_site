const sendResetEmail = require("./routes/adminRoutes");

sendResetEmail("jonesmwaniki@ymail.com", "123456")
    .then(() => console.log("Email sent successfully"))
    .catch(error => console.error("Failed to send email:", error));

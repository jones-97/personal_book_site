require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

const rootPath = __dirname;

// Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/chapters", require("./routes/chapterRoutes"));

// Serve static files from the public directory (adjust if needed)
app.use(express.static(path.join(__dirname, "public")));

// Route for the home page (books.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "books.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "access_page.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = rootPath;
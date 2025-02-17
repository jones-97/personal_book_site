const mongoose = require("mongoose");
require("./Chapter");

const BookSchema = new mongoose.Schema({
    title: String,
	synopsis: String,
	genres: [String],
	coverImage: String,
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
});

module.exports = mongoose.model("Book", BookSchema);

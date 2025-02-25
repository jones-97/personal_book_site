const mongoose = require("mongoose");
require("./Book");

const ChapterSchema = new mongoose.Schema(
{
    bookId: { type: 'ObjectId', ref: 'Book', required: true },
	title: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true }
);


module.exports = mongoose.model("Chapter", ChapterSchema);

const express = require("express");
const Book = require("../models/Book");
const authMiddleware = require("../middleware/authMiddleware");
const path = require("path");

const router = express.Router();

const publicPath = path.join(__dirname, '/../public');


router.get("/add", authMiddleware, (req,res) => {
	 try{
	res.sendFile(path.join(publicPath, 'add_book.html'));
	} catch (err) {
		res.status(500).json(err.message);
	}
}
);

//Create Book (updated with HTML)
router.post("/add", authMiddleware, async (req, res) => {
	try {
        const { coverImage, title, synopsis, genres } = req.body;

        const newBook = new Book({
			coverImage,
            title,
            synopsis,
            genres,
        });

        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
	
}
);

// Create Book
router.post("/", authMiddleware, async (req, res) => {
	try {
    const book = new Book(req.body);
    await book.save();
    res.json({ id: book._id });
	} catch (err) {
		res.status(400).json(err.message);
	}
});

//Update book
router.put("/:bookId", authMiddleware, async (req, res) => {
	try {
		const { title, synopsis, genres, coverImage } = req.body;
	
		const updatedBook = await Book.findByIdAndUpdate(
			req.params.bookId,
			{ title, synopsis, genres, coverImage },
			{ new: true } //Return the updated Book
			);
			
		if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
		}
		
    res.json(updatedBook);
	console.log("Success in updating a Book details!");
	console.log("Updated chapter:   ", updatedBook);
	} catch (err) {
		res.status(500).json(err.message);
	}
});



// Get All Books
router.get("/", async (req, res) => {
	try{
    const books = await Book.find();
    res.json(books);
	} catch (err) {
		res.status(500).json(err.message);
	}
});

// Get Single Book
router.get("/:bookId", async (req, res) => {
	try {
    const book = await Book.findById(req.params.bookId);
    res.json(book)
	console.log("Everything appears good on this end");
	} catch (err) {
		res.status(500).json(err.message);
		console.log("Something wrong while getting the book happened here");
	}
});

// Delete Book
router.delete("/:bookId", authMiddleware, async (req, res) => {
    await Book.findByIdAndDelete(req.params.bookId);
    res.json({ message: "Book deleted" });
});

module.exports = router;

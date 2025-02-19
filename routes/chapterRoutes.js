const express = require("express");
const Chapter = require("../models/Chapter");
const authMiddleware = require("../middleware/authMiddleware");
const path = require("path");

const router = express.Router();
const publicPath = path.join(__dirname, '/../public');


// Create Chapter
router.post("/", authMiddleware, async (req, res) => {
    const chapter = new Chapter(req.body);
    await chapter.save();
    res.json({ id: chapter._id });
});

//Get chapter JUST by chapter id
router.get("/:chapterId", async (req, res) => {
	
	try {
    const chapter = await Chapter.findById(req.params.chapterId);
    res.json(chapter)
	console.log("Got single chapter by chapter id");
	} catch (err) {
		res.status(500).json(err.message);
		console.log("Error getting single chapter by chapter id");
	}
}
);

//Get chapters by book. This will make it /chapters/book. Ths is kind of recommended now
router.get('/book/:bookId', async (req, res) => {
    try {
        const chapters = await Chapter.find({ bookId: req.params.bookId });
        res.json(chapters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Get list of chapter Ids; for simplicity instead of getting the whole chapter details
//Is this safe? Is this secure? We don't know. Check back on it.
router.get('/ids/:bookId', async(req, res) => { 
	  try {
        const chapters = await Chapter.find({ bookId: req.params.bookId }, '_id');
        const chapterIds = chapters.map(chapter => chapter._id.toString());
		console.log("Chapter Ids: ", chapterIds);
        res.json(chapterIds);
		console.log("Suc cess in getting chapter Ids");
    } catch (err) {
        res.status(500).json({ message: err.message });
		console.log("Failed getting ids of chapters");
    }
	
});


//Get latest chapter of a book
router.get('/book/:bookId/latest', async (req, res) => {
	const { bookId } = req.params;	
	
	try {
		
		const latestChapter = await Chapter.findOne({ bookId }, 'title')
            .sort({ _id: -1 }) // Sort by _id in descending order (latest first)
            .limit(1); // Get only the latest chapter

        if (!latestChapter) {
            return res.status(404).json({ message: 'No chapters found for this book' });
        }
		console.log("The latest chapter is: ", latestChapter.title);
        res.json(latestChapter.title || { title: 'No chapters yet' });	
		
	} catch (err) {
		res.status(500).json({ message: err.message });
		console.log("failed getting latest chapter");
}
}
);

//Create chapters by book value (kinda recommended)
router.post('/', authMiddleware, async (req, res) => {
	try {
        const { bookId, title, content } = req.body;

        const newChapter = new Chapter({
			bookId,
            title,
            content,
        });

        await newChapter.save();
        res.status(201).json(newChapter);
		console.log("New chapter has been added!");
    } catch (err) {
        res.status(500).json({ message: err.message });
		console.log("An error occurred creating new chapter, node side");
    }
}
);

//Update a single Chapter
router.put("/:chapterId", authMiddleware, async (req, res) => {
	/* const { chapterId } = req.params;
    const { content } = req.body;
	const { title } = req.body;

    console.log("Received ID:", chapterId);
    console.log("Received Content:", content);
	console.log("And the title: ", title);
	
	
    if (!content) {
        return res.status(400).json({ message: 'Chapter content cannot be empty' });
    }
	*/
	
	try {
		const { title, content } = req.body;
		const updatedChapter = await Chapter.findByIdAndUpdate(
			req.params.chapterId,
			{ title, content },
			{ new: true } //Return the updated Book
			);
			
			if (!updatedChapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }
		
    res.json(updatedChapter);
	console.log("Success in updating a chapter!");
	console.log("Updated chapter:   ", updatedChapter);
		
	} catch (err) { 
		res.status(500).json(err.message);
		console.log("something went wrong updating a chapter");
	
}
}
);

// Get Chapters by Book (might not work)
router.get("/:bookId", async (req, res) => {
	try {
    const chapters = await Chapter.find({ book_id: req.params.bookId });
    res.json(chapters);
	if (!chapters) {
		console.log("There is no chapter found. You must add a chapter");
	}
	} catch (err) {
		res.status(500).json(err.message);
		console.log("Something went wrong getting a chapter by book");
	}
});

// Delete Chapter
router.delete("/:chapterId", authMiddleware, async (req, res) => {
    await Chapter.findByIdAndDelete(req.params.chapterId);
    res.json({ message: "Chapter deleted" });
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const path = require("path");



const router = express.Router();
const publicPath = path.join(__dirname, '/../public');



//app.use(express.static(path.join(__dirname, "public")));

// Admin List
router.get("/", async (req, res) => {
	try { 
	 const existingAdmin = await Admin.findOne();
	 if (existingAdmin) {
	  res.json("Exists");
      console.log('Admin already exists.');
      process.exit();
			}
	} 
	catch (err) {
		console.log("Error in attempting to get list of admins");
		console.log(err.message);
}
}
);





router.get("/index", (req, res) => {
    try{
	res.sendFile(path.join(publicPath, 'access_page.html'));
	} catch (err) {
		res.status(500).json(err.message);
	}
});

router.get("/about", (req, res) => {
	res.sendFile(path.join(publicPath, 'about_me.html'));
});

// Admin login other for initializing initAdmin.js
//Run this to log in the administrator after creating the one
//account using initAdmin.js
router.post('/login', async (req, res) => {
  const { password } = req.body;

  try {
	  
	  console.log('Received login request with password:', password);
	  
    // Find the admin (there's only one)
    const admin = await Admin.findOne();
    if (!admin) {
	  console.log('Admin not found in the database');
      return res.status(404).json({ message: 'Admin not found' });
    }
	
	console.log('Admin found in the database:', admin);

    // Compare passwords
    const isMatch = await admin.comparePassword(password);
	console.log('Password comparison result:', isMatch);
	
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
	
	// Generate a JWT token
    const token = jwt.sign({ id: admin._id }, 'your-secret-key', { expiresIn: '1h' });

    res.json({ token });
	
	if (typeof localStorage === "undefined" || localStorage === null) {
		var LocalStorage = require('node-localstorage').LocalStorage;
		localStorage = new LocalStorage('./scratch');
	}

	//localStorage.setItem('myFirstKey', 'myFirstValue');
	localStorage.setItem('adminToken', token);
	console.log('Token:', localStorage.getItem('adminToken'));
	
	
	
	
	
	
  } catch (err) {
	console.error('Error during login:', err);
    res.status(500).json({ message: err.message });
  }
});
	
	
	

// Register (Run once to create an admin)
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();

    res.json({ message: "Admin created" });
});

// Alternative login with username
router.post("/login2", async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
});

module.exports = router;

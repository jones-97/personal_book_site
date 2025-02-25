const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const crypt = require("crypto"); //to generate secure code
const path = require("path");



const router = express.Router();
const publicPath = path.join(__dirname, '/../public');



//app.use(express.static(path.join(__dirname, "public")));




//Set email sending variable
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Example function to send email; for testMail.js
async function sendResetEmail(to, code) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: "CHecking if Email by Nodemailer works",
        text: `Email by nodmailer works from your gmail if you are seeing this message!`
    });
}


// Admin List; might not work
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
	
	
	

// IGNORE; IN SEPARATE FILE; Register (Run once to create an admin)
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();

    res.json({ message: "Admin created" });
});

// IGNORE; Alternative login with username
router.post("/login2", async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
});


// Route to request a password reset
router.post('/request-reset', async (req, res) => {
    try {
		
        const admin = await Admin.findOne();
        if (!admin) return res.status(404).json({ message: "Admin not found." });

        // Generate a 6-digit verification code
        const resetCode = crypto.randomInt(100000, 999999).toString();
        admin.resetToken = resetCode;
        admin.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // Code expires in 10 minutes
        await admin.save();

        // Send the email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: "jonesmwaniki@ymail.com", // Change this to your admin email
            subject: "Password Reset Code",
            text: `Your verification code is: ${resetCode}`
        });

        res.json({ message: "Verification code sent to email." });
		
    } catch (error) {
        res.status(500).json({ message: "Error sending the reset code.", error });
		console.error("Error sending reset code: ", error);
    }
});

router.post('/reset-password', async (req, res) => {
    const { code, newPassword } = req.body;

    try {
        const admin = await Admin.findOne();
        if (!admin || admin.resetToken !== code || Date.now() > admin.resetTokenExpiry) {
            return res.status(400).json({ message: "Invalid or expired code." });
        }

        // Hash the new password
		console.log("New password input is: ", newPassword);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        admin.resetToken = null;
        admin.resetTokenExpiry = null;
        await admin.save();

        res.json({ message: "Password reset successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password.", error });
    }
});

//Test working of email
router.post('/test-email', async (req, res) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: "jonesmwaniki@ymail.com",
            subject: "Test Email",
            text: "This is a test email from the server."
        });

        res.json({ message: "Test email sent successfully." });
    } catch (error) {
        console.error("Error sending test email:", error);
        res.status(500).json({ message: "Error sending test email.", error });
    }
});


module.exports = router;

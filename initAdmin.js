
const Admin = require('./models/Admin');
const mongoose = require('mongoose');
const connectDB = require("./config/db");

mongoose.connect('mongodb://localhost:27017/my_site', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');

  // Check if an admin already exists
  const existingAdmin = await Admin.findOne();
  if (existingAdmin) {
    console.log('Admin already exists.');
    process.exit();
  }

  // Create a new admin
  const admin = new Admin({ password: 'your-default-password' });
  await admin.save();
  console.log('Admin created successfully.');
  process.exit();
})
.catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit();
});
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/userModel'); // Import the User model from userModel.js

const app = express();
const PORT = 3000;

const start = async () => {
    try {
      await mongoose.connect(
        "mongodb+srv://befit:L1CGELf3nAf80mnI@befit.q7dl2b0.mongodb.net/?retryWrites=true&w=majority"
      );
      console.log("Database Connection Established!");
    } catch (error) {
      console.error(error);
    }
  };

start();

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Routes and other middleware can be added here
app.get('/', (req, res) => {
  res.send('Hello from BeFit!');
});

// Sample API: Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Sample API: Create a new user
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required fields' });
  }

  try {
    const newUser = new User({ name, email });
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create a new user' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Gracefully disconnect from MongoDB when the server is closed
process.on('SIGINT', () => {
    mongoose.disconnect().then(console.log('Database Connection closed.'));
  process.exit(0);
});

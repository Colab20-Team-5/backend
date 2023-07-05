const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./userModel'); // Import the User model from userModel.js

const app = express();
const PORT = 3000;

// Mongoose Wrapper
const MongooseWrapper = {
  connect: (mongoURI) => {
    mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    mongoose.connection.on('connected', () => {
      console.log('Connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Error connecting to MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Disconnected from MongoDB');
    });
  },

  disconnect: () => {
    mongoose.disconnect();
  },

  getMongooseInstance: () => {
    return mongoose;
  },
};

// Replace 'your_mongo_uri' with your actual MongoDB connection URI
const mongoURI = 'mongodb://localhost:27017/your_database_name';

// Connect to MongoDB using the Mongoose wrapper
MongooseWrapper.connect(mongoURI);

// Middleware for accessing the Mongoose instance
app.use((req, res, next) => {
  req.mongoose = MongooseWrapper.getMongooseInstance();
  next();
});

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
  MongooseWrapper.disconnect();
  process.exit(0);
});

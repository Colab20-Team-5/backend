const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/userModel'); // Import the User model from userModel.js
const passport = require('passport');
const authService = require('./services/authService');
const passportSetup = require('./config/passportSetup');


const app = express();
const PORT = 5000;

const start = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://befit:L1CGELf3nAf80mnI@befit.q7dl2b0.mongodb.net/?retryWrites=true&w=majority"
        );
        console.log("Database Connection Established!");
    } catch (error) {
        console.error(error);
        process.exit(500);
    }
};

start();

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

app.use(passport.initialize());

// ############# GOOGLE AUTHENTICATION ################
// this will call passport-setup.js authentication in the config directory

app.get(
    '/auth/google',
    passport.authenticate('google', {
        session: false,
        scope: ["profile", "email"],
        accessType: "offline",
        approvalPrompt: "force"
    })
);

// callback url upon successful google authentication
app.get(
    '/auth/google/callback/',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        authService.signToken(req, res);
    }
);

// route to check token with postman.
// using middleware to check for authorization header
app.get('/verify', authService.checkTokenMW, (req, res) => {
    authService.verifyToken(req, res);
    if (null === req.authData) {
        res.sendStatus(403);
    } else {
        res.json(req.authData);
    }
});

// Routes and other middleware can be added here
app.get('/', (req, res) => {
    res.status(200).json({ status: 'Online', version: 1.1 });
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

// Sample API for workout plan
app.get('/api/getworkoutplan', async (req,res) => {
    res.status(200).json({ days: ["Monday", "Tuesday"], time: ["1 hour"], muscles: ["abs", "legs"]})
})


// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Gracefully disconnect from MongoDB when the server is closed
process.on('SIGINT', () => {
    mongoose.disconnect().then(console.log('Database Connection closed.'));
    process.exit(0);
});

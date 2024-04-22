// Import required modules
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');

// Create an Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Middleware for session management
app.use(session({
    secret: 'your-secret-key', // Replace with a strong and unique secret key
    resave: false,
    saveUninitialized: true
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route handler for login POST requests
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Connect to the database
    const db = new sqlite3.Database('database.db');

    // Authenticate user credentials
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
        if (err) {
            console.error('Error authenticating user:', err);
            res.status(500).send('Internal Server Error');
        } else {
            if (user) {
                // Set session variable to indicate user is logged in
                req.session.loggedIn = true;
                req.session.username = username; // Store username in session for future use
                res.redirect('/'); // Redirect to index page after successful login
            } else {
                res.status(401).send('Invalid username or password'); // Unauthorized status for incorrect credentials
            }
        }

        // Close the database connection
        db.close();
    });
});

// Route handler for signup POST requests
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Connect to the database
    const db = new sqlite3.Database('database.db');

    // Insert user information into the database
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('User signed up successfully');
            
            // Set session variable to indicate user is logged in
            req.session.loggedIn = true;
            req.session.username = username;

            // Redirect to index page or any other page you want to show after signup
            res.redirect('/');
        }

        // Close the database connection
        db.close();
    });
});

// Define route for the root URL ("/") to serve the index.html file
app.get('/', (req, res) => {
    // Check if user is logged in
    if (req.session.loggedIn) {
        // Render index page with user's name
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        // Render index page with login/signup button
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

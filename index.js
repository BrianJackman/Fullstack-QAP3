/*
Fullstack QAP 3
By Brian Jackman
2024/11/29
*/

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Configure session middleware
app.use(session({
    secret: 'your_secret_key', // Secret key for signing the session ID cookie
    resave: false, // Do not save session if unmodified
    saveUninitialized: true // Save uninitialized sessions
}));

// In-memory user storage
const users = [
    // Example admin user
    { username: 'admin', email: 'admin@example.com', password: '$2b$10$...', role: 'admin' }
];

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// Registration page route
app.get('/register', (req, res) => {
    res.render('register');
});

// Handle user registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.render('register', { error: 'All fields are required' });
    }
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.render('register', { error: 'User already exists' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, email, password: hashedPassword, role: 'user' });
        res.redirect('/login');
    } catch (error) {
        res.render('register', { error: 'Error registering user' });
    }
});

// Login page route
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.render('login', { error: 'All fields are required' });
    }
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.render('login', { error: 'Invalid email or password' });
    }
    try {
        if (await bcrypt.compare(password, user.password)) {
            req.session.userId = user.email;
            req.session.role = user.role;
            res.redirect('/landing');
        } else {
            res.render('login', { error: 'Invalid email or password' });
        }
    } catch (error) {
        res.render('login', { error: 'Error logging in' });
    }
});

// Landing page route
app.get('/landing', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    const user = users.find(u => u.email === req.session.userId);
    if (user.role === 'admin') {
        res.render('landing', { user, users });
    } else {
        res.render('landing', { user, users: [] });
    }
});

// Handle user logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// General error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
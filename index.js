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

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

const users = [];

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, email, password: hashedPassword, role: 'user' });
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.email;
        req.session.role = user.role;
        res.redirect('/landing');
    } else {
        res.send('Invalid email or password');
    }
});

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

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
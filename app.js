/*
Fullstack QAP 3
By Brian Jackman
2024/11/29
*/
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

const users = [];

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
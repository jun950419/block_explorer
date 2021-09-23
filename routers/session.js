const express = require('express');
const router = express.Router();
const session = require('express-session');

router.use(session({
    secret: 's3cr3t',
    resave: false,
    saveUninitialized: true,
}));

module.exports = router;

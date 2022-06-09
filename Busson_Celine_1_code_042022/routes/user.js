const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const valideEmail = require('../middleware/valideEmail');
const validePassword = require('../middleware/validePassword');

router.post('/signup', valideEmail, validePassword , userCtrl.signup);
router.post('/login', valideEmail, userCtrl.login);

module.exports = router;
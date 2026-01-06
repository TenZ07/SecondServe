const express = require('express');
const { registerUser, loginUser, deleteUser } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/user/:userId', deleteUser);

module.exports = router;
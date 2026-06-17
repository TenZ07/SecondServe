const express = require('express');
const { registerUser, loginUser, deleteUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/user/:userId', protect, deleteUser);

module.exports = router;
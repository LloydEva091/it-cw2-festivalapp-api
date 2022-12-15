const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getUsers, deleteUser, updateUser } = require("../controllers/usersController")
const protect = require("../middleware/authMiddleware");

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/').get(getUsers)
router.route('/:id').patch(protect, updateUser).delete(protect, deleteUser)

module.exports = router;

const User = require('../models/User');
const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    // get all user data without the method (cause of lean) and without password (cause of select -password)
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' });
    }
    res.json(users);
});

// @desc Create a new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Confirm Data
    // !Array.isArray(roles) || !roles.length
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for duplicate
    const duplicate = await User.findOne({ email }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate email' });
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

    // default role
    const roles = "Normal";

    const userObject = { email, "password": hashedPwd, roles };

    // Create and store new user
    const user = await User.create(userObject);

    //created
    if (user) {
        res.status(201).json({ message: `New user ${email} created` });
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    }
});

// @desc Update a new user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, email, roles, active, password } = req.body;

    // Confirm Data
    if (!id || !email || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    const user = await User.findById(id).exec();

    // If there is no user
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Check Duplicate
    const duplicate = await User.findOne({ email }).lean().exec();

    // Allow update to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ mesasge: 'Duplicate email' });
    }

    user.email = email;
    user.roles = roles;
    user.active = active;

    if (password) {
        //Hash password
        user.password = await bcrypt.hash(password, 10)// salt rounds
    }

    const updatedUser = await user.save();

    res.json({ message: `${updatedUser.email} updated` });
});

// @desc Delete a new user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' });
    }

    // Does the user still have assigned notes?
    const event = await Event.findOne({ user: id }).lean().exec();
    if (event?.length) {
        return res.status(400).json({ message: 'User has assigned events' });
    }

    const user = await User.findById(id).exec();

    // Does the user exist to delete?
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const result = await user.deleteOne();

    const reply = `Email ${result.email} with ID ${result._id} deleted`;

    res.json(reply);
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
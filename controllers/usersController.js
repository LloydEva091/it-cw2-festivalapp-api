const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const expressAsyncHandler = require("express-async-handler")
const User = require("../models/User")
const Event = require("../models/Event")

// @desc    Register new user
// @route   POST /users
// @access  Public
const registerUser = expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        res.status(400)
        throw new Error("Please add all fields")
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email })

    if (userExists) {
        res.status(400)
        throw new Error("User already exists")
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)


    // default role
    const roles = 2821;

    // Create user
    const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
        roles: roles
    })

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error("Invalid user data")
    }
})

// @desc    Authenticate a user
// @route   POST /users/login
// @access  Public
const loginUser = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({ email: email })

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            token: generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error("Invalid credentials")
    }
})


// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = expressAsyncHandler(async (req, res) => {
    const { id } = req.body;
    console.log(req.body)
    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID required' });
    }

    console.log(id)
    // Does the user still have assigned notes?
    const event = await Event.findOne({ user: id }).lean().exec();
    if (event !== null) {
        return res.status(400).json({ message: 'User has assigned events' });
    }
    // Confirm user exists to delete 
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    const result = await user.deleteOne();
    const reply = `User '${result.name}' with ID ${result._id} deleted`;
    res.json(reply);

});


// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = expressAsyncHandler(async (req, res) => {
    const { id, name, email, roles, active, password } = req.body;

    // console.log(req.body)

    if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!email) {
        return res.status(400).json({ message: 'email field are required' });
    } else if (!roles) {
        return res.status(400).json({ message: 'roles field are required' });
    } else if (!active) {
        return res.status(400).json({ message: 'active field are required' });
    }

    // Confirm user exists to update
    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Check for duplicate name
    const duplicate = await User.findOne({ name }).lean().exec();

    // Allow renaming of the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate user title' });
    }

    // Set new user data to the old user data
    user.name = name;
    user.email = email;
    user.roles = roles;
    user.active = active;

    if (password) {
        //Hash password
        user.password = await bcrypt.hash(password, 10)// salt rounds
    }

    const updatedUser = await user.save();
    res.json(`'${updatedUser.name}' updated`);
}
)

// @desc Get all users
// @route GET /users
// @access Private
const getUsers = expressAsyncHandler(async (req, res) => {
    // get all user data without the method (cause of lean) and without password (cause of select -password)
    // const user = await User.findById(req.params.id).select('-password').lean();
    const user = await User.find().lean();
    if (!user?.length) {
        return res.status(400).json({ message: 'No users found' });
    }
    res.json(user);
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, `${process.env.JWT_SECRET}`, {
        expiresIn: 60000,
    })
}

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    deleteUser,
    updateUser
}
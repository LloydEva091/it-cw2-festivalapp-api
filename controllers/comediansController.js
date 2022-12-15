const Event = require('../models/Event');
const User = require('../models/User');
const Comedian = require('../models/Comedian');
const asyncHandler = require('express-async-handler');


// @desc Get all comedians 
// @route GET /comedians
// @access Private
const getAllComedians = asyncHandler(async (req, res) => {
    // Get all comedians from MongoDB
    const comedians = await Comedian.find().lean();

    // If no comedians 
    if (!comedians?.length) {
        return res.status(400).json({ message: 'No comedians found' });
    }
    res.json(comedians);
});

// @desc Get a comedian
// @route GET /comedians/{id}
// @access Public
const getAComedian = asyncHandler(async (req, res) => {
    const id = req.body.id
    // Get a comedian from MongoDB
    const comedian = await Comedian.findById(id).exec();

    // If no comedians 
    if (!comedian?.length) {
        return res.status(400).json({ message: 'No comedian found' });
    }
    res.json(comedian);
});

// @desc Create new comedian
// @route POST /comedians
// @access Private
const createNewComedian = asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;

    // Confirm Data
    if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!description) {
        return res.status(400).json({ message: 'Description field are required' });
    } else if (!image) {
        return res.status(400).json({ message: 'Image are required' });
    }

    // Get user and check his permission level
    // const userRequesting = await User.findById(user).exec();
    // const userRole = await Promise.all(userObject.map(async (id) => {
    //     const userObj = await User.findById(userObj.id).lean().exec();
    // }))



    // Check for duplicate name
    const duplicate = await Comedian.findOne({ name }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate comedian' });
    }

    // Create and store the new user 
    const comedian = await Comedian.create({ name, description, image });

    if (comedian) { // Created 
        return res.status(201).json({ message: 'New comedian created' });
    } else {
        return res.status(400).json({ message: 'Invalid comedian data received' });
    }

});

// @desc Update a comedian
// @route PATCH /comedians
// @access Private
const updateComedian = asyncHandler(async (req, res) => {
    const { id, user, name, description, image } = req.body;

    // console.log(req.body)

    if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!description) {
        return res.status(400).json({ message: 'Description field are required' });
    } else if (!image) {
        return res.status(400).json({ message: 'Image are required' });
    }

    // Get user and check his permission level
    // const userRequesting = await User.findById(user).exec();


    // Confirm comedian exists to update
    const comedian = await Comedian.findById(id).exec();

    if (!comedian) {
        return res.status(400).json({ message: 'Comedian not found' });
    }

    // Check for duplicate name
    const duplicate = await Comedian.findOne({ name }).lean().exec();

    // Allow renaming of the original comedian 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate comedian title' });
    }

    // Set new comedian data to the old comedian data
    comedian.user = user;
    comedian.name = name;
    comedian.description = description;
    comedian.image = image;

    const updatedComedian = await comedian.save();

    res.json(`'${updatedComedian.name}' updated`);
}
)


// @desc Delete a comedian
// @route DELETE /comedians
// @access Private
const deleteComedian = asyncHandler(async (req, res) => {
    const { id } = req.body;
    console.log(req.body.id)

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Comedian ID required' });
    }

    // Does the comedian still have assigned events?
    const event = await Event.findOne({ comedian: id }).lean().exec();

    if (event !== null) {
        return res.status(400).json({ message: 'Comedian has assigned events, Please delete event first.' });
    } else {

        // Confirm comedian exists to delete 
        const comedian = await Comedian.findById(id).exec();

        if (!comedian) {
            return res.comedian_status(400).json({ message: 'Comedian not found' });
        }

        const result = await comedian.deleteOne();

        const reply = `Comedian '${result.name}' with ID ${result._id} deleted`;

        res.json(reply);
    }
});

module.exports = {
    getAllComedians,
    createNewComedian,
    updateComedian,
    deleteComedian,
    getAComedian
}
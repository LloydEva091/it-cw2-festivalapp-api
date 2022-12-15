const User = require('../models/User');
const Event = require('../models/Event')
const Venue = require('../models/Venue');
const asyncHandler = require('express-async-handler');


// @desc Get all venues 
// @route GET /venues
// @access Private
const getAllVenues = asyncHandler(async (req, res) => {
    // Get all venues from MongoDB
    const venues = await Venue.find().lean();

    // If no venues 
    if (!venues?.length) {
        return res.status(400).json({ message: 'No venues found' });
    }

    res.json(venues);
});

// @desc Create new venue
// @route POST /venues
// @access Private
const createNewVenue = asyncHandler(async (req, res) => {

    const { name, description, address, image } = req.body;
    console.log(req.body);
    // Confirm Data
    if (!name) {

        return res.status(400).json({ message: 'Name field are required' });
    } else if (!description) {
        return res.status(400).json({ message: 'Description field are required' });
    } else if (!address) {
        return res.status(400).json({ message: 'Address are required' });
    } else if (!image) {
        return res.status(400).json({ message: 'Image are required' });
    }



    // Check for duplicate name
    const duplicate = await Venue.findOne({ name }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate venue' });
    }

    // Create and store the new user 
    const venue = await Venue.create({ name, description, address, image });

    if (venue) { // Created 
        return res.status(201).json({ message: 'New venue created' });
    } else {
        return res.status(400).json({ message: 'Invalid venue data received' });
    }
}
);

// @desc Update a venue
// @route PATCH /venues
// @access Private
const updateVenue = asyncHandler(async (req, res) => {
    const { id, name, description, address, image } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!description) {
        return res.status(400).json({ message: 'Description field are required' });
    } else if (!address) {
        return res.status(400).json({ message: 'Address are required' });
    } else if (!image) {
        return res.status(400).json({ message: 'Image are required' });
    }


    // Confirm venue exists to update
    const venue = await Venue.findById(id).exec();

    if (!venue) {
        return res.status(400).json({ message: 'Venue not found' });
    }

    // Check for duplicate name
    const duplicate = await Venue.findOne({ name }).lean().exec();

    // Allow renaming of the original venue 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate venue title' });
    }

    // Set new venue data to the old venue data
    venue.name = name;
    venue.description = description;
    venue.address = address;
    venue.image = image;

    const updatedVenue = await venue.save();

    res.json(`'${updatedVenue.name}' updated`);
}
);

// @desc Delete a venue
// @route DELETE /venues
// @access Private
const deleteVenue = asyncHandler(async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Venue ID required' });
    }
    // Does the user still have assigned notes?
    const event = await Event.findOne({ venue: id }).lean().exec();

    if (event !== null) {
        return res.status(400).json({ message: 'Venue has assigned events, Please delete event first.' });
    } else {

        // Confirm venue exists to delete 
        const venue = await Venue.findById(id).exec();

        if (!venue) {
            return res.venue_status(400).json({ message: 'Venue not found' });
        }

        const result = await venue.deleteOne();

        const reply = `Venue '${result.name}' with ID ${result._id} deleted`;

        res.json(reply);
    }
});

module.exports = {
    getAllVenues,
    createNewVenue,
    updateVenue,
    deleteVenue
}
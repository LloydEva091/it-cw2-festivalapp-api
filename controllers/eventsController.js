const Event = require('../models/Event');
const User = require('../models/User');
const Comedian = require('../models/Comedian');
const Venue = require('../models/Venue');
const asyncHandler = require('express-async-handler');


// @desc Get all events 
// @route GET /events
// @access Private
const getAnEvent = asyncHandler(async (req, res) => {
    // Get an events from MongoDB
    const { id } = req.body;

    const event = await Event.findById(id).exec();

    // If no events 
    if (!event?.length) {
        return res.status(400).json({ message: 'No events found' });
    }

    // res.json(event);
    // Add comedian and venue to each event before sending the response 
    // You could also do this with a for...of loop

    const eventsWithcomedian = await Promise.all(event.map(async (evt) => {
        const comedian = await Comedian.findById(evt.comedian).lean().exec();
        const venue = await Venue.findById(evt.venue).lean().exec();
        return { ...evt, comedian_name: comedian.name, venue_name: venue.name, venue_address: venue.address };
    }))
    res.json(eventsWithcomedian);

    // const eventsWithUser = await Promise.all(events.map(async (event) => {
    //     const user = await User.findById(event.user).lean().exec();
    //     return { ...event, username: user.username };
    // }))

});

// @desc Get all events 
// @route GET /events
// @access Public
const getAllEvents = asyncHandler(async (req, res) => {
    // Get all events from MongoDB
    const events = await Event.find().lean();

    // If no events 
    if (!events?.length) {
        return res.status(400).json({ message: 'No events found' });
    }
    // Event sorted by date
    events.sort(function (a, b) {
        return new Date(a.date_time) - new Date(b.date_time)
    })

    // Today
    let today = Date.now();
    let activeEvent = []
    // Check if event is over todays date
    // NOTE: This change does not reflect on the DB, will need to perform save in order to so 
    for (const evt of events) {
        if (evt.date_time < today) {
            evt.active = false;
            // console.log(evt)
        }
        if (evt.active) {
            activeEvent.push(evt)
        }
    }


    const eventsWithAllInfo = await Promise.all(activeEvent.map(async (evt) => {
        // console.log(evt)
        const comedian = await Comedian.findById(evt.comedian).lean().exec();
        // console.log(comedian)
        const venue = await Venue.findById(evt.venue).lean().exec();
        // console.log(venue)
        return { ...evt, comedian_name: comedian.name, venue_name: venue.name, venue_address: venue.address };
    }))




    // console.log(eventsWithAllInfo);
    res.json(eventsWithAllInfo);
    // Add username to each event before sending the response 
    // You could also do this with a for...of loop
    // const eventsWithUser = await Promise.all(events.map(async (event) => {
    //     const user = await User.findById(event.user).lean().exec();
    //     return { ...event, username: user.username };
    // }))
    // res.json(eventsWithUser);
});

// @desc Create new event
// @route POST /events
// @access Private
const createNewEvent = asyncHandler(async (req, res) => {
    const { name, date_time, description, comedian, venue, image } = req.body;


    const user = req.user;
    // Confirm Data
    if (!user) {
        return res.status(400).json({ message: 'User field are required' });
    } else if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!date_time) {
        return res.status(400).json({ message: 'Date field are required' });
    } else if (!description) {
        return res.status(400).json({ message: 'Description field are required' });
    } else if (!comedian) {
        return res.status(400).json({ message: 'Comedian field are required' });
    } else if (!venue) {
        return res.status(400).json({ message: 'Venue field are required' });
    } else if (!image) {
        return res.status(400).json({ message: 'Image are required' });
    }


    // Check user roles
    if ((user.roles) == [5045]) {
        return res.status(403).json({ message: 'User does not have that permission' });
    } else {

        // Check for duplicate name
        const duplicate = await Event.findOne({ name }).lean().exec();

        if (duplicate) {
            return res.status(409).json({ message: 'Duplicate event' });
        }
        // Default status
        const active = true

        // Create and store the new user 
        const event = await Event.create({ user, name, date_time, description, comedian, venue, image, active });

        if (event) { // Created 
            return res.status(201).json({ message: 'New event created' });
        } else {
            return res.status(400).json({ message: 'Invalid event data received' });
        }
    }
});

// @desc Update a event
// @route PATCH /events
// @access Private
const updateEvent = asyncHandler(async (req, res) => {
    const { id, user, name, date_time, description, comedian, venue, image } = req.body;


    // Confirm data
    if (!user) {
        return res.status(400).json({ message: 'User field are required' });
    } else if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!date_time) {
        return res.status(400).json({ message: 'Date field are required' });
    } else if (!description) {
        return res.status(400).json({ message: 'Description field are required' });
    } else if (!comedian) {
        return res.status(400).json({ message: 'Comedian field are required' });
    } else if (!venue) {
        return res.status(400).json({ message: 'Venue field are required' });
    } else if (!image) {
        return res.status(400).json({ message: 'Image are required' });
    }


    // Check user roles
    if ((user.roles) == [5045]) {

        // Confirm event exists to update
        const event = await Event.findById(id).exec();

        if (!event) {
            return res.status(400).json({ message: 'Event not found' });
        }

        // Check for duplicate name
        const duplicate = await Event.findOne({ name }).lean().exec();

        // Allow renaming of the original event 
        if (duplicate && duplicate?._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate event title' });
        }

        // Set new event data to the old event data
        event.user = user;
        event.name = name;
        event.date_time = date_time;
        event.description = description;
        event.comedian = comedian;
        event.venue = venue;
        event.image = image;

        const updatedEvent = await event.save();

        res.json(`'${updatedEvent.name}' updated`);
    } else {
        return res.status(403).json({ message: 'User does not have that permission' });
    }
});

// @desc Delete a event
// @route DELETE /events
// @access Private
const deleteEvent = asyncHandler(async (req, res) => {
    const { id } = req.body;


    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Event ID required' });
    }



    // Confirm event exists to delete 
    const event = await Event.findById(id).exec();

    if (!event) {
        return res.status(400).json({ message: 'Event not found' });
    }

    const result = await event.deleteOne();

    const reply = `Event '${result.name}' with ID ${result._id} deleted`;

    res.json(reply);

});

module.exports = {
    getAllEvents,
    createNewEvent,
    updateEvent,
    deleteEvent,
    getAnEvent
}
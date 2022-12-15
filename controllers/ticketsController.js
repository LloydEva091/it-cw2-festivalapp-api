const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Event = require('../models/Event');
const Comedian = require('../models/Comedian');
const Venue = require('../models/Venue');
const asyncHandler = require('express-async-handler');


// @desc Get all tickets 
// @route GET /tickets
// @access Private
const getAllTickets = asyncHandler(async (req, res) => {
    // Get all tickets from MongoDB
    const ticket = await Ticket.find(({ user: req.user.id })).lean();

    // If no tickets 
    if (!tickets?.length) {
        return res.status(400).json({ message: 'No tickets found' });
    }

    // Add username to each ticket before sending the response 
    // You could also do this with a for...of loop
    const ticketsWithUser = await Promise.all(tickets.map(async (ticket) => {
        const user = await User.findById(ticket.user).lean().exec();
        return { ...ticket, username: user.username };
    }))
    res.json(ticketsWithUser);
});

// @desc Create new ticket
// @route POST /tickets
// @access Private
const createNewTicket = asyncHandler(async (req, res) => {
    const { user, name, text, type, event} = req.body;

    // Confirm Data
    if (!user) {
        return res.status(400).json({ message: 'User field are required' });
    } else if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!text) {
        return res.status(400).json({ message: 'Text field are required' });
    } else if (!type) {
        return res.status(400).json({ message: 'Type field are required' });
    } else if (!event) {
        return res.status(400).json({ message: 'Event field are required' });
    }

    // Check Permission
    if (!(user.type === 'Admin')) {
        return res.status(403).json({ message: 'User does not have that permission' });
    } else {

        // Check for duplicate name
        const duplicate = await Ticket.findOne({ name }).lean().exec();

        if (duplicate) {
            return res.status(409).json({ message: 'Duplicate ticket' });
        }

        // Create and store the new user 
        const ticket = await Ticket.create({ user, name, text, type, event});

        if (ticket) { // Created 
            return res.status(201).json({ message: 'New ticket created' });
        } else {
            return res.status(400).json({ message: 'Invalid ticket data received' });
        }
    }
});

// @desc Update a ticket
// @route PATCH /tickets
// @access Private
const updateTicket = asyncHandler(async (req, res) => {
    const { id, user, name, text, type, event } = req.body;


    // Confirm data
    if (!user) {
        return res.status(400).json({ message: 'User field are required' });
    } else if (!name) {
        return res.status(400).json({ message: 'Name field are required' });
    } else if (!text) {
        return res.status(400).json({ message: 'Text field are required' });
    } else if (!type) {
        return res.status(400).json({ message: 'Type field are required' });
    } else if (!event) {
        return res.status(400).json({ message: 'Event field are required' });
    }


    // Check user typing
    if ((user.type) === 'Admin') {

        // Confirm ticket exists to update
        const ticket = await Ticket.findById(id).exec();

        if (!ticket) {
            return res.status(400).json({ message: 'Ticket not found' });
        }

        // Check for duplicate name
        const duplicate = await Ticket.findOne({ name }).lean().exec();

        // Allow renaming of the original ticket 
        if (duplicate && duplicate?._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate ticket title' });
        }
        user, name, text, type, event
        // Set new ticket data to the old ticket data
        ticket.user = user;
        ticket.name = name;
        ticket.text = text;
        ticket.type = type;
        ticket.event = event;

        const updatedTicket = await ticket.save();

        res.json(`'${updatedTicket.name}' updated`);
    } else {
        return res.status(403).json({ message: 'User does not have that permission' });
    }
});

// @desc Delete a ticket
// @route DELETE /tickets
// @access Private
const deleteTicket = asyncHandler(async (req, res) => {
    const { id, user } = req.body;
    // Check user typing
    if (!(user.type === 'Admin')) {
        return res.status(403).json({ message: 'User does not have that permission' });
    } else {
        // Confirm data
        if (!id) {
            return res.status(400).json({ message: 'Ticket ID required' });
        }

        // Confirm ticket exists to delete 
        const ticket = await Ticket.findById(id).exec();

        if (!ticket) {
            return res.status(400).json({ message: 'Ticket not found' });
        }

        const result = await ticket.deleteOne();

        const reply = `Ticket '${result.name}' with ID ${result._id} deleted`;

        res.json(reply);
    }
});

module.exports = {
    getAllTickets,
    createNewTicket,
    updateTicket,
    deleteTicket
}
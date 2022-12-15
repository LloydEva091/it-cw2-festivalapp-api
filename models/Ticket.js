const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ticketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: [String],
            default: 'Adult',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        event: {
            type: mongoose.Types.Schema.ObjectId,
            required: true,
            ref: 'Event'
        }
    },
    {
        timestamps: true
    }
);

const ticketCheckoutSchema = new mongoose.Schema({
    ticket: [{
        type:mongoose.Types.Schema.ObjectId,
        required: true
    }],
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
});

// Create a new collection which tracks this sequencial number and continue to insert into our note
ticketSchema.plugin(AutoIncrement, 
    {
        inc_field: 'ticket',
        id: 'ticketNums',
        start_seq: 500
    });

module.exports = mongoose.model('Ticket', ticketSchema, ticketCheckoutSchema);
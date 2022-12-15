const mongoose = require('mongoose');


const eventSchema = new mongoose.Schema(
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
        description: {
            type: String,
            required: true
        },
        date_time: {
            type: Date,
            required: true
        },
        comedian: [{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Comedian'
        }],
        venue: [{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Venue'
        }],
        image: {
            type: String,
            required: true,
            default: ''
        },
        active: {
            type: Boolean,
            required: true,
            default: true
        }

        // ticket: {
        //     type: String,
        //     required: true
        // }
    },
    {
        timestamps: true
    }

);



module.exports = mongoose.model('Event', eventSchema);
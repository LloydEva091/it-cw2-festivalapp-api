const mongoose = require('mongoose');


const venueSchema = new mongoose.Schema(
    {   
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        address : {
            type: String
        },
        image: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }

);



module.exports = mongoose.model('Venue', venueSchema);
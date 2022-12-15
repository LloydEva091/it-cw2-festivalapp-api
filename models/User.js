const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    email: {
        type:String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true
    },
    roles: [{
        type:Number,
        default: "2821"
    }],
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require("mongoose");
const { Schema } = mongoose;
const messageSchema = new Schema({
    room: {
        type: String,
        required: true
    },
    writer: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);
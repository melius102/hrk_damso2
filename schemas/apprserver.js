const mongoose = require("mongoose");
const { Schema } = mongoose;
const apprserverSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    credential: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ApprServer', apprserverSchema);
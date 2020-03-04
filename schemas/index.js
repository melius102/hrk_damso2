const mongoose = require("mongoose");
const pKeys = require('../modules/private_keys');

module.exports = () => {
    const connect = () => {
        mongoose.connect(pKeys.mongodbUrl, // 1st url
            { // 2nd option
                useNewUrlParser: true,
                useUnifiedTopology: true
            }, (err) => { // 3rd callback
                if (err) {
                    console.log(err);
                } else {
                    console.log('connected at mongodb');
                }
            });
    }
    connect();

    mongoose.connection.on('error', err => console.log(err));
    mongoose.connection.on('disconnected', () => {
        console.log('try to reconnect at mongodb');
        connect();
    });

    require('./message');
    require('./apprserver');
};
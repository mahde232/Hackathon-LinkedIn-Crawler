const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: 'no-email-found'
    },
    profileLink: {
        type: String,
        required: true
    }
});

const profilesModel = mongoose.model('profiles', profileSchema);
module.exports = {
    profilesModel
};
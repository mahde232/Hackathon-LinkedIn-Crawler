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
        required: true
    },
    profileLink: {
        type: String,
        required: true
    }
});

const profilesModel = mongoose.model('profilesData', profileSchema);
module.exports = {
    profilesModel
};
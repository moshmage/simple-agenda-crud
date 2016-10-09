'use strict';
const mongoose = require('mongoose');
mongoose.connect('mongodb://foo:bar@ds035026.mlab.com:35026/mm-agenda');
mongoose.Promise = global.Promise;

let schema = mongoose.Schema;

let Person = new schema({
    fullName: { required: true, type: String, unique: false },
    phoneNumber: { required: true, type: String, unique: true },
    address: { required: true, type: String, unique: false },
    birthDay: { required: false, type: Date, unique: false }
});

let model = mongoose.model('Person', Person);

module.exports = {
    model
};
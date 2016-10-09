'use strict';
const entrySchema = require('./schema-entry');
const express = require('express');
let router = express.Router();

let API = [];
let PARAMS = [];
let SLUGS = {
    name: 'fullName',
    address: 'address',
    phone: 'phoneNumber'
};

function throwThis(message, status, res) {
    res.send(JSON.stringify({message, status}));
}

function getAllEntries(req, res) {
    entrySchema.model.find({},(err, entries) => {
        if (err) {
            throwThis(err, 404, res);
            return;
        }

        res.send(entries);
    });
}
function searchEntry(req, res) {
    let slug = SLUGS[req.route.path.split('/')[1]];

    if (!slug) {
        throwThis('Invalid action, somehow', 404, res);
        return;
    }

    entrySchema.model.find({[slug]: req.search}, (err, entries) => {
        res.send(JSON.stringify( err || entries));
    });
}
function viewSingleEntry(req, res) {
    if (req.entry) {
        res.send(JSON.stringify(req.entry));
    } else {
        entrySchema.model.findById(req.id, (err, entry) => {
            if (err) {
                throwThis('No such ID', 204, res);
                return;
            }
            res.send(JSON.stringify(req.entry));
        });
    }
}

function updateEntry(req, res) {
    let fullName = req.body.fullName || req.entry.name || false;
    let address = req.body.address || req.entry.address || false;
    let phoneNumber = req.body.phoneNumber || req.entry.phoneNumber || false;
    let birthDay = req.body.age || req.entry.age || false;

    entrySchema.model.findById(req.id, (err, entry) => {
        entry.update({fullName, phoneNumber, address, birthDay }, (err, entryID) => {
            if (!err) res.send(JSON.stringify({success: entryID}));
            else throwThis(err, 204);
        });
    });

}

function deleteEntry(req, res) {
    entrySchema.model.findById(req.id, (err, entry) => {
        entry.remove((err, oldEntry) => {
            if (!err) res.send(JSON.stringify({success: oldEntry._id}));
            else throwThis(err, 204, res);
        })
    });
}

function newEntry(req, res) {
    console.log(req.body);
    let fullName = req.body.fullName || false;
    let address = req.body.address || false;
    let phoneNumber = req.body.phoneNumber || false;
    let birthDay = req.body.age || new Date();

    if (!phoneNumber || !fullName) {
        res.send(JSON.stringify({error: "phoneNumber and fullName must not be empty"}));
        return;
    }

    let newEntry = new entrySchema.model({fullName, phoneNumber, address, birthDay});
    newEntry.save(err => {
        if (!err) res.send(JSON.stringify({success: 'new entry created'}));
        else throwThis(err, 204, res);
    });
}

function sanifyId(req, res, next, id) {
    entrySchema.model.findById(id, (err, entry) => {
        if (err) {
            throwThis('No such ID', 204, res);
            return;
        }
        req.id = id;
        req.entry = entry;
        next();
    });
}
function sanifySearch(req, res, next, search) {
    if (typeof search === 'string' || !parseInt(search,10)) {
        throwThis('Use string or numbers',409);
        return;
    }
    req.search = search;
    next();
}

API.push({path: '/all', method: 'get', fn: getAllEntries});

API.push({path: '/create', method: 'post', fn: newEntry});

API.push({path: '/read/:id', method: 'get', fn: viewSingleEntry});
API.push({path: '/name/:search', method: 'get', fn: searchEntry});
API.push({path: '/phone/:search', method: 'get', fn: searchEntry});
API.push({path: '/address/:search', method: 'get', fn: searchEntry});

API.push({path: '/update/:id', method: 'put', fn: updateEntry});
API.push({path: '/delete/:id', method: 'delete', fn: deleteEntry});

PARAMS.push({ param: 'id', fn: sanifyId });
PARAMS.push({ param: 'search', fn: sanifySearch });


API.forEach(object => {
    router[object.method](object.path, object.fn);
});

PARAMS.forEach(object => {
    router.param(object.param, object.fn);
});

module.exports = router;
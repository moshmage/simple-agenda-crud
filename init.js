/**
 * Created by Mosh Mage on 10/9/2016.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser= require('body-parser');
const methodOverride = require('method-override');

const PORT = process.env.PORT || 3000;
const MODULES_PATH = './modules/';
const MODULE_INIT = 'init.js';

let MODULES = {};
// let ROUTER = express.Router();
let app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride(function(req){
    if (req.body && typeof req.body === "object" && '_crud' in req.body) {
        let method = req.body._crud;
        delete req.body._crud;
        return method;
    }
}));

let modules = fs.readdirSync(MODULES_PATH);
modules.forEach(file => {
    let modulePath = path.resolve(MODULES_PATH, file, MODULE_INIT);
    let stats = fs.statSync(modulePath);

    if (stats.isFile()) {
        MODULES[file] = require(modulePath);
        app.use('/' + file, MODULES[file]);
        console.info('Loaded module "%s" into http://[root]/%s', file, file);
    }
});



app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => { res.render('index.html') });
app.listen(PORT, () => console.log('listening on %s', PORT) );



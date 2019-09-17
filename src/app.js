import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import basicAuth from "express-basic-auth";
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';

import * as db from './utils/DataBaseUtils';
import { serverPort } from "../etc/config.json";

const multer = require('multer');
const upload = multer({ dest: 'upload/' });
const bcrypt = require('bcrypt');

// const options = {
//     key: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/site.ru', 'privkey.pem')),
//     cert: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/site.ru', 'fullchain.pem'))
// }

const app = express();

db.setUpConnection();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors({ origin: '*' }));

app.use(
    basicAuth({
        authorizer: myAsyncAuthorizer,
        authorizeAsync: true,
    })
);



app.get('/users', (req, res) => {
    console.log('====================================')
    console.log(req.query)
    console.log('====================================')
    db.listUsers(req.query.page).then(async data => await res.send(data)).catch(err => res.send(err))
});

app.post('/user', (req, res) => {
    db.createUser(req.body).then(async data => { console.log(data); await res.send(data) }).catch(err => res.send(err))
});

app.get('/images/:id', (req, res) => {
    db.getImage(req.params.id).then(async data => await res.send(data)).catch(err => res.send(err))
});

app.get('/images', (req, res) => {
    db.listImages(req.query.page).then(async data => await res.send(data)).catch(err => res.send(err))
});

app.post('/images', upload.single('file'), (req, res) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    // res.send(file)

    db.createImage(file).then(data => res.send(data)).catch(err => res.send(err))
});

// app.patch('/images/:id', (req, res) => {
//     db.updateImage(req.params.id, req.body)
//         .then(
//             data => res.send(data)
//         )
//         .catch(
//             err => res.send(err)
//         )
// });

app.get('/items', (req, res) =>
    db.listItems(req.query.page, req.query.expiried)
        .then(data => res.send(data))
        .catch(err => res.send(err)));

app.get('/items/:id', (req, res) =>
    db.getItems(req.params.id)
        .then(data => res.send(data))
        .catch(err => res.send(err)));

app.post('/items', (req, res) =>
    db.createItems(req.body)
        .then(data => res.send(data))
        .catch(err => res.send(err)));

app.patch('/items/:id', (req, res) =>
    db.updateItems(req.params.id, req.body)
        .then(data => res.send(data))
        .catch(err => res.send(err)));

app.get('/check', (req, res) =>
    db.checkExpired()
        .then(data => res.send(data))
        .catch(err => res.send(err)));

function myAsyncAuthorizer(username, password, cb) {
    db.listUsers()
        .then(
            data => {

                data.forEach(
                    async (item, i) => {
                        const match = await bcrypt.compare(password, item.password);
                        if (match) {
                            if (item.name === username) {
                                data = []
                                return cb(null, true)
                            } else {
                                if (i === data.length - 1) {
                                    console.log("nok");
                                    return cb(null, false)
                                }
                            }
                        } else {
                            if (i === data.length - 1) {
                                return cb(null, false)
                            }
                        }
                    }
                )
            }
        )
}

// const server = https.createServer(options, app).listen(serverPort, function () {
//     console.log(`Express server listening on port ${serverPort}`);
// });
const server = http.createServer(app).listen(serverPort, function () {
    console.log(`Express server listening on port ${serverPort}`);
});
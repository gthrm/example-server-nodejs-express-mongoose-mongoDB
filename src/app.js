import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import basicAuth from "express-basic-auth";


import * as db from './utils/DataBaseUtils';
import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';

import { serverPort } from "../etc/config.json";

const bcrypt = require('bcrypt');

// const options = {
//     key: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/myjpg.ru', 'privkey.pem')),
//     cert: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/myjpg.ru', 'fullchain.pem'))
// }

const app = express();
db.setUpConnection();

app.use(bodyParser.json());

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

app.post('/images', (req, res) => {
    db.createImage(req.body).then(async data => await res.send(data)).catch(err => res.send(err))
});

app.patch('/images/:id', (req, res) => {
    db.updateImage(req.params.id, req.body)
        .then(
            data => res.send(data)
        )
        .catch(
            err => res.send(err)
        )
});

function myAsyncAuthorizer(username, password, cb) {
    db.listUsers()
        .then(
            data => {

                data.forEach(
                    async (item, i) => {

                        const match = await bcrypt.compare(password, item.password);
                        console.log('====================================')
                        console.log(match)
                        console.log('====================================')
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
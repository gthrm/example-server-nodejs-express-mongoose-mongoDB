import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'log-timestamp';
// Разкомментировать в продакшене для подключения SSL сертификата
// import https from 'https';

import http from 'http';
import path from 'path';

// Разкомментировать в продакшене для подключения SSL сертификата
// import fs from 'fs';

import * as db from './utils/DataBaseUtils';
import {PORT} from '../etc/config.json';
import {HandlerGenerator} from './utils/otherUtils';
import {checkToken} from './utils/JWTAuthorizer';

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {error: {code: 429, message: 'Too many requests from your IP. Please wait 2 Minutes'}},
});

const mime = require('mime');
const crypto = require('crypto');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './upload/');
  },
  filename: function(req, file, cb) {
    crypto.pseudoRandomBytes(16, function(err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  },
});
const upload = multer({storage: storage});

const handlers = new HandlerGenerator();

// Разкомментировать в продакшене для подключения SSL сертификата
// const options = {
//     key: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/site.ru', 'privkey.pem')),
//     cert: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/site.ru', 'fullchain.pem'))
// }

const app = express();

const server = http.createServer(app);

db.setUpConnection();

app.use(bodyParser.json());
app.use(cors({origin: '*'}));
app.use(helmet());
app.use(limiter);

app.post('/auth', handlers.login);

app.get('/users', checkToken, (req, res) => {
  db.listUsers(req.query.page).then((data) => res.send(data)).catch((err) => res.send(err));
});

app.post('/user', (req, res) => {
  db.createUser(req.body)
      .then((data) => {
        console.log('post user ', data);
        if (data.error) {
          res.status(data.error.code || 500);
        }
        res.send(data);
      })
      .catch((err) => res.send(err));
});

app.get('/images/:id', checkToken, (req, res) => {
  db.getImage(req.params.id).then((data) => res.send(data)).catch((err) => res.send(err));
});

app.get('/images', checkToken, (req, res) => {
  db.listImages(req.query.page).then((data) => res.send(data)).catch((err) => res.send(err));
});

app.post('/images', checkToken, upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  }
  console.log('file', file);
  if (file.size < 25000000) {
    db.createImage(file).then((data) => res.send(data)).catch((err) => res.send(err));
  } else {
    res
        .status(413)
        .contentType('text/plain')
        .end('File Too Large! Upload a file not exceeding 25 MB');
  }
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

app.get('/upload/:id', (req, res) => {
  console.log(req.params.id);
  res.sendFile(path.join(__dirname, `../upload/${req.params.id}`));
});

app.get('/items', checkToken, (req, res) =>
  db.listItems(req.query.page, req.query.expiried)
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

app.get('/items/:id', checkToken, (req, res) =>
  db.getItems(req.params.id)
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

app.post('/items', checkToken, (req, res) =>
  db.createItems(req.body)
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

app.patch('/items/:id', checkToken, (req, res) =>
  db.updateItems(req.params.id, req.body)
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

app.get('/check', checkToken, (req, res) =>
  db.checkExpired()
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

// server.listen(PORT, function () {
//     console.log(`Express server listening on port ${PORT}`);
// });
server.listen(PORT, function() {
  console.log(`Express server listening on port ${PORT}, open`, 'chrome://inspect', 'to debug');
});

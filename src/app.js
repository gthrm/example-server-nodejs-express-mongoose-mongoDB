import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import basicAuth from 'express-basic-auth';

// Разкомментировать в продакшене для подключения SSL сертификата
// import https from 'https';

import http from 'http';
import path from 'path';

// Разкомментировать в продакшене для подключения SSL сертификата
// import fs from 'fs';

import * as db from './utils/DataBaseUtils';
import {serverPort} from '../etc/config.json';

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
const bcrypt = require('bcrypt');

// Разкомментировать в продакшене для подключения SSL сертификата
// const options = {
//     key: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/site.ru', 'privkey.pem')),
//     cert: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/site.ru', 'fullchain.pem'))
// }

const app = express();

db.setUpConnection();

app.use(bodyParser.json());
app.use(cors({origin: '*'}));
app.use(
    basicAuth({
      authorizer: myAsyncAuthorizer,
      authorizeAsync: true,
    }),
);


app.get('/users', (req, res) => {
  db.listUsers(req.query.page).then((data) => res.send(data)).catch((err) => res.send(err));
});

app.post('/user', (req, res) => {
  db.createUser(req.body).then((data) => {
    console.log(data); res.send(data);
  }).catch((err) => res.send(err));
});

app.get('/images/:id', (req, res) => {
  db.getImage(req.params.id).then((data) => res.send(data)).catch((err) => res.send(err));
});

app.get('/images', (req, res) => {
  db.listImages(req.query.page).then((data) => res.send(data)).catch((err) => res.send(err));
});

app.post('/images', upload.single('file'), (req, res) => {
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

app.get('/items', (req, res) =>
  db.listItems(req.query.page, req.query.expiried)
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

app.get('/items/:id', (req, res) =>
  db.getItems(req.params.id)
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

app.post('/items', (req, res) =>
  db.createItems(req.body)
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

app.patch('/items/:id', (req, res) =>
  db.updateItems(req.params.id, req.body)
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

app.get('/check', (req, res) =>
  db.checkExpired()
      .then((data) => res.send(data))
      .catch((err) => res.send(err)));

/**
 * Функция авторизации пользователя из базы
 * @param {string} username - имя пользователя
 * @param {string} password - пароль
 * @param {string} cb - callback
 */
function myAsyncAuthorizer(username, password, cb) {
  db.listUsers()
      .then(
          (data) => {
            const itemList = data.map(async (item) => ({
              ...item,
              valid: await bcrypt.compare(password, item.password),
            }));
            Promise.all(itemList)
                .then(
                    (completed) => {
                      const itemOkList = completed.find((item) => item.valid === true && item._doc.name === username);
                      if (itemOkList) {
                        return cb(null, true);
                      }
                      return cb(null, false);
                    });
          },
      )
      .catch(
          (err) => console.error(err),
      );
}

// https.createServer(options, app).listen(serverPort, function () {
//     console.log(`Express server listening on port ${serverPort}`);
// });
http.createServer(app).listen(serverPort, function() {
  console.log(`Express server listening on port ${serverPort}`);
});

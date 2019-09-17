"use strict";

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _expressBasicAuth = _interopRequireDefault(require("express-basic-auth"));

var _https = _interopRequireDefault(require("https"));

var _http = _interopRequireDefault(require("http"));

var _path = _interopRequireDefault(require("path"));

var db = _interopRequireWildcard(require("./utils/DataBaseUtils"));

var _config = require("../etc/config.json");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const multer = require('multer');

const bcrypt = require('bcrypt'); // const options = {
//     key: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/myjpg.ru', 'privkey.pem')),
//     cert: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/myjpg.ru', 'fullchain.pem'))
// }


const app = (0, _express.default)();
db.setUpConnection();
app.use(_bodyParser.default.json());
app.use((0, _cors.default)({
  origin: '*'
}));
app.use((0, _expressBasicAuth.default)({
  authorizer: myAsyncAuthorizer,
  authorizeAsync: true
})); // app.use(multer({
//     dest: './uploads/',
//     rename: function (fieldname, filename) {
//         return filename;
//     },
// }));

app.get('/users', (req, res) => {
  console.log('====================================');
  console.log(req.query);
  console.log('====================================');
  db.listUsers(req.query.page).then(async data => await res.send(data)).catch(err => res.send(err));
});
app.post('/user', (req, res) => {
  db.createUser(req.body).then(async data => {
    console.log(data);
    await res.send(data);
  }).catch(err => res.send(err));
});
app.get('/images/:id', (req, res) => {
  db.getImage(req.params.id).then(async data => await res.send(data)).catch(err => res.send(err));
});
app.get('/images', (req, res) => {
  db.listImages(req.query.page).then(async data => await res.send(data)).catch(err => res.send(err));
});
app.post('/images', (req, res) => {
  console.log(req.files);
  db.createImage(req).then(data => res.send(data)).catch(err => res.send(err));
});
app.patch('/images/:id', (req, res) => {
  db.updateImage(req.params.id, req.body).then(data => res.send(data)).catch(err => res.send(err));
});
app.get('/items', (req, res) => db.listItems(req.query.page, req.query.expiried).then(data => res.send(data)).catch(err => res.send(err)));
app.get('/items/:id', (req, res) => db.getItems(req.params.id).then(data => res.send(data)).catch(err => res.send(err)));
app.post('/items', (req, res) => db.createItems(req.body).then(data => res.send(data)).catch(err => res.send(err)));
app.patch('/items/:id', (req, res) => db.updateItems(req.params.id, req.body).then(data => res.send(data)).catch(err => res.send(err)));
app.get('/check', (req, res) => db.checkExpired().then(data => res.send(data)).catch(err => res.send(err)));

function myAsyncAuthorizer(username, password, cb) {
  db.listUsers().then(data => {
    data.forEach(async (item, i) => {
      const match = await bcrypt.compare(password, item.password);
      console.log('====================================');
      console.log(match);
      console.log('====================================');

      if (match) {
        if (item.name === username) {
          data = [];
          return cb(null, true);
        } else {
          if (i === data.length - 1) {
            console.log("nok");
            return cb(null, false);
          }
        }
      } else {
        if (i === data.length - 1) {
          return cb(null, false);
        }
      }
    });
  });
} // const server = https.createServer(options, app).listen(serverPort, function () {
//     console.log(`Express server listening on port ${serverPort}`);
// });


const server = _http.default.createServer(app).listen(_config.serverPort, function () {
  console.log("Express server listening on port ".concat(_config.serverPort));
});
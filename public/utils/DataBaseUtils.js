"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUpConnection = setUpConnection;
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.getImage = getImage;
exports.listImages = listImages;
exports.createImage = createImage;
exports.getData = getData;
exports.listItems = listItems;
exports.getItems = getItems;
exports.createItems = createItems;
exports.updateItems = updateItems;
exports.checkExpired = checkExpired;

require("core-js/modules/es6.array.sort");

var _mongoose = _interopRequireDefault(require("mongoose"));

var _fs = _interopRequireDefault(require("fs"));

var _config = _interopRequireDefault(require("../../etc/config.json"));

require("../models/Model");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bcrypt = require('bcrypt');

const saltRounds = 10;

const User = _mongoose.default.model('User');

const Img = _mongoose.default.model('Img');

const Item = _mongoose.default.model('Item');

const Image = _mongoose.default.model('Image');

function setUpConnection() {
  _mongoose.default.connect("mongodb://".concat(_config.default.db.username, ":").concat(_config.default.db.pass, "@").concat(_config.default.db.host, ":").concat(_config.default.db.port, "/").concat(_config.default.db.name));
}

function listUsers(page) {
  //номер страницы с 0
  let items;

  if (page !== undefined) {
    items = page * 10;
  } else {
    items = 0;
  }

  return User.find().sort('createdAt').skip(items).limit(10);
}

async function createUser(data) {
  const hash = await bcrypt.hash(data.password, saltRounds);
  const user = new User({
    name: data.name,
    number: data.number,
    password: hash,
    secondName: data.secondName,
    email: data.email,
    tel: data.tel,
    org: data.org,
    createdAt: new Date()
  });
  return user.save();
}

function getImage(id) {
  return Image.findOne({
    _id: id
  });
}

function listImages() {
  let page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  // return Img.find();
  let images = page * 10;
  return Image.find().sort('createdAt').skip(images).limit(10);
}

function createImage(file) {
  const image = new Image({
    data: _fs.default.readFileSync(file.path),
    contentType: file.mimetype ? file.mimetype : 'image/png',
    createdAt: new Date()
  }); // console.log('====================================')
  // console.log(data.prototypeModel)
  // console.log('====================================')
  // return data

  return image.save();
} // export function updateImage(id, params) {
//     return Image.findOneAndUpdate({ _id: id }, { $set: params }, { new: true });
// }


function getData() {
  return Img.find();
}

function listItems() {
  let page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  let expiried = arguments.length > 1 ? arguments[1] : undefined;
  let item = page * 10;
  let expiredValue = expiried ? {
    "expiried": expiried,
    "deleted": false
  } : {
    "deleted": false
  }; // console.log('====================================')
  // console.log(page, expiried)
  // console.log('====================================')

  return Item.find(expiredValue).sort('createdAt').skip(item).limit(10);
}

function getItems(id) {
  return Item.findOne({
    _id: id
  });
}

function createItems(data) {
  const item = new Item({
    title: data.title,
    description: data.description,
    deleted: data.deleted,
    expiriesDate: data.expiriesDate
  });
  return item.save();
}

function updateItems(id, params) {
  return Item.findOneAndUpdate({
    _id: id
  }, {
    $set: params
  }, {
    new: true
  });
}

async function checkExpired() {
  return listItems().then(data => {
    const filterItems = data.filter(item => {
      let newDate = new Date(item.expiriesDate);
      newDate.setMonth(newDate.getMonth() - 3); //минус три месяца на реализацию

      console.log(newDate < new Date(), new Date(item.expiriesDate));
      return newDate < new Date();
    });
    return filterItems;
  }).catch(err => err);
}
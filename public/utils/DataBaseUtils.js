"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUpConnection = setUpConnection;
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.listImages = listImages;
exports.createImage = createImage;
exports.getData = getData;
exports.getImage = getImage;
exports.updateImage = updateImage;

require("core-js/modules/es6.array.sort");

var _mongoose = _interopRequireDefault(require("mongoose"));

var _config = _interopRequireDefault(require("../../etc/config.json"));

require("../models/Model");

var _assert = require("assert");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const bcrypt = require('bcrypt');

const saltRounds = 10;

const User = _mongoose.default.model('User');

const Img = _mongoose.default.model('Img');

let now = new Date();

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

function listImages(page) {
  // return Img.find();
  let images;

  if (page !== undefined) {
    images = page * 10;
  } else {
    images = 0;
  }

  return Img.find().sort('createdAt').skip(images).limit(10);
}

function createImage(data) {
  const img = new Img({
    title: data.title,
    url: data.url,
    createdAt: new Date()
  });
  return img.save();
}

function getData() {
  return Img.find();
}

function getImage(id) {
  return Img.findOne({
    _id: id
  });
}

function updateImage(id, params) {
  return Img.findOneAndUpdate({
    _id: id
  }, {
    $set: params
  }, {
    new: true
  });
}
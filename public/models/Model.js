"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  secondName: {
    type: String
  },
  email: {
    type: String
  },
  tel: {
    type: String
  },
  org: {
    type: String
  },
  createdAt: {
    type: Date
  }
});
const ImgSchema = new Schema({
  title: {
    type: String
  },
  number: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date
  }
});
const ItemSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  deleted: {
    type: Boolean,
    default: false
  },
  expiriesDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  expiried: {
    type: Boolean,
    default: false
  }
});

_mongoose.default.model('Img', ImgSchema);

_mongoose.default.model('User', UserSchema);

_mongoose.default.model('Item', ItemSchema);
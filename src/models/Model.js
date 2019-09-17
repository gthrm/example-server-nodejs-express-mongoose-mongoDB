import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name        : { type: String, required: true },
    password    : { type: String, required: true },
    secondName  : { type: String },
    email       : { type: String },
    tel         : { type: String },
    org         : { type: String },
    createdAt   : { type: Date }
});

const ImgSchema = new Schema({
    title    : { type: String },
    number   : { type: String },
    url      : { type: String, required: true },
    createdAt: {type: Date}
});

mongoose.model('Img', ImgSchema);
mongoose.model('User', UserSchema);
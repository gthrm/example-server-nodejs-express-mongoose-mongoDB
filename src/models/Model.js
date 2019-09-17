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
    createdAt: { type: Date }
});

const ImageSchema = new Schema({
    data        : { type: Buffer, required: true },
    contentType : { type: String, required: true },
    createdAt   : { type: Date, default: new Date() }
});

const ItemSchema = new Schema({
    title       : { type: String, required: true },
    description : { type: String },
    deleted     : { type: Boolean, default: false },
    expiriesDate: { type: Date, required: true },
    createdAt   : { type: Date, default: new Date() },
    expiried    : { type: Boolean, default: false }
});

mongoose.model('Img', ImgSchema);
mongoose.model('User', UserSchema);
mongoose.model('Item', ItemSchema);
mongoose.model('Image', ImageSchema);

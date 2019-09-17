import mongoose from "mongoose";
import config from '../../etc/config.json';
import '../models/Model';
import { throws } from "assert";

const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = mongoose.model('User');
const Img = mongoose.model('Img');
let now = new Date();

export function setUpConnection() {
    mongoose.connect(`mongodb://${config.db.username}:${config.db.pass}@${config.db.host}:${config.db.port}/${config.db.name}`);
}

export function listUsers(page) {
    //номер страницы с 0
    let items;
    if (page !== undefined) {
        items = page * 10
    } else {
        items = 0
    }

    return User.find().sort('createdAt').skip(items).limit(10);
}

export async function createUser(data) {

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

export function listImages(page) {
    // return Img.find();
    let images;
    if (page !== undefined) {
        images = page * 10
    } else {
        images = 0
    }
    return Img.find().sort('createdAt').skip(images).limit(10);
}

export function createImage(data) {
    const img = new Img({
        title: data.title,
        url: data.url,
        createdAt: new Date()
    });

    return img.save();
}

export function getData() {
    return Img.find();
}

export function getImage(id) {
    return Img.findOne({ _id: id });
}

export function updateImage(id, params) {
    return Img.findOneAndUpdate({ _id: id }, { $set: params }, { new: true });
}


import mongoose from "mongoose";
import fs from 'fs';

import config from '../../etc/config.json';
import '../models/Model';

const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = mongoose.model('User');
const Img = mongoose.model('Img');
const Item = mongoose.model('Item');
const Image = mongoose.model('Image');

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

export function getImage(id) {
    return Image.findOne({ _id: id });
}

export function listImages(page = 0) {
    // return Img.find();
    let images = page * 10;

    return Image.find().sort('createdAt').skip(images).limit(10);
}

export function createImage(file) {
    const image = new Image({
        data: fs.readFileSync(file.path),
        contentType: file.mimetype ? file.mimetype : 'image/png',
        createdAt: new Date()
    });
    return image.save();
}

// export function updateImage(id, params) {
//     return Image.findOneAndUpdate({ _id: id }, { $set: params }, { new: true });
// }

export function getData() {
    return Img.find();
}

export function listItems(page = 0, expiried) {
    let item = page * 10
    let expiredValue = expiried ? { "expiried": expiried, "deleted": false } : { "deleted": false };
    // console.log('====================================')
    // console.log(page, expiried)
    // console.log('====================================')
    return Item.find(expiredValue).sort('createdAt').skip(item).limit(10);
}

export function getItems(id) {

    return Item.findOne({ _id: id });
}

export function createItems(data) {
    const item = new Item({
        title: data.title,
        description: data.description,
        deleted: data.deleted,
        expiriesDate: data.expiriesDate
    });
    return item.save();
}

export function updateItems(id, params) {
    return Item.findOneAndUpdate({ _id: id }, { $set: params }, { new: true });
}

export async function checkExpired() {
    return listItems()
        .then(
            data => {
                const filterItems = data.filter(item => {
                    let newDate = new Date(item.expiriesDate);
                    newDate.setMonth(newDate.getMonth() - 3); //минус три месяца на реализацию
                    console.log(newDate < new Date(), new Date(item.expiriesDate));

                    return newDate < new Date()
                });
                return filterItems;
            }
        )
        .catch(
            err => err
        )
}
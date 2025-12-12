const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String
})

const sellerSchema = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String
})

const productSchema = new Schema({
    title: String,
    discription: String,
    price: Number,
    imageUrl: String,
    creatorId: ObjectId
})

const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId
})

const userModel = mongoose.model("user", userSchema);
const sellerModel = mongoose.model("seller", sellerSchema);
const productModel = mongoose.model("product", productSchema)
const purchaseModel = mongoose.model("purchase", purchaseSchema)


module.exports = {
    userModel,
    sellerModel,
    productModel,
    purchaseModel
}

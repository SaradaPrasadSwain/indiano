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
    productId: ObjectId,
    // purchaseDate: {type: Date, default: Date.now},
    


})

const orderSchema = new Schema({
    userId: ObjectId,
    productId: ObjectId,
    orderDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: [ 'pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    quantity: {type: Number, default: 1},
    totalAmount: Number,
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signeture: String,
    // currency: {type: String, default: 'INR'},
    paymentStatus: {type: String , enum: ['pending', 'completed', 'failed'], default: 'pending'}
    
})

const userModel = mongoose.model("user", userSchema);
const sellerModel = mongoose.model("seller", sellerSchema);
const productModel = mongoose.model("product", productSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);
const orderModel = mongoose.model("order", orderSchema);


module.exports = {
    userModel,
    sellerModel,
    productModel,
    purchaseModel,
    orderModel
}

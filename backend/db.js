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
    password: String,

    isApproved: {type: Boolean, default: false},
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    businessName: String,
    businessAddress: String,
    phone: String,
    gstNumber: String,
    rejectionReason: String,
    approvedBy: ObjectId,
    approvedAt: Date,
    createdAt: {type: Date, default: Date.now}
})

const adminSchema = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator'],
        default: 'admin'
    },
    permissions: {
        canApproveSellers: {type: Boolean, default: true},
        canModerateProducts: {type: Boolean, default: true},
        canManageOrders: {type: Boolean, default: true},
        canViewAnalytics: {type: Boolean, default: true},
        canManageAdmins: {type: Boolean, default: false}
    },
    createdAt: {type: Date, default: Date.now},
    lastLogin: Date
})

const productSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: ObjectId,

    isApproved: {type: Boolean, default: false},
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: String,
    approvedBy: ObjectId,
    approvedAt: Date,
    isActive: {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now}
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
    razorpay_signature: String,
    // currency: {type: String, default: 'INR'},
    paymentStatus: {
        type: String ,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
    
})

const userModel = mongoose.model("user", userSchema);
const sellerModel = mongoose.model("seller", sellerSchema);
const adminModel = mongoose.model("admin", adminSchema);
const productModel = mongoose.model("product", productSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);
const orderModel = mongoose.model("order", orderSchema);


module.exports = {
    userModel,
    sellerModel,
    adminModel,
    productModel,
    purchaseModel,
    orderModel
}

const {Router} = require("express");
const { userMiddleware } = require("../middleware/user")
const { productModel } = require("../db")
const Razorpay = require('razorpay')
const crypto = require('crypto')
const {razorpayKeyId, razorpayKeySecret} = require("../config")
const productRouter = Router();


// const razorpay = new Razorpay({
//     key_id: razorpayKeyId,
//     key_secret: razorpayKeySecret
// })

// productRouter.post("/purchase",userMiddleware, async function(req, res){
//     const userId = req.userId;
//     const productId = req.body.productId;

//     await purchaseModel.create({
//         userId,
//         productId
//     })
//     res.json({
//         message: "purchased successfully"
//     })
// })

productRouter.get("/preview", async function(req, res) {

    try {
        const products = await productModel.find({
            isApproved: true,
            isActive: true
        });
        res.json({
            products   
        })
    } catch (error) {
        res.status(500).json({message: "Failed to fetch products"});
    }
})

module.exports = {
    productRouter: productRouter
}
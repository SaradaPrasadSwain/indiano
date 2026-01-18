const {Router} = require('express');
const {userMiddleware} = require('../middleware/user')
const Razorpay = require('razorpay');
const crypto = require('crypto');
const {orderModel, productModel} = require('../db')
const { razorpayKeyId, razorpayKeySecret } = require('../config');

const paymentRouter = Router();

const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
})


paymentRouter.post("/create",  async function(req, res){
    try {
        const userId = "696d214dadd7f4d7ac393cc0"
        const { orderId } = req.body
    
        const order = await orderModel.findOne({
            userId: userId,
            _id: orderId
        })
    
        if(!order){
            return res.status(400).json({ message: "Order Id is required"});
        }
    
        if(order.paymentStatus === "completed"){
            return res.status(400).json({ message: "Order already paid"});
        }
    
        if(order.paymentStatus === "cancelled"){
            return res.status(400).json({ message: "can't pay for cancelled order"})
        }
    
        const product = await productModel.findById(order.productId);
    
        if (!product){
            return res.status(404).json({ message: "product not found"})
         }
    
        const razorpayOrderOptions = {
            amount: order.totalAmount * 100,
            currency: "INR",
            receipt: `order_${order._id}`,
            notes: {
                orderId: order._id.toString(),
                productId: product._id.toString(),
                userId: userId.toString()
            }
        }
    
        const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

        order.razorpay_order_id = razorpayOrder.id;
        await order.save();
    
        res.json({
            success: true,
            key: razorpayKeyId,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            order_id: razorpayOrder.id,
            name: "Indiano",
            description: product.title,
            image: product.imageUrl || 'https://toppng.com/uploads/preview/sunscreen-11547061535kwsf3fkhj5.png',
            prefill: {
                name: "",
                email: "",
                contact: ""
            },
            theme: {
                color: "#3399cc"
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create Razorpay order"
        })
    }
})



paymentRouter.post("/verify-payment",  async function(req, res){
    try {
        const userId = "6941a6368a90d040118dc315";
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        console.log(razorpay_order_id, razorpay_payment_id);
    
        const order = await orderModel.findOne({
            userId: userId,
            _id: orderId,
            razorpay_order_id: razorpay_order_id
        })
    
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
    
        const expectedSign = crypto
            .createHmac("sha256", razorpayKeySecret)
            .update(sign.toString())
            .digest("hex");
    
        if(razorpay_signature === expectedSign) {
            order.razorpay_payment_id = razorpay_payment_id;
            order.razorpay_signature = razorpay_signature;
            order.paymentStatus = 'completed';
            order.status = 'confirmed';
            await order.save();
    
            res.json({
                success: true,
                message: "payment verified successfully",
                order: {
                    orderId: order._id,
                    status: order.status,
                    paymentStatus: order.paymentStatus
                }
            })
        } else {
            order.paymentStatus = 'failed';
            await order.save();
    
            res.status(400).json({
                message: "Payment verification failed - Invalid Signature"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Payment varification failed"
        })
    }

});

paymentRouter.post("/payment-failed",  async function(req, res){
    try {
        const userId = "6941a6368a90d040118dc315";
        const { orderId, error } = req.body
    
        const order = await orderModel.findOne({
            _id: orderId,
            userId: userId
        });
    
        order.paymentStatus = 'failed';
        await order.save();
        res.json({
            message: "Payment failure recorded",
            order: {
                orderId: order._id,
                paymentStatus: order.paymentStatus
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to record payment failure"
        })
    }
})

paymentRouter.get("/status/:orderId", async function(req, res){
    try {
        const userId = "6941a6368a90d040118dc315";
        const { orderId } = req.params;
    
        const order = await orderModel.findOne({
            _id: orderId,
            userId: userId
        })
    
        res.json({
            orderId: order._id,
            paymentStatus: order.paymentStatus,
            orderStatus: order.status,
            razorpay_order_id: order.razorpay_order_id,
            razorpay_payment_id: order.razorpay_payment_id
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to get payment status",
            error: error.message
        })
    }
})
module.exports = {
    paymentRouter: paymentRouter
}
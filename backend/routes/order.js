const {Router} = require("express");
const orderRouter = Router();
const { userMiddleware } = require("../middleware/user");
const { orderModel, productModel } = require("../db");

orderRouter.post("/create", async function(req, res){
    try {
        const userId = "6941a6368a90d040118dc315";
        const {productId, quantity } = req.body;
    
        if(!productId) {
            return res.status(400).json({ message: "productId is required"});
        }
    
        const product = await productModel.findById(productId);
    
        if (!product) {
            return res.status(500).json({ message: "product not found"})
        }
    
        const qty = quantity || 1;
        const totalAmount = product.price * qty;
    
        const order = await orderModel.create({
            userId,
            productId,
            quantity: qty,
            totalAmount,
        });
    
        res.status(201).json({
            message: "Order created successfully",
        })
    } catch (error) {
        res.status(500).json({
            message: "There is some error in the order create route"
        })
    }
})  


orderRouter.get("/my-orders", userMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
    
        const orders = await orderModel.find({userId}).sort({orderDate: -1});
    
        let ordersWithProducts = [];
        for( let i = 0; i < orders.length; i++) {
            const product = await productModel.findById(orders[i].productId);
    
            ordersWithProducts.push({
                orderId: orders[i]._id,
                orderDate: orders[i].orderDate,
                status: orders[i].status,
                quantity: orders[i].quantity,
                totalAmount: orders[i].totalAmount,
                product: product ? {
                    productId: product._id,
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.imageUrl
                } : null
            })
        }
    
        res.json({
            message: "order fetched successfully",
            orders: ordersWithProducts
        })
    } catch (error) {
        res.status(500).json({
            message: "there is some error in my-orders section"
        })
    }
})


orderRouter.get("/:orderId", userMiddleware, async function(req, res){
    try {
        const userId =  req.userId;
        const { orderId } = req.params;
    
        const order = await orderModel.findOne({
            _id: orderId,
            userId: userId
        });
    
        if(!order){
            return res.status(403).json({message: "Order not found"});
        }
        
        const product = await productModel.findById(order.productId);
    
        res.json({
            order: {
                orderId: order._id,
                orderDate: order.orderDate,
                status: order.status,
                quantity: order.quantity,
                totalAmount: order.totalAmount,
                product: product ? {
                    productId: product._id,
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.imageUrl
                } : null
            }
    
        })
    } catch (error) {
        res.status(500).json({
            message: "You have some problem in the orderId"
        })
    }
})

orderRouter.put("/:orderId/cancel", userMiddleware, async function(req, res){
    try {
        const userId = req.userId;
        const { orderId } = req.params;
    
        const order = await orderModel.findOne({
            _id: orderId,
            userId: userId
        })

        if(!order){
            res.json({
                message: "order not found"
            })
        }

        if(order.status !== 'pending'){
            return res.status(400).json({
                message: `cannot cancel order with status ${order.status}`
            })
        }
    
        order.status = 'cancelled';
        await order.save();
    
        
    
        res.json({
            message: "order cancelled successfully",
            order: {
                orederId: order._id,
                status: order.status
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "failed to cancel the order",
        })
    }
})


orderRouter.put("/:orderId/status", userMiddleware, async function(req, res){
    try {
        const userId = req.userId;
        const{ orderId } = req.params;
        const { status } = req.body
    
    
        const order = await orderModel.findOne({
            _id: orderId, 
            userId: userId
        })
    
        order.status = status;
        await order.save();
    
        res.json({
            order: {
                orderId: order._id,
                status: order.status
            }
        })
    } catch (error) {
        res.status(400).json({
            message: "please give valid status"
        })
    }
})


module.exports = {
    orderRouter: orderRouter
}
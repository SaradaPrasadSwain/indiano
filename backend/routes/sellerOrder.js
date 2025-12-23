const { Router } = require("express");
const { sellerMiddleware } = require("../middleware/seller");
const { productModel, orderModel } = require("../db");
const sellerOrderRouter = Router();

sellerOrderRouter.get('/orders', sellerMiddleware, async function(req, res){
    try {
        const sellerId = req.userId;
    
        const sellerProducts = await productModel.find({ creatorId: sellerId})
        const productIds = sellerProducts.map(p => p._id);
    
        const orders = await orderModel.find({
            productId: { $in: productIds}
        }).sort({orderDate: -1});
    
        let ordersWithDetails = [];
    
        for(let i = 0; i < orders.length; i++){
            const product = await productModel.findById(orders[i].productId);
    
            ordersWithDetails.push({
                orderId: orders[i]._id,
                orderDate: orders[i].orderDate,
                status: orders[i].status,
                quantity: orders[i].quantity,
                totalAmount: orders[i].totalAmount,
                customerId: orders[i].userId,
                product: product ? {
                    productId: product._id,
                    title: product.title,
                    price: product.price
                } : null
            })
        }
    
        res.json({
            message: "Orders fetched successfully", 
            totalOrders: ordersWithDetails.length,
            orders: ordersWithDetails
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders"
        })
    }
})


sellerOrderRouter.get("/stats", sellerMiddleware, async function(req, res){
    const sellerId = req.userId;

    const sellerProducts = await productModel.find({creatorId : sellerId});
    const productIds = sellerProducts.map(p => p._id);

    const allOrders = await orderModel.find({
        productId: { $in: productIds}
    })
    


    const stats = {
        totalOrders: allOrders.length
    }

    res.json({
        productIds,
        stats
    })
})


sellerOrderRouter.put("/orders/:orderId/status", sellerMiddleware, async function(req, res){
    try {
        const sellerId = req.userId
        const { orderId } = req.params
        const { status } = req.body
    
        const order = await orderModel.findById(orderId);
    
        const product = await productModel.findById(order.productId);
   
        order.status = status;
        await order.save();
    
        res.json({
            order: {
                orderId: order._id,
                status: order.status
            }
        })
    } catch (error) {
        res.status(500).json({
             message: "Failed to update status"
        })       
    }
})

module.exports = {
    sellerOrderRouter: sellerOrderRouter
}
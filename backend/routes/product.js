const {Router} = require("express");
const { userMiddleware } = require("../middleware/user")
const { purchaseModel, productModel } = require("../db")
const productRouter = Router();

productRouter.post("/purchase",userMiddleware, async function(req, res){
    const userId = req.userId;
    const courseId = req.courseId;

    await purchaseModel.create({
        userId,
        courseId
    })
    res.json({
        message: "Signup: endpoint"
    })
})

productRouter.get("/preview", async function(req, res) {

    const products = await productModel.find({});
    res.json({
        products   
    })
})

module.exports = {
    productRouter: productRouter
}
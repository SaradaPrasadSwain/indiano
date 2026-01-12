const {Router} = require('express');
const sellerRouter = Router();
const {sellerModel} = require('../db')
const {productModel} = require('../db')
const jwt = require('jsonwebtoken');
const { sellerSecretKey } = require('../config')
const {sellerMiddleware} = require('../middleware/seller')
const bcrypt = require('bcrypt')

sellerRouter.post('/signup', async(req, res) => {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
  
      if(!name || !email || !password){
          return res.status(400).json({message: "All fields are required"});
      }
  
      await sellerModel.create({
          name: name,
          email: email,
          password: await bcrypt.hash(password, 5)
      });
      res.redirect("/api/v1/seller/signin");
    } catch (error) {
      res.status(500).json({
        message: "inter server error"
      })
    }
})


sellerRouter.post('/signin', async(req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
  
    const seller = await sellerModel.findOne({
      email : email
    }) 
    if(!seller){
      return res.status(404).json({message: "Seller not found"});
    }
  
    const hashedPassword = await bcrypt.compare(password, seller.password)
  
    if(!seller.isApproved) {
      return res.status(403).json({
        message: "Your account is not approved",
        approvalStatus: seller.approvalStatus,
        rejectionReason: seller.rejectionReason
      });
    }

    const token = jwt.sign({id: seller._id}, sellerSecretKey);
    
    res.cookies('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    res.json({
      token,
      message: "Login Successful",
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        isApproved: seller.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error"
    })
  }

  
})



sellerRouter.post("/product",sellerMiddleware, async function(req, res) {
  const sellerId = req.userId ;
  const {title, description, imageUrl, price} = req.body;

  const product = await productModel.create(
    {
    title: title,
    description: description,
    imageUrl: imageUrl,
    price: price,
    creatorId: sellerId
  })
  
  
  res.json({
        message: "product Get endpoint",
        productId: product._id
    })
})


sellerRouter.put("/product", sellerMiddleware, async function(req, res) {
  const sellerId = req.userId ;
  const {title, description, imageUrl, price, productId} = req.body;

  const product = await productModel.updateOne(
    {
    _id: productId,
    creatorId: sellerId
  }, {
    title: title,
    description: description,
    imageUrl: imageUrl,
    price: price,
    creatorId: sellerId
  })
  
  
  res.json({
        message: "product updated",
        productId: product._id
    })
})



sellerRouter.get("/product/bulk", sellerMiddleware, async function(req, res) {

  const sellerId = req.userId;

  const products = await productModel.find({
    creatorId: sellerId
  })
    res.json({
      message: "course updated",
      products
    })
})

sellerRouter.get("/signup", (req, res) => {
  res.send('you are in Register page');
})

sellerRouter.get("/signin", (req, res) => {
  res.send('Hello you are in Login page');
})

module.exports = {
    sellerRouter: sellerRouter
}
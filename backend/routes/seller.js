const {Router} = require('express');
const sellerRouter = Router();
const {sellerModel} = require('../db')
const {productModel} = require('../db')
const jwt = require('jsonwebtoken');
const { sellerSecretKey } = require('../config')
const {sellerMiddleware} = require('../middleware/seller')
const bcrypt = require('bcrypt')

sellerRouter.post('/signup', async(req, res) => {
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
})


sellerRouter.post('/signin', async(req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const seller = await sellerModel.findOne({
    email : email
  })  

  const hashedPassword = await bcrypt.compare(password, seller.password)

  if(hashedPassword){
    const token = jwt.sign({id: seller._id}, sellerSecretKey);
    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    res.json(token);
  }

  else{
      res.status(404).json({message: "Please check username and password"})
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
        message: "course Get endpoint",
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
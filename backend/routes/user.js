const {Router} = require("express");
const userRouter = Router();
const bcrypt = require('bcrypt');
const {userModel, productModel} = require('../db')
const jwt = require('jsonwebtoken');
const { userSecretKey } = require('../config');
const {userMiddleware} = require('../middleware/user')

userRouter.post('/signup', async(req, res) => {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
  
  
      await userModel.create({
          name: name,
          email: email,
          password: await bcrypt.hash(password, 5)
      });
      res.redirect("/api/v1/user/signin");
    } catch (error) {
      res.status(403).json({
        message: "please check your credentials"
      })
    }
})



userRouter.post('/signin', async(req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
  
    const user = await userModel.findOne({
      email : email
    })  
  
    const hashedPassword = await bcrypt.compare(password, user.password)
  
    if(hashedPassword){
      const token = jwt.sign({id: user._id}, userSecretKey);
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
  } catch (error) {
    res.status(403).json({
      message: "Plesase check your signin credentials"
    })
  }

})


userRouter.get("/signup", (req, res) => {
  res.send('you are in Register page');
})

userRouter.get("/signin", (req, res) => {
  res.send('Hello you are in Login page');
})



// userRouter.get('/purchases', userMiddleware, async function(req, res){
//   const userId = req.userId;

//   const purchases = await purchaseModel.find({
//     userId,
//   })
  
//   let purchasedProductIds = [];

//   for (let i = 0; i<purchases.length;i++){ 
//       purchasedProductIds.push(purchases[i].productId)
//   }

//   const productsData = await productModel.find({
//       _id: { $in: purchasedProductIds }
//   })

//   res.json({
//     purchases,
//     productsData: productsData
//   })
// })



module.exports = {
    userRouter: userRouter
}
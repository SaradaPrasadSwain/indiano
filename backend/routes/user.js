const {Router} = require("express");
const userRouter = Router();
const bcrypt = require('bcrypt');
const {userModel, productModel} = require('../db')
const jwt = require('jsonwebtoken');
const { userSecretKey } = require('../config');
const {userMiddleware} = require('../middleware/user')
const { z } = require('zod')

const { sendOtpEmail } = require('../email');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

userRouter.post('/signup', async(req, res) => {
    try {

      const zodBody = z.object({
        name: z.string().min(3).max(100),
        email: z.string().email().min(3).max(100),
        password: z.string().min(3).max(100)
      })

      const parsedDataWithSuccess = zodBody.safeParse(req.body);

      if(!parsedDataWithSuccess.success){
        return res.status(400).json({
          message: "Invalid creadentials",
          errors:parsedDataWithSuccess.error.errors
        })
      }

      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;

      const existingUser = await userModel.findOne({ email })
      if(existingUser){
        return res.status(400).json({
          message: "Email already registered"
        })
      }
    
      const otp = generateOtp();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      
      await userModel.create({
          name: name,
          email: email,
          password: await bcrypt.hash(password, 12),
          isEmailVerified: false,
          emailOtp: otp,
          otpExpires: otpExpires,
      });


      await sendOtpEmail(email, otp);

      res.status(201).json({
        message: "signup successful! please check your email for the otp",
        email: email
      })
    } catch (error) {
      console.log("Sign up error is :", error)
      res.status(403).json({
        message: "please check your credentials"
      })
    }
})

userRouter.post('/verify-otp', async(req, res) => {
  try {
    const {email, otp} = req.body;
  
    if(!email || !otp){
      return res.status(400).json({
        message: "Email and Otp are required"
      });
    }
  
    const user = await userModel.findOne({ email });
  
    if(!user){
      return res.status(404).json({
        message: "User not found"
      })
    }
  
    if(user.isEmailVerified) {
      return res.status(404).json({
        message: "Email already verified"
      })
    }
  
    if(user.otpExpires < Date.now()){
      return res.status(400).json({
        message: "Otp expired. please request the new one"
      })
    }
  
  
    if(user.emailOtp !== otp){
      return res.status(400).json({
        message: "Invalid Otp"
      })
    }
  
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
  
  
    res.json({
      message: "Email verified successfully! you can sign in."
    })
  } catch (error) {
    res.status(500).json({
      message: "verification failed"
    })
  }
})

userRouter.post('/resend-otp', async(req, res) => {
  try {
    const { email } = req.body;
  
    const user = await userModel.findOne({ email });
  
    if(!user){
      return res.status(404).json({
        message: "User not found"
      })
    }
  
    if(user.isEmailVerified){
      return res.status(400).json({
        message: "Email already verified"
      })
    }
  
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  
    user.emailOtp = otp;
    user.otpExpires = otpExpires
    await user.save();
  
    await sendOtpEmail(email, otp);
    res.json({
      message: "New otp send to your email"
    })
  } catch (error) {
    res.status(403).json({
      message: "Please check your sigin credentials"
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

    if(!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    if(!user.isEmailVerified){
      return res.status(403).json({
        message: "Please verify ur email before signing in"
      })
    }
  
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
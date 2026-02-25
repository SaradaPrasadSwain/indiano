const userSecretKey = process.env.USER_SECRET_KEY
const sellerSecretKey = process.env.SELLER_SECRET_KEY
const adminSecretKey = process.env.ADMIN_SECRET_KEY
const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
const sendGridApiKey = process.env.SENDGRID_API_KEY
const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL
module.exports = {
    userSecretKey: userSecretKey,
    sellerSecretKey: sellerSecretKey,
    adminSecretKey: adminSecretKey,
    razorpayKeyId: razorpayKeyId,
    razorpayKeySecret: razorpayKeySecret,
    sendGridApiKey: sendGridApiKey,
    sendGridFromEmail: sendGridFromEmail
}

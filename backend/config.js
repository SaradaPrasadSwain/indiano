const userSecretKey = process.env.USER_SECRET_KEY
const sellerSecretKey = process.env.SELLER_SECRET_KEY
const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

module.exports = {
    userSecretKey: userSecretKey,
    sellerSecretKey: sellerSecretKey,
    razorpayKeyId: razorpayKeyId,
    razorpayKeySecret: razorpayKeySecret
}

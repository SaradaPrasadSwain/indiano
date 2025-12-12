const express = require("express");
const dotenv = require('dotenv');
dotenv.config()
const app = express();
app.use(express.json());
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
app.use(cookieParser());
const { userRouter } = require("./routes/user");
const { sellerRouter } = require("./routes/seller");
const { productRouter } = require("./routes/product");
const port =process.env.PORT || 3000;
const mongoose = require("mongoose");
mongoose.connect(process.env.mongodbUrl)


app.get('/', (req, res) => {
    res.send("Hello world res send");
})

app.use("/api/v1/user", userRouter);
app.use("/api/v1/seller", sellerRouter);
app.use("/api/v1/product", productRouter);

app.listen(port, () => {
    console.log("Hello world");
})


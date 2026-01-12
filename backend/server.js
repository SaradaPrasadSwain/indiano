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
const { adminRouter } = require("./routes/admin");
const { productRouter } = require("./routes/product");
const { orderRouter } = require("./routes/order");
const { sellerOrderRouter } = require("./routes/sellerOrder")
const { paymentRouter } = require("./routes/payment")
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
const port =process.env.PORT || 3000;
const mongoose = require("mongoose");
mongoose.connect(process.env.mongodbUrl);



app.get('/', (req, res) => {
    res.send("Hello world res send");
})

app.use("/api/v1/user", userRouter);
app.use("/api/v1/seller", sellerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/sellerorder", sellerOrderRouter);
app.use("/api/v1/payment", paymentRouter);

app.listen(port, () => {
    console.log(`app is running on port ${port}`);
})


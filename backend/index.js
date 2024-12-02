const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const Razorpay = require("razorpay")

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.send("Hello World!");
})

app.post('/orders', async(req, res) => {
    if (!req.body.amount || !req.body.currency) {
        return res.status(400).json({ error: 'Amount and currency are required' });
      }
    const razorpay = new Razorpay({
        key_id: "your_key_id",
        key_secret: "your_key_secret"
    })

    const options = {
        amount: req.body.amount,
        currency: req.body.currency,
        receipt: "receipt#1",
        payment_capture: 1
    }

    try {
        const response = await razorpay.orders.create(options)

        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send("Internal server error");
    }
})

app.get("/payment/:paymentId", async(req, res) => {
    const {paymentId} = req.params;

    const razorpay = new Razorpay({
        key_id: "your_key_id",
        key_secret: "your_key_secret"
    })
    
    try {
        const payment = await razorpay.payments.fetch(paymentId)

        if (!payment || !payment.status) {
            return res.status(500).json({ error: "Payment not found" });
          }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency
        })
    } catch(error) {
        console.error("Failed to fetch payment:", error);
        res.status(500).json({ error: "Failed to fetch payment" });
    }
})


app.listen(port, () => {
    console.log(`server is running on ${port}`);
})
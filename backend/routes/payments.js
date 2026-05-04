const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

// GET /payments
router.get("/", async function(req, res){
  try{
    const payments= await Payment.find();
    res.json(payments);
  }
  catch (err){
    res.status(500).json({ message: "Server error (payments.js)"});
  }
});

// POST /payments
router.post("/", async function(req, res){
  try{
    const newPayment= new Payment({
      fromRoommate: req.body.fromRoommate,
      toRoommate: req.body.toRoommate,
      amount: req.body.amount
    });
    const savedPayment= await newPayment.save();
    res.status(201).json(savedPayment);
  } 
  catch (err){
    res.status(500).json({message: "Server error (payments.js)"});
  }
});

// GET /payments/:id
router.get("/:id", async function(req, res){
  try{
    const payment= await Payment.findById(req.params.id);
    if (!payment){
      return res.status(404).json({message: "Payment not found"});
    }
    res.json(payment);
  } 
  catch (err) {
    res.status(500).json({ message: "Server error (payments.js)" });
  }
});
module.exports = router;

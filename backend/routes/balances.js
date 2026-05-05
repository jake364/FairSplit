const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Payment = require("../models/Payment");
const Roommate = require("../models/Roommate");

//get balance
router.get("/", async function(req, res){
  try{
    const roommates= await Roommate.find();
    const expenses= await Expense.find();
    const payments= await Payment.find();
    const bal= {};
    
    roommates.forEach(function(roommate){
      bal[roommate._id]={
        name: roommate.name,
        paid:0,
        owed:0,
        balance:0
      };
    });

    expenses.forEach(function(expense){
      if (expense.paidBy && bal[expense.paidBy]){
        bal[expense.paidBy].paid += expense.amount;
      }

     //calculate the split 
      const participants = expense.splitWith || [];
      const numPeople = participants.length + 1; 
      const sharePerPerson = expense.amount / numPeople;

      // 3. Update "Owed" for the Payer (They owe their own share)
      if (expense.paidBy && bal[expense.paidBy]) {
        bal[expense.paidBy].owed += sharePerPerson;
      }

     //updated owed 
      participants.forEach(function(participantId){
        if(bal[participantId]){
          bal[participantId].owed += sharePerPerson;
        }
      });
    });

    payments.forEach(function (payment){
      if (bal[payment.fromRoommate]){
        bal[payment.fromRoommate].paid += payment.amount;
      }
    });

    Object.keys(bal).forEach(function(id){
      bal[id].balance= bal[id].paid- bal[id].owed;
    });
    res.json(bal);
  } 
  catch (err){
    res.status(500).json({message: "Server error (balances.js)"});
  }
});
module.exports= router;
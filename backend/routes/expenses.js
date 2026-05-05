const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");


router.get("/", async function(req, res){
  try{
    const expenses= await Expense.find();
    res.json(expenses);
  } 
  catch (err){
    res.status(500).json({message: "Server error (expenses.js)"});
  }
});


router.post("/", async function(req, res){
  try{
    const tempExpense = new Expense({
      title: req.body.title,
      amount: req.body.amount,
      category: req.body.category,
      paidBy: req.body.paidBy,
      splitWith: req.body.splitWith //saves who it is shared
    });
    const savedExpense = await tempExpense.save();
    res.status(201).json(savedExpense);
  } 
  catch (err){
    res.status(500).json({message: "Server error (expenses.js)"});
  }
});


router.get("/:id", async function(req, res){
  try{
    const expense= await Expense.findById(req.params.id);
    if (!expense){
      return res.status(404).json({message: "Expense not found"});
    }
    res.json(expense);
  } 
  catch (err){
    res.status(500).json({message: "Server error (expenses.js)"});
  }
});

// PUT /expenses/:id
router.put("/:id", async function(req, res){
  try{
    const updatedExpense= await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new: true}
    );
    if (!updatedExpense){
      return res.status(404).json({message: "Expense not found"});
    }
    res.json(updatedExpense);
  } 
  catch (err){
    res.status(500).json({message: "Server error (expenses.js)"});
  }
});

//delete
router.delete("/:id", async function(req, res){
  try{
    const expense= await Expense.findByIdAndDelete(req.params.id);

    if (!expense){
      return res.status(404).json({message: "Expense not found"});
    }
    res.json({message: "Expense deleted"});
  } 
  catch (err){
    res.status(500).json({message: "Server error (expenses.js)"});
  }
});


router.post("/:id/splits", async function(req, res){
  try{
    const expense= await Expense.findById(req.params.id);
    if (!expense){
      return res.status(404).json({message: "Expense not found"});
    }
    const newSplitamount= {
      week: req.body.week,
      splitDetails: req.body.splitDetails
    };
    expense.splits.push(newSplitamount);
    const updatedExpense= await expense.save();
    res.status(201).json(updatedExpense);
  } 
  catch (err) {
    res.status(500).json({message: "Server error (expenses.js)"});
  }
});

//get
router.get("/:id/splits", async function(req, res){
  try{
    const expense= await Expense.findById(req.params.id);
    if (!expense){
      return res.status(404).json({message: "Expense not found"});
    }
    res.json(expense.splits);
  } 
  catch (err){
    res.status(500).json({message: "Server error (expenses.js)"});
  }
});

//expenses 
router.get("/:id/splits/:splitid", async function(req, res){
  try{
    const expense= await Expense.findById(req.params.id);
    if (!expense){
      return res.status(404).json({message: "Expense not found"});
    }

    const split= expense.splits.id(req.params.splitid);
    if (!split){
      return res.status(404).json({message: "Split not found"});
    }
    res.json(split);
  } 
  catch (err){
    res.status(500).json({message: "Server error (expenses.js)"});
  }
});
module.exports = router;

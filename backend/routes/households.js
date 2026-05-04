const express = require("express");
const router = express.Router();
const Household = require("../models/Household");

// GET /households
router.get("/", async function(req, res){
  try{
    const households= await Household.find();
    res.json(households);
  } 
  catch (err){
    res.status(500).json({message: "Server error (households.js)"});
  }
});

// POST /households
router.post("/", async function(req, res) {
  try{
    const newHousehold= new Household({name: req.body.name});
    const savedHousehold= await newHousehold.save();
    res.status(201).json(savedHousehold);
  } 
  catch (err){
    res.status(500).json({message: "Server error (households.js)"});
  }
});

// GET /households/:id
router.get("/:id", async function(req, res){
  try{
    const household= await Household.findById(req.params.id);
    if (!household){
      return res.status(404).json({message: "Household not found"});
    }
    res.json(household);
  } 
  catch (err){
    res.status(500).json({ message: "Server error (households.js)"});
  }
});
module.exports= router;
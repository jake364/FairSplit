const express = require("express");
const router = express.Router();
const Roommate = require("../models/Roommate");

// GET /roommates
router.get("/", async function(req, res){
  try{
    const roommates= await Roommate.find();
    res.json(roommates);
  } 
  catch (err) {
    res.status(500).json({message: "Server error (roommates.js)"});
  }
});

// POST /roommates
router.post("/", async function (req, res) {
  try{
    const newRoommate= new Roommate({
      name: req.body.name,
      householdId: req.body.householdId
    });
    const savedRoommates= await newRoommate.save();
    res.status(201).json(savedRoommates);
  } 
  catch (err) {
    res.status(500).json({message: "Server error (roommates.js)"});
  }
});

// DELETE /roommates/:id
router.delete("/:id", async function(req, res){
  try{
    const roommates= await Roommate.findByIdAndDelete(req.params.id);
    if (!roommates){
      return res.status(404).json({message: "Roommate not found"});
    }
    res.json({message: "Roommate deleted"});
  } 
  catch (err) {
    res.status(500).json({message: "Server error (roommates.js)"});
  }
});
module.exports= router;
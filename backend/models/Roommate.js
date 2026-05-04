const mongoose = require("mongoose");

const roommateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household" // NOTE: I had to look up ref as I wanted automatic linking as it in theory is easier and I'm still learning things about mongoose. Jake C
  } 
});

const Roommate = mongoose.model("Roommate", roommateSchema);
module.exports = Roommate;
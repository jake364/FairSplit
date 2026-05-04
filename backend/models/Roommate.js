const mongoose = require("mongoose");

const roommateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    required: true
  }
});

module.exports = mongoose.model("Roommate", roommateSchema);

const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema({
  householdName: {
    type: String,
    required: true
  },
  roommates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate"
  }]
});

module.exports = mongoose.model("Household", householdSchema);

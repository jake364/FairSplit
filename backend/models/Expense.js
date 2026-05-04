const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  splits: [{
    roommate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roommate"
    },
    amount: Number
  }]
});

module.exports = mongoose.model("Expense", expenseSchema);

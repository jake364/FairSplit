const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema({
  week: {
    type: String,
    required: true
  },
  splitDetails: [
    {
      roommateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roommate"
      },
      amountOwed: {
        type: Number,
        required: true
      }
    }
  ]
});

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
    ref: "Roommate"
  },
  date: {
    type: Date,
    default: Date.now
  },
  splits: [splitSchema] 
});
const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
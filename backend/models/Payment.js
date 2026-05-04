const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  fromRoommate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
    required: true
  },
  toRoommate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roommate",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Payment", paymentSchema);

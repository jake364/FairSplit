const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/households", require("./routes/households"));
app.use("/roommates", require("./routes/roommates"));
app.use("/expenses", require("./routes/expenses"));
app.use("/payments", require("./routes/payments"));
app.use("/balances", require("./routes/balances"));

mongoose.connect("mongodb+srv://group7:p%40ssw0rd@groupproject.9daacyt.mongodb.net/FairSplit?appName=groupProject")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.listen(3000, () => {
  console.log("FairSplit server running on port 3000");
});

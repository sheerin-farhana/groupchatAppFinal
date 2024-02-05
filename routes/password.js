const express = require("express");
const route = express.Router();
const {
  forgotpassword,
  resetpassword,
  updatepassword,
} = require("../controllers/resetpassword");

route.use("/forgotpassword", forgotpassword);
route.get("/reset/:id", resetpassword);
route.get("/updatepassword/:resetpasswordid", updatepassword);

module.exports = route;

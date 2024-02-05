const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  try {
    //Check if the email already exists
    const existingUser = await User.findOne({
      where: {
        Email: email,
      },
    });

    if (existingUser) {
      //throw error , if email exixts
      res.status(403).json({ success: false, msg: "Email already exists" });
      return;
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      // create new user if email is unique
      const newUserData = await User.create({
        Name: name,
        Email: email,
        Phone: phone,
        Password: hash,
      });
      res.status(200).json({ data: newUserData.dataValues });
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

function generateAccessToken(id, name) {
  return jwt.sign({ userId: id, name: name }, process.env.TOKEN);
}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (isStringValid(email) || isStringValid(password)) {
    return res
      .status(400)
      .json({ success: false, msg: "Email or password is missing" });
  }

  try {
    const user = await User.findOne({
      where: {
        Email: email,
      },
    });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.Password);

      if (isMatch) {
        res.status(200).json({
          success: true,
          message: "User login successful",
          token: generateAccessToken(user.id, user.Name),
          userId: user.id,
        });
      } else {
        res
          .status(400)
          .json({ success: false, msg: "Password  does not match" });
      }
    } else {
      res.status(404).json({ success: false, msg: "Emaild does not exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

function isStringValid(data) {
  if (data == undefined || data.length === 0) {
    return true;
  } else {
    return false;
  }
}

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ success: true, msg: "users fetched", users: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};
module.exports = { signup, login, getAllUsers };

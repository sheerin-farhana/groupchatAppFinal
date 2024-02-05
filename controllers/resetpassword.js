const uuid = require("uuid");
const sgmail = require("@sendgrid/mail");
const bcrypt = require("bcrypt");

const { User } = require("../models/User");
const { ForgotPassword } = require("../models/ForgotPassword");

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      where: {
        Email: email,
      },
    });

    if (user) {
      const id = uuid.v4();
      await ForgotPassword.create({
        id,
        UserId: user.id,
        active: true,
      });

      sgmail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: email,
        from: "sheerinfarhana25@gmail.com",
        subject: "Reset password link",
        text: "Reset password",
        html: `<a href="http://localhost:3000/password/reset/${id}">Reset password</a>`,
      };
      sgmail
        .send(msg)
        .then((response) => {
          console.log("Email sent");
          return res.status(response[0].statusCode).json({
            msg: "Link to reset password sent to your mail ",
            success: true,
          });
        })
        .catch((error) => {
          console.error(error);
          throw new Error(error);
        });
    } else {
      throw new Error("User doesn't exist");
    }
  } catch (err) {
    console.error(err);
    return res.json({ msg: err, success: false });
  }
};

const resetpassword = (req, res) => {
  const id = req.params.id;
  ForgotPassword.findOne({ where: { id } }).then((forgotpasswordrequest) => {
    if (forgotpasswordrequest) {
      forgotpasswordrequest.update({ active: false });
      res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>
                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`);
      res.end();
    }
  });
};

const updatepassword = async (req, res) => {
  try {
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;

    console.log(newpassword);
    console.log(resetpasswordid);

    const resetpasswordrequest = await ForgotPassword.findOne({
      where: { id: resetpasswordid },
    });

    if (resetpasswordrequest) {
      const user = await User.findOne({
        where: { id: resetpasswordrequest.UserId },
      });

      if (user) {
        const saltRounds = 10;

        bcrypt.genSalt(saltRounds, async (err, salt) => {
          if (err) {
            console.log(err);
            throw new Error(err);
          }

          bcrypt.hash(newpassword, salt, async (err, hash) => {
            if (err) {
              console.log(err);
              throw new Error(err);
            }

            await user.update({ Password: hash });

            res
              .status(201)
              .json({ msg: "Successfully updated the new password" });
          });
        });
      } else {
        return res
          .status(404)
          .json({ error: "No user exists", success: false });
      }
    } else {
      return res.status(404).json({
        success: false,
        msg: "Reset request not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error, success: false });
  }
};

module.exports = { forgotpassword, resetpassword, updatepassword };

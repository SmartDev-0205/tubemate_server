const User = require("../models/User");
const Invite = require("../models/Invite");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


////////////////////////////////////////////////////////////////////
var nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');



// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
  auth: {
    api_key: '340f73ab73fbd55e84bfc24ef2910440-15b35dee-32534390',
    domain: 'sandbox1c841837d35b41deb2bd621e41aaacdf.mailgun.org'
  }
}

const sgMail = nodemailer.createTransport(mg(auth));
/////////////////////////////////////////////////////////////////

// const s3Client = require("../config/s3Client");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey('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');


// const AWS = require("aws-sdk");

// const s3Client = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_SECRET_KEY,
//   region: "us-east-1",
// });

const uploadParams = {
  Bucket: "mymarvin-storage",
  Key: "", // pass key
  Body: null, // pass file body
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user) {
      res.status(400).json({
        message: "Not found user",
      });
    } else {
      // check password
      const checkPassword = await bcrypt.compareSync(password, user.password);
      console.log(">>checkPassword: ", checkPassword);
      if (!checkPassword) {
        res.status(403).json({
          message: "Password incorrect",
        });
      } else if (!user.verify) {
        res.status(403).json({
          message:
            "The account has not been activated. Please check your email.",
        });
      } else {
        // create token
        const token = jwt.sign(
          {
            use: {
              _id: user._id,
              email: user.email,
            },
          },
          process.env.JWT_SECRET
        );

        res.status(200).json({
          _id: user._id,
          email: user.email,
          gender: user.gender,
          firstName: user.firstName,
          lastName: user.lastName,
          views: user.views,
          birthday: user.birthday,
          balance: user.balance,
          verify: user.verify,
          token,
        });
      }
    }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Login failed",
    });
  }
};

const register = async (req, res) => {
  try {

    const { email, password, firstName, lastName, birthday, gender, userId } =
      req.body;
    console.log("userId: ", userId);
    // check email available
    const checkEmail = await User.findOne({ email }).exec();
    console.log("checkEmail: ", checkEmail);
    if (!checkEmail) {
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        gender,
        birthday: new Date(birthday),
      });
      await user.save();

      if (userId) {
        console.log("getting referral user if provided");
        // find user invite
        const userInvited = await User.findById(userId)
          .select("-password")
          .exec();

        console.log(userInvited);
        // increase balance $5/invite success

        //add this when user activate account
        //  userInvited.balance = userInvited.balance + 5;
        //  userInvited.invite_balance = userInvited.invite_balance + 5;
        userInvited.shared = userInvited.shared + 1;
        await userInvited.save();

        // save model invite
        const newInvite = new Invite({
          user: user._id,
          invited: userId,
        });

        console.log(newInvite);

        await newInvite.save();
      }

      // send email verify account
      const token = jwt.sign(
        {
          use: {
            _id: user._id,
            email: user.email,
          },
        },

        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      console.log('verify url');

      const url = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`;
      console.log(url);

      console.log('printing token');
      console.log(token);

      const _html = `
      <div>
        <h4>Welcome to TubeMate.</h4>
        <p>To be able to discover more about us. Please visit the URL below to activate your account.</p>
        <p>Link Active: <a href="${url}" target="_blank">${url}</a></p>
        <p><strong>Note: This link will expire after 24 hours</strong></p>
        <p></p>
        <p>Regards,</p>
        <p>Support Team</p>
      </div>
    `;
      // const send = await sendMail(email, "Welcome to MyMarvin!", "", _html);
      console.log(_html);
      const msg = {
        to: email, // Change to your recipient
        from: process.env.FROM_EMAIL, // Change to your verified sender
        subject: "Welcome to TubeMate!",
        text: "Verify Account",
        html: _html,
      };
      sgMail
        .sendMail(msg)
        .then((response) => {
          console.log(response[0].statusCode);
          console.log(response[0].headers);
        })
        .catch((error) => {
          console.error(error);
        });

      res.status(200).json({
        _id: user._id,
        email: user.email,
        gender: user.gender,
        birthday: user.birthday,
        firstName: user.firstName,
        lastName: user.lastName,
        verify: user.verify,
        token,
      });
    } else {
      // duplicate email
      res.status(400).json({
        message: "This email already exists",
      });
    }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Register failed",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.use._id).exec();

    user.password = password;
    await user.save();

    res.status(200).json({
      message: "Updated new password",
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Register failed",
    });
  }
};

const sendLinkResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // send email verify account
    const user = await User.findOne({ email }).select("-password").exec();
    if (!user) {
      res.status(400).json({
        message: "User not found.",
      });
    } else {
      const token = jwt.sign(
        {
          use: {
            _id: user._id,
            email: user.email,
          },
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      const _html = `
            <div>
              <h4>Reset Password</h4>
              <p>Link Reset: <a href="${url}" target="_blank">${url}</a></p>
              <p><strong>Note: This link will expire after 24 hours</strong></p>
              <p></p>
              <p>Regards,</p>
              <p>Support Team</p>
            </div>
          `;
      // const send = await sendMail(email, "Welcome to MyMarvin!", "", _html);

      const msg = {
        to: user.email, // Change to your recipient
        from: process.env.FROM_EMAIL, // Change to your verified sender
        subject: "Reset Password",
        text: "Reset Password",
        html: _html,
      };
      sgMail
        .sendMail(msg)
        .then((response) => {
          console.log(response[0].statusCode);
          console.log(response[0].headers);
        })
        .catch((error) => {
          console.error(error);
        });

      res.status(200).json({
        message: "Reset password sent. Please check your mailbox.",
      });
    }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Register failed",
    });
  }
};

const sendLinkVerify = async (req, res) => {
  try {
    const { use } = req.user;
    // send email verify account

    const token = jwt.sign(
      {
        use: {
          _id: use._id,
          email: use.email,
        },
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    const url = `${process.env.BACKEND_URL}/api/verify?token=${token}`;
    const _html = `
          <div>
            <h4>Verify Email</h4>
            <p>Link Active: <a href="${url}" target="_blank">${url}</a></p>
            <p><strong>Note: This link will expire after 24 hours</strong></p>
            <p></p>
            <p>Regards,</p>
            <p>Support Team</p>
          </div>
        `;
    // const send = await sendMail(email, "Welcome to MyMarvin!", "", _html);

    const msg = {
      to: use.email, // Change to your recipient
      from: process.env.FROM_EMAIL, // Change to your verified sender
      subject: "Verify Email",
      text: "Verify Account",
      html: _html,
    };
    sgMail
      .sendMail(msg)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(200).json({
      message: "Verification email sent. Please check your mailbox.",
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Send mail verify failed",
    });
  }
};

const verifyAccount = async (req, res) => {
  try {

    console.log('verifying account');
    const { token } = req.query;
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.use._id).exec();

    console.log(user);
    // create customer stripe

    user.verify = true;
    await user.save();

    const url = `${process.env.FRONTEND_URL}/login`;
    const _html = `
          <div>
            <h4>Congratulations!</h4>
            <p>Your account has been activated. Log in now to discover more interesting things</p>
            <p><a href="${url}" target="_blank">Login Here</a></p>
            <p><strong>Note: This link will expire after 24 hours</strong></p>
            <p></p>
            <p>Regards,</p>
            <p>Support Team</p>
          </div>
        `;
    // const send = await sendMail(email, "Welcome to MyMarvin!", "", _html);

    const msg = {
      to: user.email, // Change to your recipient
      from: process.env.FROM_EMAIL, // Change to your verified sender
      subject: "Account activated",
      text: "Account activated",
      html: _html,
    };
    sgMail
      .sendMail(msg)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch((error) => {
        console.error(error);
      });

    // create new token
    const _token = jwt.sign(
      {
        use: {
          _id: user._id,
          email: user.email,
        },
      },
      process.env.JWT_SECRET
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/verify-account?token=${_token}`
    );
    // res.status(200).json({
    //   message: "Your account has been verified.",
    // });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Verify failed",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { use } = req.user;
    const user = await User.findById(use._id).select("-password").exec();

    console.log("user: ", user);

    res.status(200).json(user);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get user detail failed",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const avatar = req.file;
    console.log("avatar: ", avatar);
    const { use } = req.user;
    const { email, gender, firstName, lastName } = req.body;

    if (avatar) {
      // user.avatar = avatar;
      // const params = uploadParams;
      // uploadParams.Key = `ai_profile/${ainame}_${Date.now().toString()}.${req.file.originalname
      //     .split(".")
      //     .pop()}`;
      // // uploadParams.Key = "ai_profile/" + req.file.originalname;
      // uploadParams.Body = req.file.buffer;
      // console.log("params: ", params);
      // await s3Client.upload(params, async (err, data) => {
      //     if (err) {
      //         console.log("err: ", err);
      //         res.status(400).json({ error: "Error -> " + err });
      //     }
      //     // update user
      //     const user = await User.findById(use._id)
      //         .select("-password")
      //         .exec();
      //     user.firstName = firstName;
      //     user.lastName = lastName;
      //     // user.name = name;
      //     user.avatar = data;
      //     await user.save();
      //     res.status(200).json(user);
      // });
    } else {
      const user = await User.findById(use._id).select("-password").exec();
      user.firstName = firstName;
      user.lastName = lastName;
      user.gender = gender;
      user.balance = balance;
      user.views = views;
      await user.save();
      res.status(200).json(user);
    }

    // }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Update profile failed",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { use } = req.user;
    const { newPassword, password } = req.body;
    const user = await User.findById(use._id).exec();

    const checkPassword = await bcrypt.compareSync(password, user.password);
    console.log(">>checkPassword: ", checkPassword);

    if (checkPassword) {
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        message: "Updated password successfully",
      });
    } else {
      res.status(403).json({
        message: "Old password incorrect",
      });
    }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Update password failed",
    });
  }
};


// update scription for crypto.

const updateSubscriptionId = async (req, res) => {
  try {
    console.log("body =====>",req.body)
    const { use } = req.user;
    const { subscriptionId } = req.body;
    const user = await User.findById(use._id).exec();

    if (subscriptionId) {
      user.subscriptionId = subscriptionId;
      await user.save();

      res.status(200).json({
        message: "Updated subscription successfully",
      });
    }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Update Subscription failed",
    });
  }
};




// const resetPassword = async (req, res) => {
//   try {

//   } catch (error) {

//   }
// }

module.exports = {
  login,
  register,
  verifyAccount,
  sendLinkVerify,
  getProfile,
  updateProfile,
  updatePassword,
  sendLinkResetPassword,
  resetPassword,
  updateSubscriptionId
};

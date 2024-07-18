const pulseUsers = require('../models/carePulseUsersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "duibfsfuyws8722efyfvuy33762";
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const { createNewUser } = require('../services');
const images = require('../models/imageModel');
const validate = require('validator');
const pulseNotification = require('../models/notifications');
const { signJWT, verifyJWT } = require('../utils/jwt.utils');
const { createSession } = require('../utils/session');
const patientData = require('../models/patientDataModel');
const doctorData = require('../models/doctorDataModel');
const myDocument = require('../models/documentsModel');


const register = async (req, res, next) => {
    const {email, role} = req.body;
	if (!email) return res.json({error: "Email is required"});
	if (!role) return res.json({error: "Role is required"});
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
if (!emailRegex.test(email)) {
  return res.status(400).json({error: "Invalid Email!"});
}
  try {
      const oldUser = await pulseUsers.findOne({ email });
      if(oldUser){
        return res.status(400).json({error: "Email is already being used."});
      } 
      // const oldPhone = await pulseUsers.findOne({ phone });
      // if(oldPhone){
      //   return res.status(400).json({error: "Phone is already being used."});
      // } 

      // const encryptedPassword = await bcrypt.hash(password, 10);
      const otp = randomstring.generate({
        length: 4,
        charset: 'numeric'
      });
      const expirationTime = Date.now() + 5 * 60 * 1000;
      const message = `Hello,\n\nYour OTP for verification is: ${otp}`;
      
      const transporter = nodemailer.createTransport({
        service: process.env.SMPT_SERVICE,
        auth: {
          user: process.env.SMPT_MAIL,
          pass: process.env.SMPT_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      const mailOptions = {
        from: process.env.APP_EMAIL,
        to: email,
        subject: 'CarePulse OTP Code',
        text: message,
      };
      
      transporter.sendMail(mailOptions, async function(error, info){
        if (error) {
          console.log(error);
          if (error.responseCode === 553) {
            return res.json({ message: 'Invalid Email Address!' });
          } else {
         return res.json({ error: error, message: 'Failed to send OTP' });
          }
        } else {
          console.log('Email sent: ' + info.response);
          const transactionPin = 1111;
        const details =  {fullName: '', email, role, phone: '', dateofbirth: '', occupation: '', address: '', emergencyContact: '', emergencyContactPhone: '', otp, expirationTime, otpVerified: false, profilePic: '', };
        const createUser = await createNewUser(details);
          return res.json({ status: "ok", message: 'OTP sent successfully', userEmail: details.email });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Internal Server Error"});
    }
}

const login = async (req, res, next) => {
  const { email} = req.body;
  console.log(email);
  try {
    const user = await pulseUsers.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    if (user.otpVerified !== "true") {
      return res.status(400).json({ error: "Please verify OTP first" });
    }
    
    const otp = randomstring.generate({
      length: 4,
      charset: 'numeric'
    });

    const message = `Hello,\n\nYour Login code is: ${otp}`;
    
    const transporter = nodemailer.createTransport({
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: email,
      subject: 'CarePulse Login Code',
      text: message,
    };
    
    transporter.sendMail(mailOptions, async function(error, info){
      if (error) {
        console.log(error);
        if (error.responseCode === 553) {
          return res.json({ message: 'Invalid Email Address!' });
        } else {
       return res.json({ error: error, message: 'Failed to send code' });
        }
      } else {
        user.otp = otp;
        await user.save();
        console.log('Email sent: ' + info.response);
        return res.json({ status: "ok", message: 'Login code sent' });
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

const verify_login = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = await pulseUsers.findOne({ otp });
    console.log(user);
    if (!user) {
      return res.status(401).json({ status: "User does not exist!!" });
    }
    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    
    const email = user.email;
    const role = user.role;
    const userId = user._id;
    console.log(userId);

    const documentData = await myDocument.findOne({ userId });

    let medicalData;
    if (user.role === 'Patient') {
      medicalData = await patientData.findOne({ userId });
    } else {
      medicalData = await doctorData.findOne({ userId });
    }

    const onboarding = documentData !== null && medicalData !== null;

    const session = createSession(email);
    const accessToken = signJWT({ email: user.email, _id: user._id, sessionId: session.sessionId  }, "7h");
    const refreshToken = signJWT({ sessionId: session.sessionId }, "1y");
 
    res.cookie('accessToken', accessToken, {
      maxAge: 25200000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.cookie('refreshToken', refreshToken, {
      maxAge: 31536000000, // 1 year (in milliseconds)
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    const { payload: decodedUser, expired } = verifyJWT(accessToken);
if (decodedUser) {
  const userdata = {_id: decodedUser._id, email};
  return res.status(201).json({
    status: "ok",
    message: "Welcome User!",
    session,
    role,
    onboarding
  });
} else {
  console.error("Error decoding access token:", expired ? "Token expired" : "Token invalid");
  return res.status(500).json({ error: "Internal Server Error", });
}
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Internal Server Error" });
  }
}

const logout = async (req, res, next) => {
  try {
    res.cookie("accessToken", "", {
      expires: new Date(0),
      httpOnly: true,
      path: '/',
      domain: 'localhost:4000',
      secure: true,
      sameSite: 'none',
    });

    res.cookie("refreshToken", "", {
      expires: new Date(0),
      httpOnly: true,
      path: '/',
      domain: 'localhost:4000',
      secure: true,
      sameSite: 'none',
    });

    return res.status(200).json({
      status: 'success',
      message: 'User logged out',
      data: null,
    });
  } catch (error) {
    
    console.error('Logout error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    });
  }
};

const update_phone = async (req, res, next) => {
  const userId = req.user._id;
  const {newPhoneNumber} = req.body;
  try {
    // Find the user by ID
    const user = await pulseUsers.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User does not exist!!' });
    }

    // Update the phone number
    user.phone = newPhoneNumber;

    // Save the updated user
    const updatedUser = await user.save();

   return res.status(200).json({ message: 'User phone number updated', updatedUser });
 
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
}

const delete_account = async (req, res, next) => {
  try {
    const userId  = req.user._id;

    const user = await pulseUsers.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

     const deleteNotifications = await pulseNotification.deleteMany({ userId });
 
     const deleteTransactions = await userTransaction.deleteMany({ userId });
 
    const deleteUserAccount = await pulseUsers.findByIdAndDelete(userId);
    console.log("Deleted User Account:", deleteUserAccount ? deleteUserAccount.toJSON() : null);

    return res.status(200).json({ message: 'User deleted successfully', deleteUserAccount });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ error: 'Internal Server Error' });
  }
};



const user_data_dashboard = async (req, res, next) => {
  try {
    const id  = req.user._id;
    const user = await pulseUsers.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ status: "User does not exist!!" });
    }

    res.status(200).json({ status: "ok", pulseUserData: user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Internal Server Error" });
  }
};
const user_dashboard = async (req, res, next) => {
  const { token } = req.body;
  if(!token) {
    return res.status(400).json({error: "Token is needed to get all user data."});
  }
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const userid = user.id;
    pulseUsers.findOne({ _id: userid}).then((data) => {
      res.send({ status: "ok", myuserdata: data});
    }).catch((error) => {
      res.send({ status: "error", data: error});
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Internal Server Error" });
  }
}

const verify_otp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = await pulseUsers.findOne({ otp });
    if (!user) {
      return res.status(401).json({ status: "User does not exist!!" });
    }
    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    if (user.expirationTime < Date.now()) {
      return res.status(401).json({ message: "OTP has expired" });
    }
    const email = user.email;
    user.otpVerified = true;
    await user.save();
    const role = user.role;
    const session = createSession(email);
    const accessToken = signJWT({ email: user.email, _id: user._id, sessionId: session.sessionId  }, "7h");
    const refreshToken = signJWT({ sessionId: session.sessionId }, "1y");
 
    res.cookie('accessToken', accessToken, {
      maxAge: 25200000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.cookie('refreshToken', refreshToken, {
      maxAge: 31536000000, // 1 year (in milliseconds)
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    const { payload: decodedUser, expired } = verifyJWT(accessToken);
if (decodedUser) {
  const userdata = {_id: decodedUser._id, email};
  console.log("users", userdata);
  return res.status(201).json({
    status: "ok",
    message: "Welcome",
    session,
    role
  });
} else {
  console.error("Error decoding access token:", expired ? "Token expired" : "Token invalid");
  return res.status(500).json({ error: "Internal Server Error", });
}
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Internal Server Error" });
  }
}

const generate_otp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const myuser = await pulseUsers.findOne({ email });
    // Logic to generate OTP
    const otp = randomstring.generate({
      length: 4,
      charset: 'numeric'
    });
    const message = `Hello ${myuser.firstName} ${myuser.lastName},\n\nYour new OTP code is: ${otp}`;
    const transporter = nodemailer.createTransport({
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });
    
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: email,
      subject: 'CarePulse New OTP Code',
      text: message,
    };
    
    transporter.sendMail(mailOptions, async function(error, info){
      if (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to send OTP' });
      } else {
        console.log('Email sent: ' + info.response);
        myuser.otp = otp;
        await myuser.save();
        res.status(200).json({ message: 'New OTP sent successfully' });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Internal Server Error' });
  }
}

const userImage = async (req, res) => {
   const {userId} = req.params;
   const {myuserimage} = req.body;
   try {
     // Find the user by userId
     const user = await pulseUsers.findById(userId);
     console.log(user);
 
     if (!user) {
       return res.status(404).json({ error: 'User not found.' });
     }
 
   const image =  await images.create({
      image: myuserimage,
      userId,
    });

    user.userImage = myuserimage;
    await user.save();

    res.send({ status: "ok", message: "Image upload successful"});
   } catch (error) {
    console.log(error);
    res.send({ status: "error", data: error});
   }
}

module.exports = {
    register,
    login,
    verify_otp,
    generate_otp,
    user_dashboard,
    userImage,
    user_data_dashboard,
    logout,
    delete_account,
    update_phone,
    verify_login
} 
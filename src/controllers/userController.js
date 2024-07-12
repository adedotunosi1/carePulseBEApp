const carePulseUsers = require("../models/carePulseUsersModel");
const myImages = require('../models/imageModel');
const { cloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

const update_bio_data = async (req, res) => {
  const {fullName, phone, birthDate, gender, address, emergencyContactName, emergencyContactNumber} = req.body;
  const  userId  = req.user._id;
  try {
     // Find the user by userId
     const user = await carePulseUsers.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User does not exist!!" });
    }
    
     // Update the phone number
     user.phone = phone;
     user.fullName = fullName;
     user.dateofbirth = birthDate;
     user.gender = gender;
     user.address = address;
     user.emergencyContact = emergencyContactName;
     user.emergencyContactPhone = emergencyContactNumber;

     // Save the updated user
     const updatedUser = await user.save();
 
    return res.status(200).json({ message: 'User data updated', updatedUser });
  

  } catch (error) {
    console.log(error);
    res.send({ status: 'error', data: error });
  }
}
const userImage = async (req, res) => {
  console.log("testing", req.user);
  const  userId  = req.user._id;
  const { base64 } = req.body;

  try {
    // Find the user by userId
    const user = await carePulseUsers.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userImageGallery = await myImages.find({ userId });

    if (!base64) {
      return res.status(400).json({ error: 'Missing required parameter - file' });
    }

    // Convert base64 image data to a buffer
    const imageBuffer = Buffer.from(base64, 'base64');

    // Create the temp directory if it doesn't exist
    const tempDirPath = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDirPath)) {
      fs.mkdirSync(tempDirPath);
    }

    // Create a temporary file path for the image
    const tempImagePath = path.join(tempDirPath, `${userId}-temp-image.jpg`);

    // Write the buffer to the temporary file
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Upload image to cloudinary
    cloudinary.uploader.upload(tempImagePath, async (error, result) => {
      // Delete the temporary file
      fs.unlinkSync(tempImagePath);

      if (error) {
        console.log(error);
        return res.send({ status: 'error', data: error });
      }

      try {
        const image = await myImages.create({
          userImage: result.secure_url,
          userId,
          cloudinary_id: result.public_id,
        });

        user.userImage = result.secure_url;
        await user.save();

        res.send({ status: 'ok', message: 'Image upload successful', data: image, images: userImageGallery});
      } catch (error) {
        console.log(error);
        res.send({ status: 'error', data: error });
      } 
    });
  } catch (error) {
    console.log(error);
    res.send({ status: 'error', data: error });
  }
};

const userData = async (req, res) => {
  const userId = req.user._id;
  try {
    const userData = await carePulseUsers.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: "User does not exist!!" });
    }
    res.send({ message: 'Your Data', userData});
  } catch (error) {
    console.log(error);
  }
}


 module.exports = {
    userImage,
    userData,
    update_bio_data
 }

 
const carePulseUsers = require("../models/carePulseUsersModel");
const myImages = require('../models/imageModel');
const myDocument = require('../models/documentsModel');
const { cloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');
const documents = require("../models/documentsModel");
const { submitNewDoc } = require("../services");
const patientData = require('../models/patientDataModel');
const doctorData = require('../models/doctorDataModel');
const appointmentData = require('../models/appointmentModel');

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

const update_patient_data = async (req,res) => {
  const {bloodGroup, genoType, allergies, medications, medicalHistory} = req.body;
  const userId =  req.user._id;

  try {
    // Find the user by userId
    const user = await carePulseUsers.findOne({ _id: userId });
    console.log(user)
    if (!user) {
      return res.status(404).json({ error: "User does not exist!!" });
    }
    if(user.role !== 'Patient'){
      return res.status(404).json({ error: "Only Patient Allowed!" });
    }
   const fullName = user.fullName;

   const submitData = await patientData.create({
    userId, fullName, bloodGroup, genoType, allergies, medications, medicalHistory
   })
   
   return res.json({ status: "ok", message: 'Medical Data Saved!' });

  } catch (error) {
    console.log(error);
  return res.status(400).json({ error: "Internal Server Error"});
  }
}

const update_doctor_data = async (req,res) => {
  const {medicalLicenseNumber, specialization, yearsOfExperience, consultationHours, clinicName, clinicAddress} = req.body;
  const userId =  req.user._id;

  try {
    // Find the user by userId
    const user = await carePulseUsers.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User does not exist!!" });
    }
   const fullName = user.fullName;

   const submitData = await doctorData.create({
    userId, fullName, medicalLicenseNumber, specialization, yearsOfExperience, consultationHours, clinicName, clinicAddress
   })
   
   return res.json({ status: "ok", message: 'Medical Data Saved!' });

  } catch (error) {
    console.log(error);
  return res.status(400).json({ error: "Internal Server Error"});
  }
}

const all_patients = async (req, res) => {
  try {
    
    const patients = await carePulseUsers.find({ role: "Patient" });

    return res.json({ status: "ok", message: 'All patients fetched', patients });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Internal server error" });
  }
};

const all_doctors = async (req, res) => {
  try {

    const physicians = await carePulseUsers.find({ role: "Physician" });
    
    return res.json({ status: "ok", message: 'All patients fetched', physicians });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Internal server error" });
  }
};


const myuser_data = async (req, res) => {
  const {userId} = req.body
  try {
    const userData = await carePulseUsers.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ error: "User does not exist!" });
    }

    let medicalData;
    if (userData.role === 'Patient') {
      medicalData = await patientData.findOne({ userId });
    } else {
      medicalData = await doctorData.findOne({ userId });
    }

    res.send({ 
      message: 'Patient Data', 
      bioData: userData, 
      medicals: medicalData,
    });
  } catch (error) {
    console.log(error);
  return res.status(400).json({ error: "Internal Server Error"});
  }
}

const identity_document = async (req, res) => {
 const  userId  = req.user._id;
 const  file  = req.file;
 try {
    // Find the user by userId
    const user = await carePulseUsers.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User does not exist!!" });
    }
    if (!file) {
      return res.status(400).json({ error: 'Missing required parameter - file' });
    }

    const tempImagePath = file.path;

    // Upload image to cloudinary
    cloudinary.uploader.upload(tempImagePath, async (error, result) => {
      // Delete the temporary file
      fs.unlinkSync(tempImagePath);

      if (error) {
        console.log(error);
        return res.send({ status: 'error', data: error });
      }
       const role = user.role;
      try {
        const submitDoc = await myDocument.create({
          documentType: "NationalIdCard", documentImage: result.secure_url, status: "pending", role, userId
        });

        return res.json({ status: "ok", message: 'Document uploaded successfully', submitDoc });
      } catch (error) {
        console.log(error);
        res.send({ status: 'error', data: error });
      } 
    });

 } catch (error) {
  console.log(error);
  return res.status(400).json({ error: "Internal Server Error"});
 }

}

const userImage = async (req, res) => {
  const userId = req.user._id;
  const  file  = req.file;

  try {
    // Find the user by userId
    const user = await carePulseUsers.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userImageGallery = await myImages.find({ userId });

    if (!file) {
      return res.status(400).json({ error: 'Missing required parameter - file' });
    }

    const tempImagePath = file.path;

    // Upload image to cloudinary
    cloudinary.uploader.upload(tempImagePath, async (error, result) => {
      // Delete the temporary file
      fs.unlinkSync(tempImagePath);

      if (error) {
        console.log(error);
        return res.send({ status: 'error', data: error });
      }

      try {
        const newImage = await myImages.create({
          userImage: result.secure_url,
          userId,
          cloudinary_id: result.public_id,
        });

        user.profilePic = result.secure_url;
        await user.save();

        res.send({ status: 'ok', message: 'Image upload successful', data: newImage, images: userImageGallery });
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
      return res.status(404).json({ error: "User does not exist!" });
    }

    let documentData; 
    if (userData.role === 'Patient') {
      documentData = await myDocument.findOne({ userId });
    } else {
      documentData = 'not needed'
    }

    let medicalData;
    if (userData.role === 'Patient') {
      medicalData = await patientData.findOne({ userId });
    } else {
      medicalData = await doctorData.findOne({ userId });
    }

    const onboarding = documentData !== null && medicalData !== null;

    res.send({ 
      message: 'Your Data', 
      bioData: userData, 
      documents: documentData, 
      medicals: medicalData,
      onboarding: onboarding ? true : false
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching user data." });
  }
}




 module.exports = {
    userImage,
    userData,
    update_bio_data,
    identity_document,
    update_patient_data,
    update_doctor_data,
    all_patients,
    all_doctors,
    myuser_data
 }

 
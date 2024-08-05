const carePulseUsers = require("../models/carePulseUsersModel");
const myImages = require('../models/imageModel');
const myDocument = require('../models/documentsModel');
const { cloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');
const documents = require("../models/documentsModel");
const { submitNewDoc } = require("../services");
const patientData = require('../models/patientDataModel');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const doctorData = require('../models/doctorDataModel');
const appointmentData = require('../models/appointmentModel');
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = "590037273390-e9d87r69ho3l9cmtntf01seph4ji77pi.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"
const GOOGLE_REDIRECT_URI = 'http://localhost:4000/oauth2callback';

const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Set credentials
oAuth2Client.setCredentials({
  access_token: "ya29.a0AcM612zhQtJr3B_5K6FUZAGhuCFCLSRSouqEe84idNztektmz3H7_5O1BNYNvk2irMi-GmICWPyQMVPXa99BxrksJvApqFZaYD7VD6MErwca6juQyL-0koET0EW_Ks4h1UqwGVl-78bvngQOSLq_hRd7w3NxbpNDn-s0aCgYKAbgSAQ8SFQHGX2Mimt9oVe-eylV3MqazJkdgYw0171",
  refresh_token: "1//03ZoD6K5ORvCNCgYIARAAGAMSNwF-L9IrgCQTts8C2Znljf9UwjHY_QmG8kdeTFYGqjMe80sCUnbrs8zqf1E-GjUywNxIGAVFdRc",
});
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

const create_appointment = async (req, res) => {
    const {reason, schedule, comment} = req.body;
    const  userId  = req.user._id;
     try {
      const user = await carePulseUsers.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ error: "User does not exist!!" });
      }
      console.log(user)
      const fullName = user.fullName
  
      const submitAppointment = await appointmentData.create({
        userId, reason, schedule, comment, fullName, cancelReason: ""
       })
       
       return res.json({ status: "ok", message: 'Appointment Booked!', submitAppointment });
  
     } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Internal Server Error"});
     }
  }

  const accept_appointment = async (req, res) => {
    const  userId  = req.user._id;
    const {appointmentId} = req.body;
    try {

      const booking = await appointmentData.findOne({appointmentId});
 
      if (!booking) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      const doctor = await carePulseUsers.findOne({ _id: userId });
      if (!doctor) {
        return res.status(404).json({ error: "Doctor does not exist!!" });
      }
      console.log(doctor.fullName);
      const patientId = booking.userId;
      const patient = await carePulseUsers.findOne({ _id: patientId });
      if (!patient) {
        return res.status(404).json({ error: "Patient does not exist!!" });
      }
    
    const start = new Date(booking.schedule);
    const end = new Date(start.getTime() + 60 * 60 * 1000); 
  
    const startTime = new Date(start).toISOString(); 
    const endTime = new Date(end).toISOString(); 
      const event = {
        summary: `Appointment with Dr. ${doctor.fullName}`,
        location: 'Online',
        description: 'Appointment scheduled via CarePulse.',
        start: {
          dateTime: startTime,
          timeZone: 'Africa/Lagos',
        },
        end: {
          dateTime: endTime,
          timeZone: 'Africa/Lagos',
        },
        attendees: [
          { email: patient.email },
          { email: doctor.email },
        ],
        conferenceData: {
          createRequest: {
            requestId: `sample123`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };
    
      
        const { data } = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          conferenceDataVersion: 1,
        });
       console.log(data);
        const meetingLink = data.hangoutLink;
       console.log(meetingLink);
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
          to: `${patient.email}, ${doctor.email}`,
          subject: 'Your CarePulse Appointment has been Scheduled',
          html: `<p>Your appointment has been scheduled. Date and Time: ${start}. You can join the meeting using the following link: <a href="${meetingLink}">${meetingLink}</a></p>`,
        };
    
        await transporter.sendMail(mailOptions);
    
        res.json({ success: true, message: 'Appointment accepted and scheduled successfully', meetingLink });
  
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Internal Server Error"});
    }
  }
  
  const cancel_appointment = async (req, res) => {
    const  userId  = req.user._id;
    const {appointmentId, cancel_reason} = req.body;
     try {
      const user = await carePulseUsers.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ error: "User does not exist!!" });
      }
      
      const booking = await appointmentData.findOne({appointmentId});
      console.log(booking);
  
      if (!booking) {
        return res.status(404).json({ error: "Booking does not exist!!" });
      }
  
      booking.status = "cancelled";
      booking.cancelReason = cancel_reason;
      await booking.save();
     
      return res.json({ status: "ok", message: 'Appointment Cancelled', booking });
      
     } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Internal Server Error"});
     }
  }
  
const all_appointments = async (req, res) => {
    try {
     const appointments = await appointmentData.find({ })
  
   return res.json({ status: "ok", message: 'All appointments fetched', appointments})
    } catch (error) {
      console.log(error)
      return res.status(400).json({ error: "Internal server error"});
  
    }
  }

  
module.exports = {
    create_appointment,
    cancel_appointment,
    all_appointments,
    accept_appointment
 }
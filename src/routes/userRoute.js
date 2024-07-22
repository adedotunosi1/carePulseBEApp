const express = require('express');
const { upload } = require('../utils/multerConfig');
const Controller = require('../controllers');
const { requireUser } = require('../middlewares/auth.middleware');
const { uploadnew } = require('../utils/newmulterConfig');

const userRoute = express.Router();

userRoute.post('/imageUpload', requireUser, uploadnew.single('profileImage'), Controller.UserController.userImage);
userRoute.post('/documentUpload', requireUser, uploadnew.single('documentImage'), Controller.UserController.identity_document);
userRoute.get('/data', requireUser, Controller.UserController.userData);
userRoute.patch('/update-bio', requireUser, Controller.UserController.update_bio_data)
userRoute.post('/patientMedicalData', requireUser, Controller.UserController.update_patient_data);
userRoute.post('/doctorMedicalData', requireUser, Controller.UserController.update_doctor_data);
userRoute.post('/book-appointment', requireUser, Controller.UserController.create_appointment);
userRoute.post('/cancel-appointment', requireUser, Controller.UserController.cancel_appointment);
userRoute.get('/patients', requireUser, Controller.UserController.all_patients);
userRoute.get('/physicians', requireUser, Controller.UserController.all_doctors);
userRoute.get('/appointments', requireUser, Controller.UserController.all_appointments);
module.exports = {
    userRoute,
}
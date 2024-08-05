const express = require('express');
const { upload } = require('../utils/multerConfig');
const Controller = require('../controllers');
const { requireUser } = require('../middlewares/auth.middleware');
const { uploadnew } = require('../utils/newmulterConfig');

const apptRoute = express.Router();

apptRoute.post('/book-appointment', requireUser, Controller.AppointmentController.create_appointment);
apptRoute.post('/cancel-appointment', requireUser, Controller.AppointmentController.cancel_appointment);
apptRoute.post('/accept', requireUser, Controller.AppointmentController.accept_appointment);
apptRoute.get('/appointments', requireUser, Controller.AppointmentController.all_appointments)
module.exports = {
    apptRoute,
}
const express = require('express');
const controller = require('../controllers');
const { userLogout, requireUser } = require('../middlewares/auth.middleware');

const authRoute = express.Router();

authRoute.post('/register', controller.AuthController.register);
authRoute.post('/login', controller.AuthController.login);
authRoute.delete('/logout', userLogout, controller.AuthController.logout);
authRoute.delete('/delete-acc', requireUser, controller.AuthController.delete_account);
authRoute.post('/otp', controller.AuthController.verify_otp);
authRoute.post('/generate_otp', requireUser, controller.AuthController.generate_otp);
authRoute.post('/dashboard', controller.AuthController.user_dashboard);
authRoute.patch('/update-number', requireUser, controller.AuthController.update_phone);
module.exports = {
    authRoute,
}
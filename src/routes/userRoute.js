const express = require('express');
const { upload } = require('../utils/multerConfig');
const Controller = require('../controllers');
const { requireUser } = require('../middlewares/auth.middleware');

const userRoute = express.Router();

userRoute.post('/imageUpload', requireUser, upload.single('profileImage'), Controller.UserController.userImage);
userRoute.post('/documentUpload', requireUser, upload.single('IdentityImage'), Controller.UserController.identity_document);
userRoute.get('/data', requireUser, Controller.UserController.userData);
userRoute.patch('/update-bio', requireUser, Controller.UserController.update_bio_data)
module.exports = {
    userRoute,
}
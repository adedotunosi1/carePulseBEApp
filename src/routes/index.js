const express = require('express');
const pulseRouter = express.Router();
const userModule = require('./userRoute');
const authModule = require('./authRoute');
// const transModule = require('./transRoute');
// // const walletModule = require('./walletRoute');
// // const bankaccountModule = require('./bankRoute'); 
// const cardModule = require('./cardRoute');

pulseRouter.use('/user', userModule.userRoute);
pulseRouter.use('/auth', authModule.authRoute);
// bankRouter.use('/trans', transModule.transRoute);
// bankRouter.use('/wallet', walletModule.walletRoute);
// bankRouter.use('/bank', bankaccountModule.bankRoute);
// bankRouter.use('/card', cardModule.cardRoute);

module.exports = pulseRouter;
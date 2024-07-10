const express = require('express');
const controllers = require('../controllers');
const { requireUser } = require('../middlewares/auth.middleware');

const cardRoute = express.Router();

cardRoute.post('/create', requireUser, controllers.DollarCardController.generateCard);
cardRoute.get('/usercards', requireUser, controllers.DollarCardController.getUserCards);
cardRoute.post('/delete', requireUser, controllers.DollarCardController.deleteUserCard);

module.exports = {
    cardRoute
}
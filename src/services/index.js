const AccountModule = require('./authServices');


//Auth Paths
exports.createNewUser = async (details) => AccountModule.register(details);
exports.submitNewDoc = async (details) => AccountModule.identity(details);
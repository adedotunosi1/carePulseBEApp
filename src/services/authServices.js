const bankUsers = require("../models/carePulseUsersModel");
const userDocument = require("../models/documentsModel");

exports.register = async (details) => {
    try {
        const newUser = await bankUsers.create({...details});
        if(!newUser)
        return {error: "Account Registration Failed"};
        return newUser;
    } catch (error) {
        console.log(error)
        return {error}
    }
}

exports.identity = async (details) => {
    try {
        const newDocument = await userDocument.create({...details});
        if(!newDocument)
            return {error: "Identity Verification Failed"};
            return newDocument;
    } catch (error) {
        console.log(error)
        return {error}
    }
}

const userModel = require('../models/user.model')
const { userType, userStatus } = require('../constants/constants')
const bcrypt = require('bcrypt')
const config = require('../configs/auth.config')
const jwt = require('jsonwebtoken')

exports.signUp = async (req, res) => {

    if (req.body.userStatus == undefined) {
        if (req.body.userType == undefined || req.body.userType == constants.userType.customer) {
            userStatus = constants.userStatus.approved
        } else {
            userStatus = constants.userStatus.pending
        }
    }
    if (req.body.userStatus == constants.userStatus.suspended) {
        return res.status(200).send({
            message: " You can't signUp again, your account status is${constants.userStatus.suspended}"
        })
    }
    const userObj = {
        name: req.body.name,
        userId: req.body.userId,
        email: req.body.email,
        userType: req.body.userType,
        password: bcrypt.hashSync(req.body.password, 12),
        userStatus: userStatus
    }
    try {

        const createdUser = await userModel.create(userObj)
        const postResponse = {
            name: userCreated.name,
            userId: userCreated.userId,
            email: userCreated.email,
            userTypes: userCreated.userType,
            userStatus: userCreated.userStatus,
            createdAt: userCreated.createdAt,
            updatedAt: userCreated.updatedAt
        }
        res.status(201).send(postResponse)
    } catch (error) {
        message: "Failed to create user!"
        res.status(500).send({
            message: " Some Internal Error occured while inserting the records!"
        })
    }

}

exports.signIn = async (req, res) => {
    const findUser = await userModel.findOne({ userId: req.body.userId })
    if (!req.body.userId) {
        res.status(400).send({ message: " User not found!" })
        return
    }
    if (findUser.userStatus != approved || findUser.userStatus == suspended) {
        res.status(200).send({
            message: "Unauthorised user, account status is ${findUser.userStatus}"
        })
        return
    }
}

exports.validatePassword = async (req, res) => {
    var passwordIsValid = bcrypt.compareSync(req.body.password, userModel.password);

    if (!passwordIsValid) {
        return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
        });
    }

    var token = jwt.sign({ userId: userModel.userId }, config.secret_key)
    res.status(200).send({
        name: userModel.name,
        userId: userModel.userId,
        email: userModel.email,
        userType: userModel.userType,
        userStatus: userModel.userStatus
    })
}

exports.getAllUsers = async (req, res) => {
    const findUsers = {}
    if (req.query.name != undefined) {
        findUsers.name = req.query.name
    }
    if (req.query.userId != undefined) {
        findUsers.userId = req.query.userId
    }
    if (req.query.email != undefined) {
        findUsers.email = req.query.email
    }
    if (req.query.userType != undefined) {
        findUsers.userType = req.query.userType
    }
    const requestedUsers = await userModel.find(findUsers)
    res.status(200).send(requestedUsers)
}

exports.updateUser = async (req, res) => {
    const requestedUser = await userModel.findOneAndUpdate({ userId: req.params.userId },
        {
            name: req.body.name,
            // password: bcrypt.hashSync(req.body.password, 8),
            userStatus: req.body.userStatus,
            userType: req.body.userType
        })
    if (requestedUser.userId != undefined) {
        res.status(200).send({
            message: "User details updated successfully"
        })
    } else {
        res.status(500).send({
            message: "Internal error occurred in updating the user details!"
        })
    }
}

exports.updateUserPassword = async (req, res) => {
    const requestedUser = await userModel.findOneAndUpdate({ userId: req.params.userId },
        {
            //name: req.body.name,
            password: bcrypt.hashSync(req.body.password, 8),
            //userStatus: req.body.userStatus,
            //userType: req.body.userType
        })
    if (requestedUser.userId != undefined) {
        res.status(200).send({
            message: "User details updated successfully"
        })
    } else {
        res.status(500).send({
            message: "Internal error occurred in updating the user details!"
        })
    }
}
const express = require('express')
const router = express.Router()

const userControllers = require('../app/controllers/userControllers')
const chatControllers = require('../app/controllers/chatControllers')
const videoControllers = require('../app/controllers/videoControllers')

router.get('/users/:id/:recipient', userControllers.getUserChat)
router.post('/users/register', userControllers.register)

/**
    @chatControllers - test routes for chat CRUD and fetch
    ** sendChat and groupChat are stand-alone functions taking _id as params to forward dB r/w
 */
router.post('/users/create/group',chatControllers.createGroup)
router.get('/users/chats/group/:groupId',chatControllers.getGroupChat)
router.post('/users/sendMsg', chatControllers.sendChat)
router.post('/users/group/sendMsg/:groupId', chatControllers.groupChat)

/**
    @videoControllers - test routes for video call DM and group
 */
router.post('/users/call',videoControllers.callForward)


module.exports = router
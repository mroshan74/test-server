const videoControllers = {}
const shortid = require('shortid')
const User = require('../models/user')
const Online = require('../models/online')

videoControllers.callForward = (req,res) => {
    // const id = req.query.id
    // const recipient = req.query.rec
    const { encryptId, id, recipient } = req.body
    const io = req.app.io
    console.log(id,recipient)
    Online.findOne({_id: recipient})
        .then(user => {
            console.log(user)
            if(!user.inCall.isTrue && user){
                //! receiver
                const { socketId } = user
                User.findOne({_id: id})
                    .then(user => {
                        io.to(socketId).emit('callListener',{
                            callerId: user.id,
                            callerName: user.username,
                            callStatus: false,
                            channelId: encryptId
                        })
                        res.json({
                            ok: true,
                            callInitiated: true
                        })
                    })
                    .catch(err => {
                        res.status(502).json({
                            ok: false,
                            msg: 'User Unavailable'
                        })
                    })
                //! sender
            }else{
                res.status(409).json({
                    ok: false,
                    msg: 'User busy'
                })
            }
        })
}

module.exports = videoControllers
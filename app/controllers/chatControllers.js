const User = require('../models/user')
const { Chat } = require('../models/chat')
const { GroupChat } = require('../models/groupChat')
const chatControllers = {}

chatControllers.sendChat = async (req,res) => {
    const { body } = req
    try{
        const chat = new Chat(body)
        const getChat =  await chat.save()
        // console.log(getChat)
        
        if(getChat){
            //! SENDER
            User.findOne({
                _id: body.sender,
                'inbox.info': body.recipient
            })
            .then(chat => {
                console.log(chat)
                if(!chat){
                    console.log('no chat')
                    User.findByIdAndUpdate({_id: body.sender},{
                        $push: {
                            inbox: { 
                                info: body.recipient,
                                chats: getChat._id
                            }
                        }
                    },{new:true})
                    .then(entry => {
                        res.json(entry)
                    })
                    .catch(err => {
                        res.status(502).json({
                            ok: false,
                            err
                        })
                    })
                }else{
                    User.findOneAndUpdate({ 
                        _id: body.sender,
                        'inbox.info': body.recipient,
                    },{
                        $push: {
                            'inbox.$.chats': getChat._id
                        }
                    },{
                        new: true
                    })
                    .then(chat => res.json(chat))
                    .catch(err => {
                        res.status(502).json({
                            ok: false,
                            err
                        })
                    })
                }
            })

            //! RECEIVER
            User.findOne({
                _id: body.recipient,
                'inbox.info': body.sender
            })
            .then(chat => {
                console.log(chat)
                if(!chat){
                    console.log('no chat')
                    User.findByIdAndUpdate({_id: body.recipient},{
                        $push: {
                            inbox: { 
                                info: body.sender,
                                chats: getChat._id
                            }
                        }
                    },{new:true})
                    .then()
                    .catch(err=> {
                        res.status(502).json({
                            ok: false,
                            err
                        })
                    })
                }else{
                    User.findOneAndUpdate({ 
                        _id: body.recipient,
                        'inbox.info': body.sender,
                    },{
                        $push: {
                            'inbox.$.chats': getChat._id
                        }
                    },{
                        new: true
                    })
                    .then()
                    .catch(err=> {
                        res.status(502).json({
                            ok: false,
                            err
                        })
                    })
                }
            })
        }
    }catch(err){
        res.status(500).json({
            ok: false,
            err
        })
    }
}

chatControllers.createGroup = (req,res) => {
    const { body } = req
    const group = new GroupChat(body)
    group.save()
        .then(group => {
            res.json({
                ok: true,
                msg: 'Group created successfully',
                group
            })
        })
        .catch(err => {
            res.status(502).json({
                ok: false,
                msg: 'Failed to create group',
                err
            })
        })
}

chatControllers.groupChat = (req,res) => {
    const _id = req.params.groupId
    const { body } = req
    GroupChat.findOneAndUpdate({_id},{
        $push: {
            inbox: {
                ...body
            }
        }
    },{
        new: true
    })
        .then(group => {
            if(group){
                res.json({ok:true,group})
            }
            else{
                res.json({ok:false})

            }
        })
        .catch(err =>{
            res.json({ok:false,err})

        })
}

chatControllers.getGroupChat = (req,res) => {
    const _id = req.params.groupId
    GroupChat.findOne({_id})
        .then(group => {
            res.json({
                ok: true,
                _id: group.groupId,
                inbox: group.inbox,
                groupName: group.groupName
            })
        })
        .catch(err => {
            res.status(502).json({
                ok: false,
                msg: 'Date fetch Failed',
                err
            })
        })
}

module.exports = chatControllers
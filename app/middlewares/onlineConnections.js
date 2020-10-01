const Online = require('../models/online')

const onlineConnections = (io) => {
    //listening to online connections
    io.on('connection', online => { // establishing/listening a connection from client side
        //console.log('connected client to the online', online.id)

        online.on('userId',pass=> {
            //console.log('pass customId', pass)
            const store_session = {
                socketId: online.id,
            }
            if(pass.userId){
            // 🔥 mapping the connection of online to user id to the database   
            Online.findByIdAndUpdate({_id: pass.userId},store_session,{new:true, upsert:true})
                .then(map => {
                    console.log(map,'stored user session')
                }).catch(err => console.log(err))
            }
        })

        online.on('acceptCall', data => {
            const { caller, receiver, channelId } = data
            console.log(data, 'acceptCall Data')
            //! caller
            Online.findOneAndUpdate({_id: caller},{
                $set: {
                    'inCall.isTrue': true,
                    'inCall.connectedTo': receiver,
                    'inCall.connectId': channelId,
                }
            },{
                new: true,
                upsert: true
            })
                .then(user => {
                    console.log('[CALLER CALL]',user)
                })
                .catch(err => {
                    console.log(err)
                })
            
            //! receiver
            Online.findOneAndUpdate({_id: receiver},{
                $set: {
                    'inCall.isTrue': true,
                    'inCall.connectedTo': caller,
                    'inCall.connectId': channelId,
                }
            },{
                new: true,
                upsert: true
            })
                .then(user => {
                    console.log('[RECEIVER CALL]',user)
                })
                .catch(err => {
                    console.log(err)
                })
        })

        online.on('rejectCall', data => {
            const { caller, receiver } = data
            console.log(data, 'rejectCall Data')
            //! caller
            Online.findOne({_id: caller})
                .then(getUserSocket => {
                    const { socketId } = getUserSocket
                    io.to(socketId).emit('onCallReject',{
                        ok: false,
                        msg: 'User Busy'
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        })

        online.on('channelRtc-closed',({id,callType}) => {
            console.log('[channel-close]--left --> ',id, callType)
            if(callType == 'direct'){
                Online.findOne({_id: id})
                .then(user => {
                    if(user.inCall.isTrue){
                        //! receive disconnect
                        Online.findOneAndUpdate({_id: user.inCall.connectedTo},{
                            $set: { 
                                'inCall.isTrue': false,
                                'inCall.connectedTo': null,
                                'inCall.connectId': null
                            }
                        })
                            .then(getUserSocket => {
                                const { socketId } = getUserSocket
                                io.to(socketId).emit('onChannelRtcClose', {
                                    ok: true,
                                    msg: 'Client Disconnected'
                                })
                            })
                            .catch(err => {
                                console.log(err)
                            })

                        //! initiated disconnect
                        Online.findOneAndUpdate({_id:id},{
                            $set: { 
                                'inCall.isTrue': false,
                                'inCall.connectedTo': null,
                                'inCall.connectId': null
                            }
                        })
                            .then()
                            .catch(err => {
                                console.log(err)
                            })
                    }
                })
            }
        })

        online.on('disconnect',(reason)=>{
            console.log(reason,online.id)
            Online.findOneAndRemove({socketId: online.id})
                .then(afterClean => {
                    //console.log(afterClean,'removed user session')
                    if(afterClean){
                        const { inCall } = afterClean
                        if(inCall.isTrue){
                            Online.findOneAndUpdate({_id: inCall.connectedTo},{
                                $set: { 
                                    'inCall.isTrue': false,
                                    'inCall.connectedTo': null,
                                    'inCall.connectId': null
                                }
                            })
                                .then(getUserSocket => {
                                    const { socketId } = getUserSocket
                                    io.to(socketId).emit('call-disconnected',{
                                        message: 'user disconnected / error in call channel'
                                    })
                                }).catch(err => console.log(err))
                        }
                    }
                })
                .catch(err => console.log(err))
        })
    })
}

module.exports = onlineConnections
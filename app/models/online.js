const mongoose = require('mongoose')
const Schema = mongoose.Schema
const onlineSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    socketId: {
        type: String,
        required: true
    },
    inCall: {
        connectId: {
            type: String,
            default: null
        },
        isTrue: {
            type: Boolean,
            default: false,
        },
        connectedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{timestamps: true})

const Online = mongoose.model('Online',onlineSchema)
module.exports = Online
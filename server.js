const express = require('express')
const app = express()
const port = process.env.PORT || 7080
const morgan = require('morgan')
const cors = require('cors')

const server = require('http').createServer(app)
const io = require('socket.io')(server) 

app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

app.io = io

const routes = require('./config/routes')
app.use('/api',routes)

const onlineConnections = require('./app/middlewares/onlineConnections')
onlineConnections(io)

const db = require('./config/database')
db()

server.listen(port, () => {
    console.log('OPENED PORT at --> ',port)
})
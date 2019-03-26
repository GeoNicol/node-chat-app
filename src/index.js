const path = require('path')
const http = require('http')
const express = require('express')
const socketio= require('socket.io')
const Filter = require('bad-words')
const hbs = require('hbs')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

//define paths for express config
const publicDirectory = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

//setup handlebars engine and views locations
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

//setup static directory to serve
app.use(express.static(publicDirectory)) 

io.on('connection', (socket)=>{

    socket.emit('message','Welcome!')
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.emit('message',message)
        callback()
    })

    socket.on('sendLocation', (coords, callback)=>{
        io.emit('locationMessage',`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect', ()=>{
        io.emit('message', 'A user has left')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
const express = require('express') 
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocation} = require('./utils/messages')
const {addUsers, removeUser, getUser, getUsersInRoom} = require('./utils/users')
// Server (emit) - Client receive (.on)
//Client (emit) - server receive (.on)
 

//create express app
const app = express()
//pass the app in http server
const server = http.createServer(app)
//pass the server in socket io
const io = socketio(server)


const port = process.env.PORT || 3000

//Reroute the app to index.html in public directory
const publicDirectoryPath = path.join(__dirname, '../public')

//use the public directory
app.use(express.static(publicDirectoryPath))



//io connection
io.on('connection', (socket) => {
console.log('New connection')



//Joining Room
socket.on('join', (options, callback )=> {
   //user 
  const {error, user} = addUsers({id: socket.id, ...options})

   if(error) { 
     return callback(error)
   }

socket.join(user.room)
//Emit intro message
socket.emit('message', generateMessage('Admin', 'Welcome!'))
socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))

//list of online
io.to(user.room).emit('roomData',{
   room: user.room,
   users: getUsersInRoom(user.room)
})

callback()

})

//listening the chat message to the serverside
socket.on('sendMessage', (message, callback) => {
const user = getUser(socket.id)
const filter = new Filter()

//Profanity
if(filter.isProfane(message)) {
   const user = getUser(socket.id)
   return callback  ('Profanity is not allowed')
}

//pushing the message to all
io.to(user.room).emit('message', generateMessage(user.username, message))
callback()
})




//Send location
socket.on('sendLocation',(coords, callback)=>{
   const user = getUser(socket.id)
      //user.room  -  > specific room of user. 
io.to(user.room).emit('LocationMessage', generateLocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
   callback('Delivered')
})



//disconnect user
socket.on('disconnect', () => {
  const user = removeUser(socket.id)

   if(user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
      io.to(user.room).emit('roomData', {
         room: user.room,
         users: getUsersInRoom(user.room)
      })
   }

})
})


server.listen(port,() => {
console.log(`Server is up on port ${port}`)

})

//     socket.emit('countUpdated', count)

//     socket.on('increment', ()=> {
//     count++
// //emit specific connection
//     //socket.emit('countUpdated', count)
// //emit every connection
//     io.emit('countUpdated', count)
//  })   


//socket.emit             > Sends an event to specific client
//io.emit                 > send an event to every connected client
//socket.brodcast.emit    > send an every conected client except for except itself

//io.to.emit              > emit an event to everybody in a specific connection
//socket.brodcast.to.emit > emit an event to everybody in specific connection except connection
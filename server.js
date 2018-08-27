var express = require('express')
var path = require('path')
const app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

var users = 0
const DIST_DIR = path.join(__dirname, 'dist')

app.use(express.static(DIST_DIR))

app.get('/', function(req, res) {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

io.on('connection', socket => {
  // Handle user counts
  users++
  socket.on('disconnect', () => {
    users--
    io.emit('users', users)
  })
  io.emit('users', users)
  
  // Handle incoming messages
  // Someone played a note
  socket.on('played note', key => {
    // send it just to their room
    if (socket.room) {
      socket.broadcast.to(socket.room).emit('played', key)
    } else { // fallback, shouldn't ever get here
      socket.broadcast.emit('played', key)
    }
  })

  // User wants to change rooms
  socket.on('room', room => {
    if (socket.room) {
      socket.leave(socket.room)
    }
    socket.room = room
    socket.join(room)
  })
})

http.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})

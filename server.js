var express = require('express')
var path = require('path')
const app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

var users = { total: 0 }
const DIST_DIR = path.join(__dirname, 'dist')

app.use(express.static(DIST_DIR))

app.get('/', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

io.on('connection', socket => {
  // Handle user counts
  users.total++
  socket.on('disconnect', () => {
    users.total--
    io.emit('users', users.total)
  })
  io.emit('users', users.total)

  // Handle incoming messages
  // Someone played a note
  socket.on('played note', key => {
    // send it just to their room
    if (socket.room) {
      socket.broadcast.to(socket.room).emit('played', key)
    } else {
      // fallback, shouldn't ever get here
      socket.broadcast.emit('played', key)
    }
  })

  // User wants to change rooms
  socket.on('room', room => {
    if (socket.room) {
      socket.leave(socket.room)
      if (!users[socket.room]) {
        users[socket.room] = 0
      }
      users[socket.room]--
      io.to(socket.room).emit('roomusers', users[socket.room])
    }
    socket.room = room
    socket.join(room)

    if (!users[socket.room]) {
      users[socket.room] = 0
    }
    if (users[socket.room] < users.total) {
      users[socket.room]++
    }
    io.to(socket.room).emit('roomusers', users[socket.room])
  })
})

http.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})

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
  users++
  socket.on('disconnect', () => {
    users--
    io.emit('users', users)
  })
  io.emit('users', users)
  socket.on('played note', key => {
    io.emit('played', key)
  })
})

http.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})

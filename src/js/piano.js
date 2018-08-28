import io from 'socket.io-client'
import notes from './notes'
import isTouchDevice from './touch'

const pre = c => (c === 1 ? 'is' : 'are')
const title = c => (c === 1 ? 'person' : 'people')

const socket = io()
var currentRoom = 'main'

socket.on('connect', () => {
  socket.emit('room', currentRoom)
})

socket.on('played', key => {
  const $key = document.querySelector(`[data-note='${key}']`) || ''
  notes[key].play()
  $key.classList.add('active')
  setTimeout(() => $key.classList.remove('active'), 100)
})

socket.on('users', count => {
  const element = document.getElementById('users')
  element.innerHTML = `${pre(count)} ${count} ${title(count)}`
})

socket.on('roomusers', count => {
  const element = document.getElementById('roomusers')
  element.innerHTML = `${pre(count)} ${count} ${title(count)}`
})

const changeRoom = newRoom => {
  var $btn = document.querySelector(`[data-room='${currentRoom}']`) || ''
  if ($btn) {
    $btn.classList.remove('active')
  }
  currentRoom = newRoom
  socket.emit('room', newRoom)
  $btn = document.querySelector(`[data-room='${newRoom}']`) || ''
  if ($btn) {
    $btn.classList.add('active')
  }
}

const setRoomButtons = () => {
  document.querySelectorAll('[data-room]').forEach(roomButton => {
    const room = roomButton.getAttribute('data-room')
    roomButton.addEventListener('click', () => changeRoom(room))
  })
  let customRoom = document.getElementById('customRoom')
  customRoom.addEventListener('change', () => changeRoom(customRoom.value))
  customRoom.addEventListener('blur', () => changeRoom(customRoom.value))
}

const addKeyboardEvents = notes => {
  window.addEventListener('keydown', e => {
    const keyNo = e.which
    const $key = document.querySelector(`[data-key='${keyNo}']`) || ''

    if ($key) {
      const note = $key.getAttribute('data-note')
      socket.emit('played note', note)
      notes[note].play()
      $key.classList.add('active')
      setTimeout(() => $key.classList.remove('active'), 100)
    }
  })
}

const addTapEvents = notes => {
  let mouseIsDown = false
  let lastKeyPlayed = null

  window.addEventListener('mousedown', e => {
    mouseIsDown = true
  })
  window.addEventListener('mouseup', e => {
    mouseIsDown = false
  })

  document.querySelectorAll('[data-key]').forEach(key => {
    const note = key.getAttribute('data-note')

    let handler = e => {
      socket.emit('played note', note)
      notes[note].play()
      lastKeyPlayed = note
      key.classList.add('active')
      setTimeout(() => key.classList.remove('active'), 100)
    }

    let handlerMouseMove = e => {
      if (!mouseIsDown || lastKeyPlayed === note) {
        return false
      }

      handler(e)
    }

    if (isTouchDevice()) {
      key.addEventListener('touchstart', handler)
    } else {
      key.addEventListener('mousedown', handler)
      key.addEventListener('mousemove', handlerMouseMove)
    }
  })
}

export default piano => {
  addKeyboardEvents(notes)
  addTapEvents(notes)
  setRoomButtons()
}

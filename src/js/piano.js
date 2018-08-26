import io from 'socket.io-client'
import notes from './notes'
import isTouchDevice from './touch'

const socket = io()

socket.on('played', key => {
  const $key = document.querySelector(`[data-note='${key}']`) || ''
  $key.classList.add('active')
  setTimeout(() => $key.classList.remove('active'), 100)
  notes[key].play()
})

socket.on('users', count => {
  const element = document.getElementById('users')
  const title = c => (c === 1 ? 'person' : 'people')
  element.innerHTML = `${count} ${title(count)}`
})

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
  document.querySelectorAll('[data-key]').forEach(key => {
    let handler = e => {
      const note = key.getAttribute('data-note')
      socket.emit('played note', note)
      notes[note].play()
    }

    if (isTouchDevice()) {
      key.addEventListener('touchstart', handler)
    } else {
      key.addEventListener('mousedown', handler)
    }
  })
}

export default piano => {
  addKeyboardEvents(notes)
  addTapEvents(notes)
}

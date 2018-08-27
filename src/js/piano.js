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
  const pre = c => (c === 1 ? 'is' : 'are')
  const title = c => (c === 1 ? 'person' : 'people')
  element.innerHTML = `${pre(count)} ${count} ${title(count)}`
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
}

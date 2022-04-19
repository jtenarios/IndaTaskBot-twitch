import './app.css'
import { getAvatar } from './apiTwitch'
import 'animate.css'

const taskListJson = {
  todo: [
    { id: 1, user: 'User 1', task: 'Task 1' },
    { id: 2, user: 'User 2', task: 'Task 2' },
    { id: 3, user: 'User 3', task: 'Task 3' },
    { id: 4, user: 'User 4', task: 'Task 4' },
    { id: 5, user: 'User 5', task: 'Task 5' }
  ]
}

let taskListHtml
let taskList
let tasksDone = 0
let taskId = 0

// Conectar con Twitch
const tmi = require('tmi.js')
// import tmi from 'tmi.js';

const options = {
  options: {
    debug: true
  },
  connection: {
    reconnect: true
  },
  identity: {
    username: process.env.USERNAME, // botUser
    password: process.env.PASSWORD // botUser
  },
  channels: [process.env.CHANNELS] // canalEmisor
}

const client = new tmi.Client(options)

// Register our event handlers (defined below)
client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)

// Connect to Twitch:
client.connect()

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) {
    return
  } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim().toLowerCase()

  // console.log('target', target);
  // console.log('context', context);

  // If the command is known, let's execute it
  if (commandName.startsWith('!add ')) {
    const task = commandName.replace('!add ', '')
    addTask(target, context, task)
  } else if (commandName === '!delete') {
    deleteTask(target, context)
  } else if (commandName.startsWith('!delete ')) {
    const taskId = commandName.replace('!delete ', '')
    deleteModeratorTask(target, context, taskId)
  } else if (commandName === '!done') {
    doneTask(target, context)
  } else if (commandName.startsWith('!edit ')) {
    const task = commandName.replace('!edit ', '')
    editTask(target, context, task)
  } else if (commandName === '!list') {
    listTask(target, context)
  } else if (commandName.startsWith('!kiss ')) {
    const user2 = commandName.replace('!kiss ', '')
    kiss(target, context, user2)
  } else if (commandName.startsWith('!apoyo ') || commandName.startsWith('!so ')) {
    // Quito el @ para que funcione con !so Jymy o !so @Jymy
    const profileName = commandName.replace('!apoyo ', '').replace('!so ', '').replace('@', '')
    showAvatar(profileName)
  } else if (commandName === '!status') {
    client.action(target, 'Servicios operativos...')
  } /* else {
    client.say(target, `* Unknown command ${commandName}`);
    console.log(`* Unknown command ${commandName}`);
  } */
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  changeText() // Carga lista inicial
  // console.log(`* Connected to ${addr}:${port}`);
  client.action(process.env.CHANNELS, 'Iniciando servicios...')
}

function addTask (target, context, task) {
  const findUser = context.username
  let myTask = task.replace('<', '&lt;').replace('>', '&gt;') // Para evitar inyeccion de codigo

  if (myTask.length > 23) {
    myTask = task.substr(0, 23) + '...'
  }

  // Busca al usuario findUser en el json
  const userId = taskListJson.todo.findIndex(usuario => usuario.user === findUser)

  if (userId < 0) {
    // Anyadir tarea
    taskId = taskId + 1
    taskListJson.todo.push({ id: taskId, user: findUser, task: myTask })
    client.say(target, `${findUser}  Tarea añadida`)
    changeText()
  } else {
    // No se pude anyadir mas de una tarea por usuario
    client.say(target, `${findUser}  No se puede añadir más de una tarea`)
  }

  // console.log(`* End addTask`)
}

function deleteTask (target, context) {
  const findUser = context.username

  // Busca al usuario findUser en el json
  const userId = taskListJson.todo.findIndex(usuario => usuario.user === findUser)
  // console.log('userId', userId);

  if (userId < 0) {
    // No se pude anyadir mas de una tarea por usuario
    client.say(target, `${findUser}  No hay ninguna tarea pendiente`)
  } else {
    // Eliminar tarea
    taskListJson.todo.splice(userId, 1)
    client.say(target, `${findUser}  Tarea eliminada`)
    changeText()
  }
}

function deleteModeratorTask (target, context, taskId) {
  const findUser = context.username

  // Solo los moderadores pueden eliminar tareas de otros usuarios
  if (!(context.mod || context['user-type'] === 'mod')) {
    client.say(target, `${findUser}  Comando reservado para moderadores`)
  } else {
    // Busca la tarea con id taskId en el json
    const id = taskListJson.todo.findIndex(tarea => tarea.id === taskId)

    if (id < 0) {
      // No existe la taskId
      client.say(target, `${findUser}  No existe la tarea con id ${taskId}`)
    } else {
      // Eliminar tarea
      taskListJson.todo.splice(id, 1)
      client.say(target, `${findUser}  Tarea eliminada`)
      changeText()
    }
  }
}

function doneTask (target, context) {
  deleteTask(target, context)
  tasksDone = tasksDone + 1
  changeText()
}

function editTask (target, context, task) {
  const findUser = context.username
  const userId = taskListJson.todo.findIndex(usuario => usuario.user === findUser)
  // console.log('existsUser', findUser);

  if (userId < 0) {
    // No se pude anyadir mas de una tarea por usuario
    client.say(target, `${context.username}  No hay ninguna tarea pendiente`)
  } else {
    // Eliminar tarea
    taskListJson.todo.splice(userId)
    // Anyadir tarea
    let myTask = task.replace('<', '&lt;').replace('>', '&gt;') // Para evitar inyeccion de codigo

    if (myTask.length > 23) {
      myTask = task.substr(0, 23) + '...'
    }

    taskListJson.todo.push({ user: context.username, task: myTask })
    client.say(target, `${context.username}  Tarea modificada`)
    changeText()
  }
}

function listTask (target, context) {
  console.log('listTask :>> Init')
  taskList = ''

  for (const x of taskListJson.todo) {
    if (taskList === '') {
      taskList = '------------------------------'
      taskList = taskList + pad(' ' + x.id + '. ' + x.user + ': ' + x.task + ' ', 72, 'ㅤ')
    } else {
      taskList = taskList + pad(' ' + x.id + '. ' + x.user + ': ' + x.task + ' ', 72, 'ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ')
    }
  }

  console.log('taskList :>> ', taskList)

  if (taskList === '') {
    client.say(target, 'No hay tareas pendientes')
  } else {
    client.say(target, `${taskList}`)
  }
}

function changeText () {
  // console.log(`* changeText`)
  // console.log('taskListJson["todo"]', taskListJson['todo'])

  // document.body.appendChild(component());

  /* document.createElement("div");
    document.body.appendChild(component()); */

  const appDivTaskListHeader = document.getElementById('divTaskListHeader')
  appDivTaskListHeader.innerHTML = `<h3>Tareas completadas: ${tasksDone} </h3>`

  taskListHtml = ''
  // Recorrer json array si hay tareas pendientes
  for (const x of taskListJson.todo) {
    console.log(x)
    // Si lista vacia
    if (taskListHtml === '') {
      taskListHtml = '<li>' + x.id + '. <b>' + x.user + ':</b> ' + x.task + '</li>'
    } else {
      taskListHtml = taskListHtml + '<li>' + x.id + '. <b>' + x.user + ':</b> ' + x.task + '</li>'
    }
  }
  // class="no-bullets", para que no pinte los bullets point
  // taskListHtml = '<ul class="no-bullets">' + taskListHtml + "</ul>"
  taskListHtml = '<ul class="no-bullets">' + taskListHtml + '</ul>'

  const appDivTaskList = document.getElementById('divTaskList')
  appDivTaskList.innerHTML = taskListHtml

  activeScroll() // Activar auto scroll de la lista
}

function kiss (target, context, user2) {
  if (context.username.toLowerCase() === user2.toLowerCase()) {
    client.say(target, `${context.username}  se besó a sí mismo <3 `)
  } else {
    client.say(target, `${context.username}  le dio un beso a ${user2} <3 `)
  }

  // console.log('kiss')
  // Mostrar div
  // showDiv("divEmotes", "/src/Hearts.webp");
  // Ocultar div a los 5 seg.
  // setTimeout(function () { hideDiv("divEmotes") }, 5000);
}

async function showAvatar (profileName) {
  // async function
  try {
    const avatarImagen = await getAvatar(profileName.toLowerCase())
    // console.log('avatarImagen', avatarImagen);
    // Mostrar div
    showDiv('divAvatarImg', avatarImagen)
    showDiv('divAvatarName', profileName)
    // Ocultar div a los 5 seg.
    setTimeout(function () {
      hideDiv('divAvatarImg', avatarImagen)
      hideDiv('divAvatarName', profileName)
    }, 5000)
  } catch (expception) {
    // console.log('expception', expception);
  }
}

function showDiv (divName, param1) {
  // console.log('showDiv', divName)

  const divItem = document.getElementById(divName)
  divItem.style.zIndex = '3' // poner el div al frente

  // Para kiss
  if (divName === 'divEmotes') {
    let imgEmotes = document.getElementById('emoteId')

    // Si no existe lo creo
    if (!imgEmotes) {
      imgEmotes = document.createElement('img')
    }
    imgEmotes.id = 'emoteId'
    imgEmotes.src = param1
    divItem.appendChild(imgEmotes)

    // Eliminar css anteriores
    imgEmotes.classList.remove('animate__animated', 'animate__fadeOut') // animated css
    imgEmotes.classList.remove('animate__animated', 'animate__bounceOutLeft') // animated css
    imgEmotes.classList.remove('animate__animated', 'animate__bounceOutRight') // animated css
    imgEmotes.classList.remove('animate__animated', 'circular--square') // animated css
    imgEmotes.classList.remove('textstyle')

    // Anyadir nuevos css
    imgEmotes.classList.add('animate__animated', 'animate__fadeIn') // animated css
  }

  // Para el avatarImg
  if (divName === 'divAvatarImg') {
    let imgAvatar = document.getElementById('avatarId')

    // Si no existe lo creo
    if (!imgAvatar) {
      imgAvatar = document.createElement('img')
    }
    imgAvatar.id = 'avatarId'
    imgAvatar.src = param1
    divItem.appendChild(imgAvatar)

    // Eliminar css anteriores
    imgAvatar.classList.remove('animate__animated', 'animate__fadeOut') // animated css
    imgAvatar.classList.remove('animate__animated', 'animate__bounceOutLeft') // animated css
    imgAvatar.classList.remove('animate__animated', 'animate__bounceOutRight') // animated css
    imgAvatar.classList.remove('animate__animated', 'circular--square') // animated css
    imgAvatar.classList.remove('textstyle')

    // Anyadir nuevos css
    imgAvatar.classList.add('animate__animated', 'animate__bounceInLeft') // animated css
    imgAvatar.classList.add('circular--square') // poner avatar redondo
  }

  // Para el avatarName
  if (divName === 'divAvatarName') {
    let textName = document.getElementById('userNameId')

    // Si no existe lo creo
    if (!textName) {
      textName = document.createElement('h2')
    }
    textName.id = 'userNameId'
    textName.textContent = param1
    divItem.appendChild(textName)

    // Eliminar css anteriores
    textName.classList.remove('animate__animated', 'animate__fadeOut') // animated css
    textName.classList.remove('animate__animated', 'animate__bounceOutLeft') // animated css
    textName.classList.remove('animate__animated', 'animate__bounceOutRight') // animated css
    textName.classList.remove('animate__animated', 'circular--square') // animated css
    textName.classList.remove('textstyle')

    // Anyadir nuevos css
    textName.classList.add('animate__animated', 'animate__bounceInRight') // animated css
    textName.classList.add('textstyle')
  }
}

function hideDiv (divName, param1, param2) {
  // console.log('hideDiv', divName)
  const divItem = document.getElementById(divName)
  divItem.style.zIndex = '1' // poner el div atrás

  let item

  if (divName === 'divEmotes') { // Para kiss
    item = document.getElementById('emoteId')
  } else if (divName === 'divAvatarImg') { // Para el avatarImg
    item = document.getElementById('avatarId')
  } else if (divName === 'divAvatarName') { // Para el avatarName
    item = document.getElementById('userNameId')
  }

  // Eliminar la imagen anterior si existe

  // Eliminar css anteriores
  item.classList.remove('animate__animated', 'animate__fadeIn') // animated css
  item.classList.remove('animate__animated', 'animate__bounceInLeft') // animated css
  item.classList.remove('animate__animated', 'animate__bounceOutRight') // animated css
  item.classList.remove('animate__animated', 'circular--square') // animated css

  if (divName === 'divEmotes') { // Para kiss
    item.classList.add('animate__animated', 'animate__fadeOut') // animated css
  } else if (divName === 'divAvatarImg') { // Para el avatar anyadir animacion
    item.classList.add('animate__animated', 'animate__bounceOutLeft') // animated css
    item.classList.add('circular--square') // poner avatar redondo
  } else if (divName === 'divAvatarName') { // Para el avatar anyadir animacion
    item.classList.add('animate__animated', 'animate__bounceOutRight') // animated css
  }
}

// Hacer que el divTaskList haga scroll de forma automática
function activeScroll () {
  // Referencia: https://codepen.io/IamAdarsh/pen/LYEGPgw
  // console.log('Inicio - activeScroll');

  const doom = require('jQuery')

  // var tickerLength = $('.container ul li').length;
  const tickerHeight = doom('.container ul li').outerHeight()

  doom('.container ul li:last-child').prependTo('.container ul')
  doom('.container ul').css('marginTop', -tickerHeight)

  function moveTop () {
    doom('.container ul').animate({
      top: -tickerHeight
    }, 600, function () {
      doom('.container ul li:first-child').appendTo('.container ul')
      doom('.container ul').css('top', '')
    })
  }

  const refreshId = setInterval(function () {
    // Ejecutar solo cuando haya 10 o más elementos en la lista

    const tickerLength = taskListJson.todo.length
    // console.log('tickerLength', tickerLength);
    // console.log('setInterval')

    if (tickerLength >= 5) {
      moveTop()
    } else {
      clearInterval(refreshId)
    }
  }, 2000)
}

function pad (input, length, padding) {
  const str = input + ''
  return (length <= str.length) ? str : pad(str + padding, length, padding)
}

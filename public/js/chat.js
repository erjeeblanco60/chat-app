//to connect with server
const socket = io() 

//elements
const $messageform = document.querySelector('#message-form')
const $messageForminput = $messageform.querySelector('input')
const $messageFormButton = $messageform.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Templates rendering
const messageTemplates = document.querySelector('#message-template').innerHTML
const locationtemp = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


//Receiving intro message in client side
socket.on('message', (message)=> {
console.log(message)

    //To use the templetes to print the messages
    const html = Mustache.render(messageTemplates, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm: a ')
    })

    //inject the message to templates
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

///Location Message
socket.on('LocationMessage',(message)=> {
    console.log(message)
    const html = Mustache.render(locationtemp,{
        username: message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


//Room data
socket.on('roomData', ({room, users})=> {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//sendMessage
$messageform.addEventListener('submit',(e)=>{
e.preventDefault()
//disabled
$messageFormButton.setAttribute('disabled', 'disabled')
//Store the value of input
const message = e.target.elements.inputmessage.value

socket.emit('sendMessage', message, (error)=> {

        //enabled
        $messageFormButton.removeAttribute('disabled')
        //clear the input
        $messageForminput.value = ''
        //focus the corsur
        $messageForminput.focus()


        if(error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })
}) 

//sendLocation
$sendLocationButton.addEventListener('click',()=> {
    
    if(!navigator.geolocation) {

        return alert('Geolocation is not supported by your browser.')
    }

    //disabled
    $sendLocationButton.setAttribute('disabled', 'disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
  
    socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
            
        }, ()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared!')
        })
    })
})

//emit room
socket.emit('join', {username, room},(error)=> {
    if (error) {
        alert(error)
        location.href = '/'
    }
}) 

// socket.on('countUpdated', (count)=> {
//     console.log('The count has been updated', count)

// })


// document.querySelector('#increment').addEventListener('click', ()=> {
//     console.log('Clicked')

//     socket.emit('increment')
// })

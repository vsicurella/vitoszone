// global variables
const CANVAS = document.getElementById('zone-bg')
const g = CANVAS.getContext("2d")
const PARENT = CANVAS.parentElement
const BGCOLOR = getComputedStyle(document.getElementsByTagName('html')[0])['background-color']
console.log(BGCOLOR)

let w, h

let timeRes = 350 // resolution
let timeSpeed =  20 // ms
let t = 0
let tT = 0

function concentricCircles(canvasContext, time, clearAll=false) {
    if (clearAll) {
        canvasContext.fillStyle = BGCOLOR
        canvasContext.fillRect(0, 0, w, h)
    }

    canvasContext.strokeStyle = "black"
    canvasContext.beginPath()
    canvasContext.arc(w/2, h/2, Math.min(w, h)/2*Math.abs(Math.sin((t%timeRes)/timeRes * 2*Math.PI)) * (tT/(timeRes*.382) + 1), 0, 2*Math.PI)
    canvasContext.stroke() 
}

function concentricRotatingSquares(canvasContext, time) {
    canvasContext.strokeStyle = "black"
    let sqw = (w*0.618)*Math.abs(Math.sin((t%timeRes)/timeRes * 2*Math.PI))/2
    let ang = (Math.PI * 2 * (t + 2) / timeRes) * 0.5
    canvasContext.rotate(ang)
    canvasContext.strokeRect(w/1.1-sqw-(tT*w/4*Math.sin(tT/timeRes * Math.PI*2)), h/4-sqw, sqw, sqw)
    canvasContext.rotate(-ang)
}



function runBackground(canvasContext, bgFunc, timeInc=false) {
    bgFunc(canvasContext, t)
    t++
    if (t >= timeRes && !timeInc) {
        t = 0
        tT++
    }
}

function setTimeResolution(resIn) {
    timeRes = parseInt(resIn)
}

function setTimeSpeed(msIn) {
    timeSpeed = msIn
}

function updateSize() {
    w = parseInt(PARENT.clientWidth)
    h = parseInt(PARENT.clientHeight)
    CANVAS.width = w
    CANVAS.height = h
}

function resetTime() {
    t = 0
}

updateSize()

console.log("background initialized")
console.log("width: " + w)
console.log("height: " + h)

const STYLES = {
   0: concentricCircles,
   1: concentricRotatingSquares
}
const bgFunc = STYLES[Math.floor(Math.random() * 2)]

console.log(bgFunc)

setInterval(f => runBackground(g, bgFunc), timeSpeed)
// global variables
const CANVAS = document.getElementById('zone-canvas')
const g = CANVAS.getContext("2d")
const PARENT = document.getElementById('zone-bg')

const FRAMERATE = 10
const INTERVAL = 1000 / parseFloat(FRAMERATE)

let w = parseInt(PARENT.clientWidth)
let h = parseInt(PARENT.clientHeight)

let mousePos = [0, 0]

let grayField = new Field(-1, -1, 1, 1)
let mouseMass = new Mass(0, 0, 0.05, 1)
grayField.addParticle(mouseMass)

let render = new FieldRender({dimensions: [w, h], renderScaling: [255,255,255,255]})
render.addField(grayField, 0, 1)

function updateMousePosition(event) {
    mousePos = [event.pageX, event.pageY]
}

function showRender(graphicsContext) {
    graphicsContext.fillStyle = 'black'
    graphicsContext.fillRect(0, 0, w, h)
    render.renderTo(graphicsContext, 'gray')
}

window.addEventListener('resize', event => {
    w = parseInt(PARENT.clientWidth)
    h = parseInt(PARENT.clientHeight)
    console.log("window: " + w + ", " + h)
    render.renderDimensions = [w, h]
})

CANVAS.onmousemove = (event) => {
    updateMousePosition(event)
    let px = mousePos[0] / parseInt(PARENT.clientWidth)
    let py = mousePos[1] / parseInt(PARENT.clientHeight)
    mouseMass.setPosition(grayField.proportionalX(px), grayField.proportionalY(py))
    //console.log(mouseMass.amplitudeAt(PARENT.clientWidth/2, PARENT.clientHeight/2))
}

CANVAS.onclick = event => {
    console.log(render)
    //console.log(render.renderTo(g, 'gray'))
}

g.fillStyle = 'black'
g.fillRect(0, 0, w, h)

setInterval( f => showRender(g), INTERVAL)
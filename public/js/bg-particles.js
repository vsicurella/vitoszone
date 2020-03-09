// global variables
const CANVAS = document.getElementById('zone-canvas')
const g = CANVAS.getContext("2d")
const PARENT = document.getElementById('zone-bg')

const FRAMERATE = 30
const INTERVAL = 1000 / parseFloat(FRAMERATE)

let w = parseInt(PARENT.clientWidth)
let h = parseInt(PARENT.clientHeight)

let mousePos = [0, 0]

let redField = new Field()
let greenField = new Field()
let blueField = new Field()

let redMass = new Mass(145, 77, 10, 1)
redMass.setAngle(Math.PI / 8)
redMass.setVelocity(1)

let greenMass = new Mass(160, 90, 10, 1)
greenMass.setAngle(-Math.PI * 5 / 8)
greenMass.setVelocity(2)

let blueMass = new Mass(145, 90, 10, 1)
blueMass.setAngle(Math.PI / 4)
blueMass.setVelocity(1.5)

redField.addParticle(redMass)
greenField.addParticle(greenMass)
blueField.addParticle(blueMass)

let render = new FieldRender({dimensions: [w, h], renderScaling: [255,255,255,255]})
render.addField(redField, 0, 1)
render.addField(greenField, 1, 1)
render.addField(blueField, 2, 1)

function updateMousePosition(event) {
    mousePos = [event.pageX, event.pageY]
    //mouseMass.setPosition(mousePos[0], mousePos[1])
}

function showRender(graphicsContext) {
    redMass.setAngle(redMass.angle + Math.PI/(FRAMERATE))
    blueMass.setAngle(blueMass.angle - Math.PI/(FRAMERATE))
    greenMass.setAngle(greenMass.angle + Math.PI/(FRAMERATE))
    redMass.step()
    greenMass.step()
    blueMass.step()
    render.renderTo(graphicsContext, 'rgba')
    //graphicsContext.strokeStyle = 'white'
    //let rect = redMass.boundingBox()
    //graphicsContext.strokeRect(rect[0], rect[1], rect[2], rect[3])
}

window.addEventListener('resize', event => {
    w = parseInt(PARENT.clientWidth)
    h = parseInt(PARENT.clientHeight)
    console.log("window: " + w + ", " + h)
    render.renderDimensions = [w, h]
})

CANVAS.onmousemove = (event) => {
    updateMousePosition(event)
    //console.log(mouseMass.amplitudeAt(PARENT.clientWidth/2, PARENT.clientHeight/2))
}

CANVAS.onclick = event => {
    console.log(render)
    //console.log(render.renderTo(g, 'gray'))
}

g.fillStyle = 'black'
g.fillRect(0, 0, w, h)

setInterval( f => showRender(g), INTERVAL)
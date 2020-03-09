class Particle {
    x = 0
    y = 0
    constructor(xIn, yIn) {
        this.x = xIn
        this.y = yIn
    }

    setPosition(xIn, yIn) {
        this.x = xIn
        this.y = yIn
    }
}

class Mass extends Particle {
    angle = 0
    velocity = 0

    constructor(originX, originY, radius, amplitude) {
        super(originX, originY)
        this.radius = radius
        this.amplitude = amplitude
    }

    // TODO: zero value threshold
    amplitudeAt(ptX, ptY) {
        let sdx = Math.pow(ptX - this.x, 2)
        let sdy = Math.pow(ptY - this.y, 2)
        let sdr = Math.pow(this.radius, 2) * 2

        return Math.exp(-(sdx/sdr + sdy/sdr))
    }

    setAngle(angleIn) {
        this.angle = angleIn
    }

    setVelocity(velocityIn) {
        this.velocity = velocityIn
    }

    step(multiplier=1) {
        this.x += this.velocity * Math.cos(this.angle) * multiplier
        this.y += this.velocity * Math.sin(this.angle) * multiplier
    }
}

class Field {
    particles = []
    constructor(xMin, yMin, xMax, yMax) {
        this.xMin = xMin
        this.yMin = yMin
        this.xMax = xMax
        this.yMax = yMax
    }

    get population() {
        return this.particles.length;
    }

    particle(index) {
        return particles[index]
    }

    proportionalX(percentX) {
        return (this.xMax - this.xMin) * percentX + this.xMin
    }

    proportionalY(percentY) {
        return (this.yMax - this.yMin) * percentY + this.yMin    
    }

    proportionalXY(percentX, percentY) {
        return [this.proportionalX(percentX), this.proportionalY(percentY)]
    }

    valueAt(xIn, yIn) {
        return this.particles.map( part => part.amplitudeAt(xIn, yIn)).reduce( (a, b) => a + b)
    }

    valueAtProportion(percentX, percentY) {
        [w, h] = this.proportionalXY(percentX, percentY)
        return this.particles.map( part => part.amplitudeAt(w, h)).reduce( (a, b) => a + b)
    }

    addParticle(particleIn) {
        this.particles.push(particleIn)
    }

    removeParticle(indexToRemove) {
        return this.particles.splice(indexToRemove, 1)
    }
}

class FieldRender {
    renderEncoding = ['gray', 'rgba', 'hsva', 'gradient']

    fields = []
    fieldScales = []
    fieldCodes = []

    constructor(argObj) {
        this._renderDimensions = argObj.dimensions ? argObj.dimensions : [512, 512]
        this._renderScaling = argObj.renderScaling ? argObj.renderScaling : [1.0, 1.0, 1.0, 1.0]

        this.w = this._renderDimensions[0]
        this.h = this._renderDimensions[1]

        console.log("input: " + argObj.dimensions)
        console.log("member: " + this._renderDimensions)
        console.log("each: " + this.w + " " + this.h)
    }

    get size() {
        return this.fields.length
    }

    addField(fieldIn, code, scale=1.0) {
        this.fields.push(fieldIn)
        this.fieldCodes.push(code)
        this.fieldScales.push(scale)
    }

    setFieldCode(index, code) {
        this.fieldCodes[index] = code
    }

    setFieldScale(index, scale) {
        this.fieldScales[index] = scale
    }

    set renderDimensions(dimensions) {
        this._renderDimensions = dimensions
        this.w = dimensions[0]
        this.h = dimensions[1]
    }

    set renderScaling(channelScalesIn) {
        this._renderScaling = channelScalesIn
    }

    renderTo(graphicsContext, encoding='rgba') {
        let render = []
        switch(encoding) {
            case 'gray':
                render = this.renderGray(graphicsContext)
                break
            case 'rgba':
                render = this.renderRGBA(graphicsContext)
                break
            case 'hsva':
                render = this.renderHSVA(graphicsContext)
                break
            case 'gradient':
                break
        }

        return render
    }

    renderGray(g) {
        let imgData = g.createImageData(this.w, this.h)
        let index = 0

        for (var row = 0; row < this.h; row++) {
            for (var col = 0; col < this.w; col++) {
                let yPercent = col / this.h
                let xPercent = row / this.w

                let value = this.fields.map( (f, ind) => f.valueAtProportion(xPercent, yPercent) * this.fieldScales[ind])
                                       .reduce( (a, b) => a + b)
                                       * this._renderScaling[0]
                
                for (var i = 0; i < 3; i++)
                    imgData.data[index + i] = value
                imgData.data[index + 3] = 1 * this._renderScaling[3]
                
                index += 4
            }
        }

        g.putImageData(imgData, 0, 0)
        return imgData
    }

    renderRGBA(g) {
        let imgData = g.createImageData(this.w, this.h)
        let index = 0

        for (var row = 0; row < this.h; row++) {
            for (var col = 0; col < this.w; col++) {
                let yPercent = col / this.h;
                let xPercent = row / this.w;
                [r, g, b, a] = [0, 0, 0, 1];
                let color = [r, g, b, a]
                
                for (var f = 0; f < this.fields.length; f++) {
                    let field = this.fields[f]
                    let value = field.valueAtProportion(xPercent, yPercent) * this.fieldScales[f]
                    let code = this.fieldCodes[f]
                    if (code < 3) {
                        color[code] += value * this._renderScaling[code]
                    } else if (code === 3) {
                        color[code] *= value * this._renderScaling[code]
                    }
                }

                // add manipulation function arg to incorporate hsv & cmyk?

                for (var c = 0; c < 4; c++) {
                    imgData.data[index + c] = color[c]
                }

                index += 4
            }
        }

        g.putImageData(imgData, 0, 0)
        return imgData
    }

    renderHSVA(g) {

    }
}
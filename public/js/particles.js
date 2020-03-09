function pointInRect(xIn, yIn, rect=[0, 0, 0, 0]) {
    return xIn >= rect[0] && yIn >= rect[1] && xIn <= rect[2] && yIn <= rect[3]
}

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
        this.maxRadius = this.radius * Math.E
    }

    boundingBox() {
        return [this.x - this.maxRadius, this.y - this.maxRadius, this.x + this.maxRadius, this.y + this.maxRadius]
    }

    amplitudeAt(ptX, ptY, cutoff = true) {
        let sdx = Math.pow(ptX - this.x, 2)
        let sdy = Math.pow(ptY - this.y, 2)

        let value = 0
        // TODO: improve zero thresholding
        if (Math.sqrt(sdx + sdy) <= this.maxRadius || !cutoff) {
            let sdr = Math.pow(this.radius, 2) * 2
            value = this.amplitude * Math.exp(-(sdx/sdr + sdy/sdr))
        }
       
        return value
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
    constructor() {
    }

    get population() {
        return this.particles.length;
    }

    particle(index) {
        return particles[index]
    }

    boundingBox() {
        let bounds = [0, 0, 0, 0]
        for (let p of this.particles) {
            let box = p.boundingBox()
            let i = 0
            for (; i < 2; i++)
                if (bounds[i] > box[i])
                    bounds[i] = box[i]
            for (; i < 4; i++)
                if (bounds[i] < box[i])
                    bounds[i] = box[i]
        }
        return bounds
    }

    valueAt(xIn, yIn) {
        let validParticles = []
        // check if in bounding box of any particles

        for (let p of this.particles) {
            let box = p.boundingBox()
            if (pointInRect(xIn, yIn, box))
                validParticles.push(p)
        }
        
        if (validParticles.length > 0)
            return this.particles.map( part => part.amplitudeAt(xIn, yIn)).reduce( (a, b) => a + b)
        else
            return 0
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
                let value = this.fields.map( (f, ind) => f.valueAt(col, row) * this.fieldScales[ind])
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
                let r, g, b, a
                [r, g, b, a] = [0, 0, 0, 1];
                let color = [r, g, b, a]
                
                for (var f = 0; f < this.fields.length; f++) {
                    let field = this.fields[f]
                    if (pointInRect(col, row, field.boundingBox())) { // not a great solution
                        let value = field.valueAt(col, row) * this.fieldScales[f]
                        let code = this.fieldCodes[f]
                        if (code < 3) {
                            color[code] += value
                        } else if (code === 3) {
                            color[code] *= value
                        }
                    }
                }

                // add manipulation function arg to incorporate hsv & cmyk?

                for (var c = 0; c < 4; c++) {
                    imgData.data[index + c] = color[c] * this._renderScaling[c]
                }

                index += 4
            }
        }

        g.putImageData(imgData, 0, 0)
        return imgData
    }

    renderRGBAFast(g) {
        let imgData = g.createImageData(this.w, this.h)

        for (let f = 0; f < this.fields.length; f++) {
            let index = 0
            let field = this.fields[f]
            let box = field.boundingBox()

            for (var row = box[1]; row <= box[3]; row++) {
                for (var col = box[0]; col <= box[2]; col++) {
                    let value = field.valueAt(col, row) * this.fieldScales[f]
                    let code = this.fieldCodes[f]
                    imgData.data[index + code] = value * this._renderScaling[code]
                    index += 4
                }
            }
        }

        for (let a = 3; a < imgData.data.length; a+=4) {
            imgData.data[a] = 255
        }

        g.putImageData(imgData, 0, 0)
        return imgData
    }

    renderHSVA(g) {

    }
}
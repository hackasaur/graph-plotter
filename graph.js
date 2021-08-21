let canvas = document.getElementById("myCanvas");
function draw() {
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = Math.floor(window.innerWidth / 1.5)
        ctx.canvas.height = Math.floor(window.innerHeight / 1.2)

        const createPoint = (x, y) => {
            let point = new Int8Array(2)
            point = [x, y]
            return point
        }

        const setCanvasFont = (ctx, font) => {
            ctx.fillStyle = `${font.fontColor}`
            ctx.font = `${font.fontSize}px ${font.fontStyle}`
        }

        const getFontHeight = (ctx) => {
            return ctx.measureText('O').fontBoundingBoxAscent
        }

        const getCharacterWidth = (ctx, character) => {
            return ctx.measureText(character).width
        }

        const printOnCanvas = (ctx, text, coords, font) => {
            setCanvasFont(ctx, font)
            ctx.fillText(text, coords[0], coords[1])
        }

        const checkEquation = (fOfX, characters) => {
            for (let character of fOfX) {
                if (characters.includes(character)) {
                    continue
                }
                else {
                    console.log(character)
                    return false
                }
            }
            return true
        }

        const returnFOfX = (fOfX_string, allowedCharacters) => {
            if (checkEquation(fOfX_string, allowedCharacters)) {
                try {
                    return Function('x', `return ${fOfX_string}`)
                }
                catch (error) {
                    document.getElementById('error').innerText = error
                }
            }
            else {
                document.getElementById('error').innerText = `equation cannot contain characters other than: ${allowedCharacters}`
            }
        }

        const cartesianToCanvasCoords = (coords, originInCanvas, unitPixels) => {
            return createPoint(originInCanvas[0] + unitPixels * coords[0], originInCanvas[1] - unitPixels * coords[1])
        }

        const canvasToCartestianCoords = (coords, originInCanvas, unitPixels) => {
            return createPoint((coords[0] - originInCanvas[0]) / unitPixels, (originInCanvas[1] - coords[1]) / unitPixels)
        }

        const curve = (ctx, fOfX, lineWidth, originInCanvas, unitPixels, axisLength) => {
            if (unitPixels <= 0) {
                throw 'unitPixels cannot be <= 0'
            }

            const properties = { fOfX: fOfX, lineWidth: lineWidth, originInCanvas: originInCanvas, unitPixels: unitPixels }

            let startX = Math.floor(-axisLength / properties.unitPixels)
            let endX = Math.ceil(axisLength / properties.unitPixels)

            return {
                draw: () => {
                    if (properties.unitPixels <= 0) {
                        throw 'unitPixels cannot be <= 0'
                    }
                    //make lines that trace coordinates of the function in an interval
                    let dx = 1 / properties.unitPixels
                    ctx.strokeStyle = "white"
                    ctx.lineWidth = lineWidth
                    ctx.lineJoin = 'round'
                    let startPoint = cartesianToCanvasCoords(createPoint(startX, properties.fOfX(startX)), properties.originInCanvas, properties.unitPixels)
                    ctx.beginPath()
                    let canvasX = startPoint[0]
                    let canvasY = startPoint[1]
                    ctx.moveTo(canvasX, canvasY)
                    for (let x = startX; x <= endX - dx; x += dx) {
                        canvasX = canvasX + 1
                        canvasY = properties.originInCanvas[1] - properties.unitPixels * properties.fOfX(x + dx)
                        if (canvasX < canvas.width && canvasY < canvas.height) {
                            ctx.lineTo(canvasX, canvasY)
                        }
                        else {
                            ctx.moveTo(canvasX, canvasY)
                        }
                    }
                    ctx.stroke()
                },
                getProperties: () => {
                    return properties
                },
                updateStartEnd: () => {
                    startX = Math.floor(-axisLength / properties.unitPixels)
                    endX = Math.ceil(axisLength / properties.unitPixels)
                }
            }
        }

        const axis = (ctx, axisLength, originInCanvas, unitPixels) => {
            const properties = { axisLength: axisLength, originInCanvas: originInCanvas, unitPixels: unitPixels, hatchMarkLength: 5, hatchMarkGap: 1 }
            if (unitPixels <= 0) {
                throw 'unitPixels cannot be <= 0'
            }
            return {
                draw: () => {
                    if (properties.unitPixels <= 0) {
                        throw 'unitPixels cannot be <= 0'
                    }
                    ctx.strokeStyle = "purple"
                    ctx.lineWidth = 1
                    //y axis
                    ctx.beginPath()
                    ctx.moveTo(originInCanvas[0], originInCanvas[1] - properties.axisLength)
                    ctx.lineTo(originInCanvas[0], originInCanvas[1] + properties.axisLength)
                    //x axis
                    ctx.moveTo(originInCanvas[0] - properties.axisLength, originInCanvas[1])
                    ctx.lineTo(originInCanvas[0] + properties.axisLength, originInCanvas[1])
                    ctx.stroke()
                    let originX = properties.originInCanvas[0]
                    let originY = properties.originInCanvas[1]

                    ctx.beginPath()
                    numberOfHatchMarks = Math.floor(properties.axisLength / properties.unitPixels)
                    for (let hatchMarkIndex = 0; hatchMarkIndex <= numberOfHatchMarks; hatchMarkIndex++) {
                        let hatchMarkOffset = hatchMarkIndex * properties.unitPixels
                        ctx.moveTo(originX + hatchMarkOffset, originY - properties.hatchMarkLength)
                        ctx.lineTo(originX + hatchMarkOffset, originY + properties.hatchMarkLength)
                        ctx.moveTo(originX - hatchMarkOffset, originY - properties.hatchMarkLength)
                        ctx.lineTo(originX - hatchMarkOffset, originY + properties.hatchMarkLength)
                    }
                    //hatchMarks for y axis
                    for (let hatchMarkIndex = 0; hatchMarkIndex <= numberOfHatchMarks; hatchMarkIndex++) {
                        let hatchMarkOffset = hatchMarkIndex * properties.unitPixels
                        ctx.moveTo(originX + properties.hatchMarkLength, originY + hatchMarkOffset)
                        ctx.lineTo(originX - properties.hatchMarkLength, originY + hatchMarkOffset)
                        ctx.moveTo(originX + properties.hatchMarkLength, originY - hatchMarkOffset)
                        ctx.lineTo(originX - properties.hatchMarkLength, originY - hatchMarkOffset)
                    }
                    ctx.stroke()
                },
                getProperties: () => {
                    return properties
                }
            }
        }

        function renderGraph(axis, curve) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            axis.draw()
            curve.draw()
            printOnCanvas(ctx,
                `x:${Math.round(mouseCoordsInCartesian[0] * 100) / 100},y:${Math.round(mouseCoordsInCartesian[1] * 100) / 100}`,
                mouseCoords,
                { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '20' })
        }

        let origin = createPoint(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2))
        let unit = 40
        let axisLength = Math.floor(canvas.height / 2) - 5
        let allowedCharacters = ['x', '+', '-', '*', '/']
        let zoomRate = 5
        for (let i = 0; i < 10; i++) {
            allowedCharacters.push(`${i}`)
        }

        let fOfX_string = document.getElementById('f of x').value
        let fOfX = returnFOfX(fOfX_string, allowedCharacters)

        let theAxis = axis(ctx, axisLength, origin, unit)
        let theAxisProps = theAxis.getProperties()
        let theCurve = curve(ctx, (x) => { return 3 * Math.sin(x) }, 2, origin, unit, axisLength)
        let theCurveProps = theCurve.getProperties()
        let mouseCoordsInCartesian = createPoint(0, -10)
        let mouseCoords = createPoint(0, -10)

        renderGraph(theAxis, theCurve)

        document.getElementById('zoom in').addEventListener('click', () => {
            if (unit <= axisLength - zoomRate) {
                unit += zoomRate
            }
            console.log(unit)
            theCurveProps.unitPixels = unit
            theAxisProps.unitPixels = unit
            theCurve.updateStartEnd()
        })

        document.getElementById('zoom out').addEventListener('click', () => {
            if (unit > zoomRate) {
                unit -= zoomRate
            }
            console.log(unit)
            theCurveProps.unitPixels = unit
            theAxisProps.unitPixels = unit
            theCurve.updateStartEnd()
        })

        document.getElementById('submit equation').addEventListener('click', () => {
            document.getElementById('error').innerText = ''
            fOfX_string = document.getElementById('f of x').value
            fOfX = returnFOfX(fOfX_string, allowedCharacters)
            theCurveProps.fOfX = fOfX
        })

        canvas.addEventListener('mousemove', (event) => {
            mouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
            mouseCoordsInCartesian = canvasToCartestianCoords(mouseCoords, origin, unit)
        })

        let frameNumber = 0

        async function main() {
            if (frameNumber <= 5000) {
                window.requestAnimationFrame(main)
            }
            renderGraph(theAxis, theCurve)
            frameNumber++
            console.log('frame #')
        }
        main()
    }
}
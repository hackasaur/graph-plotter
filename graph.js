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

        const checkEquation = (fOfX_string, characters) => {
            for (let i = 0; i < fOfX_string.length; i++) {
                if (characters.includes(fOfX_string[i])) {
                    continue
                }
                else if (fOfX_string[i] === 'M') {
                    if (fOfX_string.slice(i, i + 5) === 'Math.') {
                        let p = i + 5
                        for (p; p < fOfX_string.length; p++) {
                            if (characters.includes(fOfX_string[p])) {
                                i = p + 1
                                break
                            }
                        }
                        continue
                    }
                    else {
                        return false
                    }
                }
                else {
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

            const generateCurvePoints = () => {
                if (properties.unitPixels <= 0) {
                    throw 'unitPixels cannot be <= 0'
                }
                let pointsArray = []
                let dx = 1 / properties.unitPixels
                let startPoint = cartesianToCanvasCoords(createPoint(startX, properties.fOfX(startX)), properties.originInCanvas, properties.unitPixels)
                let canvasX = startPoint[0]
                let canvasY = startPoint[1]
                for (let x = startX; x <= endX - dx; x += dx) {
                    canvasX = canvasX + 1
                    canvasY = properties.originInCanvas[1] - properties.unitPixels * properties.fOfX(x + dx)
                    if (canvasX < canvas.width && canvasY < canvas.height) {
                        pointsArray.push(createPoint(canvasX, canvasY))
                    }
                    else {
                        continue
                    }
                }
                return pointsArray
            }

            let pointsArray = generateCurvePoints()

            return {
                getPointsArray: () => {
                    return pointsArray
                },
                draw: () => {
                    //make lines that trace coordinates of the function in an interval
                    ctx.strokeStyle = "white"
                    ctx.lineWidth = lineWidth
                    ctx.lineJoin = 'round'
                    ctx.beginPath()
                    ctx.moveTo(pointsArray[0][0], pointsArray[0][1])
                    for (let i = 0; i < pointsArray.length; i++) {
                        ctx.lineTo(pointsArray[i][0], pointsArray[i][1])
                    }
                    ctx.stroke()
                },
                getProperties: () => {
                    return properties
                },
                update: () => {
                    startX = Math.floor(-axisLength / properties.unitPixels)
                    endX = Math.ceil(axisLength / properties.unitPixels)
                    pointsArray = generateCurvePoints()
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
                    ctx.strokeStyle = "orange"
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
                    //hatchMarks for x axis
                    numberOfHatchMarks = Math.floor(properties.axisLength / properties.unitPixels)
                    for (let hatchMarkIndex = 1; hatchMarkIndex <= numberOfHatchMarks; hatchMarkIndex++) {
                        let hatchMarkOffset = hatchMarkIndex * properties.unitPixels
                        ctx.moveTo(originX + hatchMarkOffset, originY - properties.hatchMarkLength)
                        ctx.lineTo(originX + hatchMarkOffset, originY + properties.hatchMarkLength)
                        ctx.moveTo(originX - hatchMarkOffset, originY - properties.hatchMarkLength)
                        ctx.lineTo(originX - hatchMarkOffset, originY + properties.hatchMarkLength)
                    }
                    //hatchMarks for y axis
                    for (let hatchMarkIndex = 1; hatchMarkIndex <= numberOfHatchMarks; hatchMarkIndex++) {
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
            graphImage = ctx.getImageData(origin[0] - axisLength, origin[1] - axisLength, 2 * axisLength, 2 * axisLength)
        }

        let origin = createPoint(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2))
        let unit = 40
        let axisLength = Math.floor(canvas.height / 2) - 5
        let allowedCharacters = ['x', '+', '-', '*', '/', '.', '(', ')', ' ']
        let zoomRate = 5
        for (let i = 0; i < 10; i++) {
            allowedCharacters.push(`${i}`)
        }

        let fOfX_string = document.getElementById('f of x').value
        let fOfX = returnFOfX(fOfX_string, allowedCharacters)

        let theAxis = axis(ctx, axisLength, origin, unit)
        let theAxisProps = theAxis.getProperties()
        let theCurve = curve(ctx, fOfX, 2, origin, unit, axisLength)
        let theCurveProps = theCurve.getProperties()
        let mouseCoordsInCartesian = createPoint(0, -10)
        let mouseCoords = createPoint(0, -10)
        let graphImage

        renderGraph(theAxis, theCurve)

        document.getElementById('zoom in').addEventListener('click', () => {
            if (unit <= axisLength - zoomRate) {
                unit += zoomRate
            }
            console.log(unit)
            theCurveProps.unitPixels = unit
            theAxisProps.unitPixels = unit
            theCurve.update()
            renderGraph(theAxis, theCurve)
        })

        document.getElementById('zoom out').addEventListener('click', () => {
            if (unit > zoomRate) {
                unit -= zoomRate
            }
            console.log(unit)
            theCurveProps.unitPixels = unit
            theAxisProps.unitPixels = unit
            theCurve.update()
            renderGraph(theAxis, theCurve)
        })

        document.getElementById('submit equation').addEventListener('click', () => {
            document.getElementById('error').innerText = ''
            fOfX_string = document.getElementById('f of x').value
            fOfX = returnFOfX(fOfX_string, allowedCharacters)
            theCurveProps.fOfX = fOfX
            theCurve.update()
            renderGraph(theAxis, theCurve)
        })

        canvas.addEventListener('mousemove', (event) => {
            mouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
            mouseCoordsInCartesian = canvasToCartestianCoords(mouseCoords, origin, unit)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.putImageData(graphImage, origin[0] - axisLength, origin[1] - axisLength)

            let y = fOfX(mouseCoordsInCartesian[0])
            ctx.fillStyle = 'blue'
            ctx.beginPath()
            ctx.arc(mouseCoords[0], origin[1] - unit * y, 3, 0, 2 * Math.PI)
            ctx.fill()
            printOnCanvas(ctx,
                `x:${Math.round(mouseCoordsInCartesian[0] * 100) / 100}, y:${Math.round((y) * 100) / 100}`,
                createPoint(mouseCoords[0], origin[1] - unit * y),
                { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '20' })
        })


        function animateCurve(curve) {
            let curvePointsArray = curve.getPointsArray()
            console.log(curvePointsArray)
            let index = 0
            let chunk = 5
            ctx.strokeStyle = "white"
            ctx.lineWidth = 2
            ctx.lineJoin = 'round'
            ctx.beginPath()
            ctx.moveTo(curvePointsArray[0][0], curvePointsArray[0][1])

            function loop() {
                for (let i = 1; i <= chunk; i++) {
                    ctx.lineTo(curvePointsArray[index + i][0], curvePointsArray[index + i][1])
                }
                ctx.stroke()
                if (curvePointsArray.length - index > chunk) {
                    index += chunk
                }
                else {
                    index += 1
                    chunk = curvePointsArray.length - index
                }

                if (index <= curvePointsArray.length) {
                    window.requestAnimationFrame(loop)
                }
            }
            loop()
        }
    }
}
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
                        for (p; p <= fOfX_string.length; p++) {
                            if (characters.includes(fOfX_string[p])) {
                                i = p + 1
                                break
                            }
                            return true
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

        const curve = (ctx, fOfX, originInCanvas, unitPixels, axisLength) => {
            if (unitPixels <= 0) {
                throw 'unitPixels cannot be <= 0'
            }

            const properties = { fOfX: fOfX, originInCanvas: originInCanvas, unitPixels: unitPixels }

            let startX = -axisLength / properties.unitPixels
            let endX = axisLength / properties.unitPixels
            let curvePath, pointsArray

            const generateCurvePoints = () => {
                if (properties.unitPixels <= 0) {
                    throw 'unitPixels cannot be <= 0'
                }
                let pointsArray = []
                let dx = 1 / properties.unitPixels
                let startPoint = cartesianToCanvasCoords(createPoint(startX, properties.fOfX(startX)), properties.originInCanvas, properties.unitPixels)
                let canvasX = startPoint[0]
                let canvasY = startPoint[1]
                for (let x = startX; x <= endX; x += dx) {
                    canvasY = properties.originInCanvas[1] - properties.unitPixels * properties.fOfX(x)
                    if (canvasX < canvas.width && canvasY < canvas.height) {
                        pointsArray.push(createPoint(canvasX, canvasY))
                        canvasX += 1
                        continue
                    }
                    else {
                        canvasX += 1
                        continue
                    }
                }
                return pointsArray
            }

            const makePathFromPoints = (pointsArray) => {
                let path = new Path2D
                ctx.beginPath(path)
                path.moveTo(pointsArray[0][0], pointsArray[0][1])
                for (let i = 0; i < pointsArray.length; i++) {
                    path.lineTo(pointsArray[i][0], pointsArray[i][1])
                }
                return path
            }

            pointsArray = generateCurvePoints()
            curvePath = makePathFromPoints(pointsArray)

            return {
                getPointsArray: () => {
                    return pointsArray
                },
                getPath2D: () => {
                    return curvePath
                },
                getProperties: () => {
                    return properties
                },
                update: () => {
                    if (unitPixels <= 0) {
                        throw 'unitPixels cannot be <= 0'
                    }
                    startX = -axisLength / properties.unitPixels
                    endX = axisLength / properties.unitPixels
                    pointsArray = generateCurvePoints()
                    curvePath = makePathFromPoints(pointsArray)
                }
            }
        }

        const axis = (ctx, axisLength, originInCanvas, unitPixels) => {
            let axisPath
            const properties = { axisLength: axisLength, originInCanvas: originInCanvas, unitPixels: unitPixels, hatchMarkLength: 5, hatchMarkGap: 1 }
            if (unitPixels <= 0) {
                throw 'unitPixels cannot be <= 0'
            }

            const makeAxisPath = () => {
                let path = new Path2D()
                //y axis
                ctx.beginPath(path)
                path.moveTo(originInCanvas[0], originInCanvas[1] - properties.axisLength)
                path.lineTo(originInCanvas[0], originInCanvas[1] + properties.axisLength)
                //x axis
                path.moveTo(originInCanvas[0] - properties.axisLength, originInCanvas[1])
                path.lineTo(originInCanvas[0] + properties.axisLength, originInCanvas[1])

                let originX = properties.originInCanvas[0]
                let originY = properties.originInCanvas[1]

                //hatchMarks for x axis
                numberOfHatchMarks = Math.floor(properties.axisLength / properties.unitPixels)
                for (let hatchMarkIndex = 1; hatchMarkIndex <= numberOfHatchMarks; hatchMarkIndex++) {
                    let hatchMarkOffset = hatchMarkIndex * properties.unitPixels
                    path.moveTo(originX + hatchMarkOffset, originY - properties.hatchMarkLength)
                    path.lineTo(originX + hatchMarkOffset, originY + properties.hatchMarkLength)
                    path.moveTo(originX - hatchMarkOffset, originY - properties.hatchMarkLength)
                    path.lineTo(originX - hatchMarkOffset, originY + properties.hatchMarkLength)
                }
                //hatchMarks for y axis
                for (let hatchMarkIndex = 1; hatchMarkIndex <= numberOfHatchMarks; hatchMarkIndex++) {
                    let hatchMarkOffset = hatchMarkIndex * properties.unitPixels
                    path.moveTo(originX + properties.hatchMarkLength, originY + hatchMarkOffset)
                    path.lineTo(originX - properties.hatchMarkLength, originY + hatchMarkOffset)
                    path.moveTo(originX + properties.hatchMarkLength, originY - hatchMarkOffset)
                    path.lineTo(originX - properties.hatchMarkLength, originY - hatchMarkOffset)
                }
                return path
            }

            axisPath = makeAxisPath()

            return {
                returnPath2D: () => {
                    return axisPath
                },
                getProperties: () => {
                    return properties
                },
                update() {
                    if (properties.unitPixels <= 0) {
                        throw 'unitPixels cannot be <= 0'
                    }
                    axisPath = makeAxisPath()
                }
            }
        }

        function renderGraph(axis, curve, mouseCoords) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.strokeStyle = "orange"
            ctx.lineWidth = 1
            ctx.stroke(axis.returnPath2D())
            ctx.strokeStyle = "white"
            ctx.lineWidth = 1
            ctx.lineJoin = 'round'
            ctx.stroke(curve.getPath2D())
            // graphImage = ctx.getImageData(origin[0] - axisLength, origin[1] - axisLength, 2 * axisLength, 2 * axisLength)

            if (mouseCoords !== undefined) {
                let mouseCoordsInCartesian = canvasToCartestianCoords(mouseCoords, origin, unit)
                let y = fOfX(mouseCoordsInCartesian[0])
                ctx.fillStyle = 'blue'
                ctx.beginPath()
                ctx.arc(mouseCoords[0], origin[1] - unit * y, 3, 0, 2 * Math.PI)
                ctx.fill()
                printOnCanvas(ctx,
                    `x:${Math.round(mouseCoordsInCartesian[0] * 100) / 100}, y:${Math.round((y) * 100) / 100}`,
                    createPoint(mouseCoords[0], origin[1] - unit * y),
                    { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '20' })
            }
        }

        let origin = createPoint(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2))
        let unit = 40
        let axisLength = Math.floor(canvas.height / 2) - 20
        let allowedCharacters = ['x', '+', '-', '*', '/', '.', '(', ')', ' ']
        let zoomRate = 5
        for (let i = 0; i < 10; i++) {
            allowedCharacters.push(`${i}`)
        }

        let fOfX_string = document.getElementById('f of x').value
        let fOfX = returnFOfX(fOfX_string, allowedCharacters)

        let theAxis = axis(ctx, axisLength, origin, unit)
        let theAxisProps = theAxis.getProperties()
        let theCurve = curve(ctx, fOfX, origin, unit, axisLength)
        let theCurveProps = theCurve.getProperties()
        let mouseCoords, mouseMoved = false
        let graphImage

        document.getElementById('zoom in').addEventListener('click', () => {
            if (unit <= axisLength - zoomRate) {
                unit += zoomRate
            }
            console.log(unit)
            theCurveProps.unitPixels = unit
            theAxisProps.unitPixels = unit
            theCurve.update()
            theAxis.update()
            renderGraph(theAxis, theCurve)
        })

        document.getElementById('zoom out').addEventListener('click', () => {
            if (unit > zoomRate) {
                unit -= zoomRate
            }
            console.log(unit)
            theCurveProps.unitPixels = unit
            theAxisProps.unitPixels = unit
            theAxis.update()
            theCurve.update()
        })

        document.getElementById('submit equation').addEventListener('click', () => {
            document.getElementById('error').innerText = ''
            fOfX_string = document.getElementById('f of x').value
            fOfX = returnFOfX(fOfX_string, allowedCharacters)
            theCurveProps.fOfX = fOfX
            theCurve.update()
        })

        canvas.addEventListener('mousemove', (event) => {
            mouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
            mouseMoved = true
        })


        function main() {
            requestAnimationFrame(main)
            renderGraph(theAxis, theCurve, mouseCoords)
            mouseMoved = false
        }
        main()


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
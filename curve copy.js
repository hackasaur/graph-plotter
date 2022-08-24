let canvas = document.getElementById("myCanvas");

function draw() {
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d')
        // ctx.canvas.width = Math.floor(window.innerWidth / 2)
        // ctx.canvas.height = Math.floor(window.innerHeight / 2)
        ctx.canvas.width = 600
        ctx.canvas.height = 600

        const isPointInsideRect = (coords, x1, y1, x2, y2) => {
            if (coords[0] > x1 && coords[0] < x2) {
                if (coords[1] > y1 && coords[1] < y2)
                    return true
            }
            return false
        }

        const createPoint = (x, y) => {
            let point = [x, y]
            return point
        }

        const setCanvasFont = (ctx, font) => {
            ctx.fillStyle = `${font.fontColor}`
            ctx.font = `${font.fontSize}px ${font.fontStyle}`
        }

        const printOnCanvas = (ctx, text, coords, font) => {
            setCanvasFont(ctx, font)
            ctx.fillText(text, coords[0], coords[1])
        }

        const checkEquation = (fOfX_string, characters) => {
            // check that the expression for fOfX doesn't contain characters other than +, -, *, /, (,), 0-9 and x but exception is Math.some_function()
            //TODO: add character list inside the function
            for (let i = 0; i < fOfX_string.length; i++) {
                if (characters.includes(fOfX_string[i])) {
                    continue
                }

                //TODO: write a better parser for Math.some_function()
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

        export const returnFOfX = (fOfX_string, allowedCharacters) => {
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

        const curve = (ctx, fOfX, originInCanvas, scale, axisLength) => {
            if (scale <= 0) {
                throw 'unitPixels cannot be <= 0'
            }

            const properties = { fOfX: fOfX, originInCanvas: originInCanvas, scale: scale, axisLength: axisLength }

            let startX = -properties.axisLength / properties.scale
            let endX = properties.axisLength / properties.scale
            let curvePath, pointsArray

            const generateCurvePoints = () => {
                if (properties.scale <= 0) {
                    throw 'scale cannot be <= 0'
                }
                let pointsArray = []
                let dx = 1 / properties.scale
                let startPoint = cartesianToCanvasCoords(createPoint(startX, properties.fOfX(startX)), properties.originInCanvas, properties.scale)
                let canvasX = startPoint[0]
                for (let x = startX; x <= endX; x += dx) {
                    canvasY = properties.originInCanvas[1] - properties.scale * properties.fOfX(x)
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
                    if (scale <= 0) {
                        throw 'scale cannot be <= 0'
                    }
                    startX = -properties.axisLength / properties.scale
                    endX = properties.axisLength / properties.scale
                    pointsArray = generateCurvePoints()
                    curvePath = makePathFromPoints(pointsArray)
                }
            }
        }

        const axis = (ctx, axisLength, originInCanvas, scale) => {
            let axisPath
            const properties = { axisLength: axisLength, originInCanvas: originInCanvas, scale: scale, hatchMarkLength: 5, hatchMarkGap: 1 }
            if (scale <= 0) {
                throw 'scale cannot be <= 0'
            }

            const makeAxisPath = () => {
                let path = new Path2D()
                //y axis
                ctx.beginPath(path)
                path.moveTo(properties.originInCanvas[0], properties.originInCanvas[1] - properties.axisLength)
                path.lineTo(properties.originInCanvas[0], properties.originInCanvas[1] + properties.axisLength)
                //x axis
                path.moveTo(properties.originInCanvas[0] - properties.axisLength, properties.originInCanvas[1])
                path.lineTo(properties.originInCanvas[0] + properties.axisLength, properties.originInCanvas[1])

                let originX = properties.originInCanvas[0]
                let originY = properties.originInCanvas[1]

                //hatchMarks for x axis
                numberOfHatchMarks = Math.floor(properties.axisLength / properties.scale)
                for (let hatchMarkIndex = 1; hatchMarkIndex <= numberOfHatchMarks; hatchMarkIndex++) {
                    let hatchMarkOffset = hatchMarkIndex * properties.scale
                    path.moveTo(originX + hatchMarkOffset, originY - properties.hatchMarkLength)
                    path.lineTo(originX + hatchMarkOffset, originY + properties.hatchMarkLength)
                    path.moveTo(originX - hatchMarkOffset, originY - properties.hatchMarkLength)
                    path.lineTo(originX - hatchMarkOffset, originY + properties.hatchMarkLength)
                }
                //hatchMarks for y axis
                for (let hatchMarkIndex = 1; hatchMarkIndex <= numberOfHatchMarks; hatchMarkIndex++) {
                    let hatchMarkOffset = hatchMarkIndex * properties.scale
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
                    if (properties.scale <= 0) {
                        throw 'scale cannot be <= 0'
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

            if (mouseCoords !== undefined) {
                let mouseCoordsInCartesian = canvasToCartestianCoords(mouseCoords, origin, scale)
                let y = fOfX(mouseCoordsInCartesian[0])
                ctx.fillStyle = 'cyan'
                ctx.beginPath()
                ctx.arc(mouseCoords[0], origin[1] - scale * y, 3, 0, 2 * Math.PI)
                ctx.fill()
                let padding = 10
                printOnCanvas(ctx,
                    `x:${mouseCoordsInCartesian[0].toFixed(2)}, y:${y.toFixed(2)}`,
                    createPoint(mouseCoords[0] + padding, origin[1] - scale * y),
                    { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '12' })
            }
        }

        let origin = createPoint(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2))
        let scale = 40
        let axisLength = Math.floor(canvas.height / 2) - 20
        let allowedCharacters = ['x', '+', '-', '*', '/', '.', '(', ')', ' ']
        let zoomRate = 5

        for (let i = 0; i < 10; i++) {
            allowedCharacters.push(`${i}`)
        }

        let fOfX_string = document.getElementById('f of x').value
        let fOfX = returnFOfX(fOfX_string, allowedCharacters)

        let theAxis = axis(ctx, axisLength, origin, scale)
        let theAxisProps = theAxis.getProperties()
        let theCurve = curve(ctx, fOfX, origin, scale, axisLength)
        let theCurveProps = theCurve.getProperties()
        let mouseCoords
        let mouseMoved = false
        let mouseInside = false

        let topLeftPoint = createPoint(origin[0] - axisLength, origin[1] - axisLength)
        let bottomRightPoint = createPoint(origin[0] + axisLength, origin[1] + axisLength)

        document.getElementById('zoom in').addEventListener('click', () => {
            if (scale <= axisLength - zoomRate) {
                scale += zoomRate
            }
            console.log(scale)
            theCurveProps.scale = scale
            theAxisProps.scale = scale
            theCurve.update()
            theAxis.update()
            renderGraph(theAxis, theCurve)
        })

        document.getElementById('zoom out').addEventListener('click', () => {
            if (scale > zoomRate) {
                scale -= zoomRate
            }
            console.log(scale)
            theCurveProps.scale = scale
            theAxisProps.scale = scale
            theCurve.update()
            theAxis.update()
            renderGraph(theAxis, theCurve)
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
            if ((mouseCoords[0] > topLeftPoint[0] && mouseCoords[0] < bottomRightPoint[0]) &&
                (mouseCoords[1] > topLeftPoint[1] && mouseCoords[1] < bottomRightPoint[1])) {
                mouseMoved = true
                mouseInside = true
            }
        })

        function main() {
            requestAnimationFrame(main)
            if (mouseMoved === true && mouseInside === true) {
                renderGraph(theAxis, theCurve, mouseCoords)
                mouseMoved = false
                mouseInside = false
            }
        }
        main()
    }
}



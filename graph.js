let canvas = document.getElementById("myCanvas");
function draw() {
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = Math.floor(window.innerWidth / 2)
        ctx.canvas.height = Math.floor(window.innerHeight / 1.5)
        // ctx.canvas.width = Math.floor(window.innerWidth / 2);
        // ctx.canvas.height = Math.floor(window.innerHeight / 1.5)

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

        const curve = (ctx, fOfX, startX, endX, lineWidth, originInCanvas, unitPixels) => {
            const properties = { fOfX: fOfX, startX: startX, endX: endX, lineWidth: lineWidth, originInCanvas: originInCanvas, unitPixels: unitPixels }

            return {
                draw: () => {
                    //make lines that trace coordinates of the function in an interval
                    let dx = 1 / properties.unitPixels
                    // console.log(dx)
                    ctx.strokeStyle = "white"
                    ctx.lineWidth = lineWidth
                    ctx.lineJoin = 'round'
                    let startPoint = cartesianToCanvasCoords(createPoint(startX, properties.fOfX(startX)), properties.originInCanvas, properties.unitPixels)
                    // console.log('startPoint:', startPoint)
                    ctx.beginPath()
                    let canvasX = startPoint[0]
                    let canvasY = startPoint[1]
                    ctx.moveTo(canvasX, canvasY)
                    for (let x = startX; x <= endX - dx; x += dx) {
                        canvasX = canvasX + 1
                        canvasY = properties.originInCanvas[1] - properties.unitPixels * properties.fOfX(x + dx)
                        ctx.lineTo(canvasX, canvasY)
                    }
                    ctx.stroke()
                },
                getProperties: () => {
                    return properties
                }

            }
        }

        const axis = (ctx, axisLength, originInCanvas, unitPixels) => {
            const properties = { axisLength: axisLength, originInCanvas: originInCanvas, unitPixels: unitPixels }
            let topPoint = cartesianToCanvasCoords(createPoint(0, properties.axisLength), properties.originInCanvas, properties.unitPixels)
            let bottomPoint = cartesianToCanvasCoords(createPoint(0, -properties.axisLength), properties.originInCanvas, properties.unitPixels)
            let leftPoint = cartesianToCanvasCoords(createPoint(-properties.axisLength, 0), properties.originInCanvas, properties.unitPixels)
            let rightPoint = cartesianToCanvasCoords(createPoint(properties.axisLength, 0), properties.originInCanvas, properties.unitPixels)

            console.log(topPoint, bottomPoint, leftPoint, rightPoint)
            return {
                draw: () => {
                    ctx.strokeStyle = "purple"
                    ctx.lineWidth = 1
                    //y axis
                    ctx.beginPath()
                    ctx.moveTo(topPoint[0], topPoint[1])
                    ctx.lineTo(bottomPoint[0], bottomPoint[1])
                    ctx.stroke();
                    //x axis
                    ctx.beginPath()
                    ctx.moveTo(leftPoint[0], leftPoint[1])
                    ctx.lineTo(rightPoint[0], rightPoint[1])
                    ctx.stroke()
                },
                getProperties: () => {
                    return properties
                },
                updateAxis: () => {
                    topPoint = cartesianToCanvasCoords(createPoint(0, properties.axisLength), properties.originInCanvas, properties.unitPixels)
                    bottomPoint = cartesianToCanvasCoords(createPoint(0, -properties.axisLength), properties.originInCanvas, properties.unitPixels)
                    leftPoint = cartesianToCanvasCoords(createPoint(-properties.axisLength, 0), properties.originInCanvas, properties.unitPixels)
                    rightPoint = cartesianToCanvasCoords(createPoint(properties.axisLength, 0), properties.originInCanvas, properties.unitPixels)
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
        let allowedCharacters = ['x', '+', '-', '*', '/']
        for (let i = 0; i < 10; i++) {
            allowedCharacters.push(`${i}`)
        }

        let fOfX_string = document.getElementById('f of x').value
        let fOfX = returnFOfX(fOfX_string, allowedCharacters)

        let theAxis = axis(ctx, 20, origin, unit)
        theAxisProps = theAxis.getProperties()
        let theCurve = curve(ctx, fOfX, -3, 3, 2, origin, unit)
        theCurveProps = theCurve.getProperties()
        let mouseCoordsInCartesian = createPoint(0, -10)
        let mouseCoords = createPoint(0, -10)

        renderGraph(theAxis, theCurve)

        document.getElementById('zoom in').addEventListener('click', () => {
            unit += 5
            theCurveProps.unitPixels = unit
            theAxisProps.unitPixels = unit
        })


        document.getElementById('zoom out').addEventListener('click', () => {
            unit -= 5
            theCurveProps.unitPixels = unit
            theAxisProps.unitPixels = unit
        })

        document.getElementById('submit equation').addEventListener('click', () => {
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
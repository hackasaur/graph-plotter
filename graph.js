let canvas = document.getElementById("myCanvas");
if (canvas.getContext) {
    const ctx = canvas.getContext('2d')
    ctx.canvas.width = Math.floor(window.innerWidth / 2);
    ctx.canvas.height = Math.floor(window.innerHeight / 1.5)

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

    let origin = createPoint(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2))
    let unit = 40

    const cartesianToCanvasCoords = (coords, originInCanvas, unitPixels) => {
        return createPoint(originInCanvas[0] + unitPixels * coords[0], originInCanvas[1] - unitPixels * coords[1])
    }

    const canvasToCartestianCoords = (coords, originInCanvas, unitPixels) => {
        return createPoint((coords[0] - originInCanvas[0]) / unitPixels, (originInCanvas[1] - coords[1]) / unitPixels)
    }

    function f(x) {
        return x ** 2;
    }

    const curve = (ctx, startX, endX, lineWidth, originInCanvas, unitPixels) => {
        return {
            draw: () => {
                //make lines that trace coordinates of the function in an interval
                let dx = 1 / unitPixels
                // console.log(dx)
                ctx.strokeStyle = "white"
                ctx.lineWidth = lineWidth
                ctx.lineJoin = 'round'
                let startPoint = cartesianToCanvasCoords(createPoint(startX, f(startX)), originInCanvas, unitPixels)
                // console.log('startPoint:', startPoint)
                ctx.beginPath()
                ctx.moveTo(startPoint[0], startPoint[1])
                for (let x = startX; x <= endX; x += dx) {
                    let nextPoint = createPoint(startPoint[0] + 1, originInCanvas[1] - unitPixels * f(x + dx))
                    // console.log(x, f(x + dx))
                    ctx.lineTo(nextPoint[0], nextPoint[1])
                    startPoint = nextPoint
                }
                ctx.stroke()
            }
        }
    }

    const axis = (ctx, axisLength, originInCanvas, unit) => {
        topPoint = cartesianToCanvasCoords(createPoint(0, axisLength), originInCanvas, unit)
        bottomPoint = cartesianToCanvasCoords(createPoint(0, -axisLength), originInCanvas, unit)
        leftPoint = cartesianToCanvasCoords(createPoint(-axisLength, 0), originInCanvas, unit)
        rightPoint = cartesianToCanvasCoords(createPoint(axisLength, 0), originInCanvas, unit)
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
            }
        }
    }

    let theAxis = axis(ctx, 20, origin, unit)
    let theCurve = curve(ctx, -3, 3, 2, origin, unit)
    renderGraph(theAxis, theCurve)



    canvas.addEventListener('mousemove', (event) => {
        renderGraph(theAxis, theCurve)
        let mouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
        let mouseCoordsInCartesian = canvasToCartestianCoords(mouseCoords, origin, unit)
 
        printOnCanvas(ctx,
            `x:${mouseCoordsInCartesian[0]},y:${mouseCoordsInCartesian[1]}`,
            mouseCoords,
            { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '20' })
    })

    function renderGraph(axis, curve) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        axis.draw()
        curve.draw()
    }

    let frameNumber = 0

    async function main() {
        if (frameNumber <= 5000) {
            window.requestAnimationFrame(main)
        }

        frameNumber++
        console.log('frame #')
    }
    main()
}
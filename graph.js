let canvas = document.getElementById("myCanvas");
if (canvas.getContext) {
    const ctx = canvas.getContext('2d')
    ctx.canvas.width = window.innerWidth / 2;
    ctx.canvas.height = window.innerHeight / 1.3;

    const createPoint = (x, y) => {
        let point = new Int8Array(2)
        point = [x, y]
        return point
    }

    let origin = createPoint(canvas.width / 2, canvas.height / 2)
    let unit = 10

    const cartesianToCanvasCoordinates = (coords, originInCanvas, unitPixels) => {
        return createPoint(originInCanvas[0] + unitPixels * coords[0], originInCanvas[1] - unitPixels * coords[1])
    }

    function f(x) {
        return x * x;
    }

    const curve = (ctx, startX, endX, lineWidth, originInCanvas, unitPixels) => {
        return {
            draw: () => {
                //make lines that trace coordinates of the function in an interval
                let dx = 1 / unitPixels
                console.log(dx)
                ctx.strokeStyle = "white"
                ctx.lineWidth = lineWidth
                ctx.lineJoin = 'round'
                let startPoint = cartesianToCanvasCoordinates(createPoint(startX, f(startX)), originInCanvas, unitPixels)
                console.log('startPoint:', startPoint)
                ctx.beginPath()
                ctx.moveTo(startPoint[0], startPoint[1])
                for (let x = startX; x <= endX; x += dx) {
                    console.log(x)
                    // let nextPoint = cartesianToCanvasCoordinates(createPoint(x + dx, f(x + dx)), originInCanvas, unit)
                    let nextPoint = createPoint(startPoint[0] + 1, originInCanvas[1] - unitPixels * f(x + dx))
                    console.log('nextPoint:', nextPoint)
                    ctx.lineTo(nextPoint[0], nextPoint[1])
                    startPoint = nextPoint
                }
                ctx.stroke()
            }
        }
    }

    const axis = (ctx, axisLength, originInCanvas, unit) => {
        topPoint = cartesianToCanvasCoordinates(createPoint(0, axisLength), originInCanvas, unit)
        bottomPoint = cartesianToCanvasCoordinates(createPoint(0, -axisLength), originInCanvas, unit)
        leftPoint = cartesianToCanvasCoordinates(createPoint(-axisLength, 0), originInCanvas, unit)
        rightPoint = cartesianToCanvasCoordinates(createPoint(axisLength, 0), originInCanvas, unit)
        return {
            draw: () => {
                ctx.strokeStyle = "#000000"
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
    let theCurve = curve(ctx, -5, 5, 2, origin, unit)
    theAxis.draw()
    theCurve.draw()

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
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

const checkEquation = (fOfX_string) => {
    // check that the expression for fOfX doesn't contain characters other than +, -, *, /, (,), 0-9 and x but exception is Math.some_function() or Math.constant

    let allowedCharacters = ['x', '+', '-', '*', '/', '.', '(', ')', ' ']
    for (let i = 0; i < 10; i++) {
        allowedCharacters.push(`${i}`)
    }
    for (let i = 0; i < fOfX_string.length; i++) {
        if (allowedCharacters.includes(fOfX_string[i])) {
            continue
        }

        //TODO: write a better parser for Math.some_function()
        else if (fOfX_string[i] === 'M') {
            if (fOfX_string.slice(i, i + 5) === 'Math.') {
                let p = i + 5
                for (p; p <= fOfX_string.length; p++) {
                    if (allowedCharacters.includes(fOfX_string[p])) {
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

export const returnFOfX = (fOfX_string) => {
    if (checkEquation(fOfX_string)) {
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

export const curve = (ctx, fOfX, originInCanvas, scale, axisLength) => {
    if (scale <= 0) {
        throw 'unitPixels cannot be <= 0'
    }

    const properties = { fOfX: fOfX, originInCanvas: originInCanvas, scale: scale, axisLength: axisLength }

    let startX = -properties.axisLength / properties.scale //left most on the x axis in cartesian coords
    let endX = properties.axisLength / properties.scale //right most on the x axis in cartesian coords
    let curvePath, pointsArray

    const generateCurvePoints = () => {
        //returns an array of all the points in the curve, converted to canvas corrdinates
        if (properties.scale <= 0) {
            throw 'scale cannot be <= 0'
        }
        let pointsArray = []
        let dx = 1 / properties.scale //length that equals 1 pixel on the screen
        let startPoint = cartesianToCanvasCoords(createPoint(startX, properties.fOfX(startX)), properties.originInCanvas, properties.scale)
        let canvasX = startPoint[0]
        let canvasY = startPoint[1]

        // loop to get f(x) for each pixel moving from left to right
        for (let x = startX; x <= endX; x += dx) {
            canvasY = properties.originInCanvas[1] - properties.scale * properties.fOfX(x)
            if (canvasY > properties.originInCanvas[1] - properties.axisLength && canvasY < properties.originInCanvas[1] + properties.axisLength) {
                pointsArray.push(createPoint(canvasX, canvasY))
            }
            else {
                if (canvasY > properties.originInCanvas[1] + properties.axisLength) {
                    pointsArray.push(createPoint(canvasX, properties.originInCanvas[1] + properties.axisLength))
                }
                else if (canvasY < properties.originInCanvas[1] - properties.axisLength) {
                    pointsArray.push(createPoint(canvasX, properties.originInCanvas[1] - properties.axisLength))
                }
            }

            canvasX += 1
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
        properties,
        getPointsArray: () => {
            return pointsArray
        },
        getPath2D: () => {
            return curvePath
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

export const axis = (ctx, axisLength, originInCanvas, scale) => {
    let axisPath
    const properties = { axisLength: axisLength, originInCanvas: originInCanvas, scale: scale, hatchMarkLength: 4 }
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
        let numberOfHatchMarks = Math.floor(properties.axisLength / properties.scale)
        for (let hatchMarkIndex = 0; hatchMarkIndex < numberOfHatchMarks; hatchMarkIndex++) {
            let hatchMarkOffset = hatchMarkIndex * properties.scale
            path.moveTo(originX + hatchMarkOffset, originY - properties.hatchMarkLength)
            path.lineTo(originX + hatchMarkOffset, originY + properties.hatchMarkLength)
            path.moveTo(originX - hatchMarkOffset, originY - properties.hatchMarkLength)
            path.lineTo(originX - hatchMarkOffset, originY + properties.hatchMarkLength)
        }
        //hatchMarks for y axis
        for (let hatchMarkIndex = 0; hatchMarkIndex < numberOfHatchMarks; hatchMarkIndex++) {
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
        properties,
        returnPath2D: () => {
            return axisPath
        },
        update() {
            if (properties.scale <= 0) {
                throw 'scale cannot be <= 0'
            }
            axisPath = makeAxisPath()
        }
    }
}

export function renderGraph(ctx, axis, curve, mouseCoords) {
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.strokeStyle = "orange"
    ctx.lineWidth = 1
    ctx.stroke(axis.returnPath2D())
    ctx.strokeStyle = "white"
    ctx.lineWidth = 1
    ctx.lineJoin = 'round'
    ctx.stroke(curve.getPath2D())

    if (mouseCoords !== undefined) {
        let mouseCoordsInCartesian = canvasToCartestianCoords(mouseCoords, axis.properties.originInCanvas, axis.properties.scale)
        let y = curve.properties.fOfX(mouseCoordsInCartesian[0])
        let canvasY = axis.properties.originInCanvas[1] - axis.properties.scale * y
        if (canvasY > axis.properties.originInCanvas[1] - axis.properties.axisLength 
            && canvasY < axis.properties.originInCanvas[1] + axis.properties.axisLength) {
            ctx.fillStyle = 'cyan'
            ctx.beginPath()
            ctx.arc(mouseCoords[0], axis.properties.originInCanvas[1] - axis.properties.scale * y, 3, 0, 2 * Math.PI)
            ctx.fill()
            let padding = 10
            printOnCanvas(
                ctx,
                `x:${mouseCoordsInCartesian[0].toFixed(2)}, y:${y.toFixed(2)}`,
                createPoint(mouseCoords[0] + padding, canvasY),
                { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '12' }
            )
        }
    }
}
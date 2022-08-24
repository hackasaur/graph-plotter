import * as plotter from './curve.js'

let canvas = document.getElementById("myCanvas");

function draw() {
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d')
        // ctx.canvas.width = Math.floor(window.innerWidth / 2)
        // ctx.canvas.height = Math.floor(window.innerHeight / 2)
        ctx.canvas.width = 600
        ctx.canvas.height = 600

        const createPoint = (x, y) => {
            let point = [x, y]
            return point
        }

        let origin = createPoint(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2))
        let scale = 40
        let axisLength = Math.floor(canvas.height / 2) - 20
        let zoomRate = 5
        let eqn_no = 0

        let eqn_html = `<span style="font-family: 'DejaVu Serif','serif';">f(x) =</span><input type="text" id="f of x(0)" value='Math.sin(x)'></input>`

        document.getElementById("equation fields").innerHTML = eqn_html

        let fOfX_string = document.getElementById('f of x(0)').value
        let fOfX = plotter.returnFOfX(fOfX_string)

        let fOfXStrings = [fOfX_string]

        let theAxis = plotter.axis(ctx, axisLength, origin, scale)
        let curve_0 = plotter.curve(ctx, fOfX, origin, scale, axisLength)
        let curves = [curve_0]

        let mouseCoords
        let mouseMoved = false
        let mouseInside = false

        let topLeftPoint = createPoint(origin[0] - axisLength, origin[1] - axisLength)
        let bottomRightPoint = createPoint(origin[0] + axisLength, origin[1] + axisLength)



        plotter.renderGraph(ctx, theAxis, curve_0, mouseCoords)

        document.getElementById('zoom in').addEventListener('click', () => {
            if (scale <= axisLength - zoomRate) {
                scale += zoomRate
                theAxis.properties.scale = scale
                theAxis.update()
                console.log(scale)


                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                for (let curve of curves) {
                    curve.properties.scale = scale
                    curve.update()
                    plotter.renderGraph(ctx, theAxis, curve)
                }
            }
        })

        document.getElementById('zoom out').addEventListener('click', () => {
            if (scale > zoomRate) {
                scale -= zoomRate
                console.log(scale)
                theAxis.properties.scale = scale
                theAxis.update()

                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                for (let curve of curves) {
                    curve.properties.scale = scale
                    curve.update()
                    plotter.renderGraph(ctx, theAxis, curve)
                }
            }
        })

        document.getElementById('submit equation').addEventListener('click', () => {
            document.getElementById('error').innerText = ''
            curves = []
            fOfXStrings.push(document.getElementById(`f of x(${eqn_no})`).value)
            for (let i = 0; i < eqn_no + 1; i++) {
                fOfX_string = document.getElementById(`f of x(${i})`).value
                fOfX = plotter.returnFOfX(fOfX_string)
                let curve = plotter.curve(ctx, fOfX, origin, scale, axisLength)
                plotter.renderGraph(ctx, theAxis, curve)
                curves.push(curve)
            }
        })

        document.getElementById('add equation').addEventListener('click', () => {
            eqn_no++
            document.getElementById("equation fields").innerHTML = ""
            for (let i = 0; i < eqn_no; i++) {
                eqn_html = `<span style="font-family: 'DejaVu Serif','serif';">f(x) = </span> <input type='text' id='f of x(${i})' value='${fOfXStrings[i]}'>`
                document.getElementById("equation fields").innerHTML += eqn_html
            }

            document.getElementById("equation fields").innerHTML += `<span style="font-family: 'DejaVu Serif','serif';">f(x) = </span> <input type='text' id='f of x(${eqn_no})' value="">`
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
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                for (let curve of curves) {
                    plotter.renderGraph(ctx, theAxis, curve, mouseCoords)
                }
                mouseMoved = false
                mouseInside = false
            }
        }
        main()
    }
}

window.addEventListener('load', draw)
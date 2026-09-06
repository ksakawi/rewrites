import { FromFn } from "./2d-object/from-fn"
import { Grid } from "./2d-object/grid"
import { Canvas2 } from "./2d/canvas"
import { apply2x, apply2y } from "./2d/tform"

const cv = new Canvas2({ sx: 20, sy: 20, tx: 0, ty: 0 })

document.body.appendChild(cv.el)

function f(t: number): number {
    return 4 * Math.sin(0.25 * t)
}

cv.push(new Grid())

cv.push(
    new FromFn((cv) => {
        cv.ctx.fillStyle = "black"
        cv.ctx.textAlign = "left"
        cv.ctx.textBaseline = "middle"

        const curve = new Path2D()
        const dots = new Path2D()
        let integral = 0
        let lastX = f(apply2y(cv.tlo, 0))

        for (let oy = apply2y(cv.tlo, 0); oy >= 0; oy--) {
            const t = apply2y(cv.tol, oy)
            const x = f(t)
            const ox = apply2x(cv.tlo, x)
            curve.lineTo(ox, oy)

            const integralStep =
                -cv.tol.sy
                * Math.sqrt(Math.max(0, 1 - ((x - lastX) / cv.tol.sy) ** 2))
            lastX = x

            const nextInt = Math.floor(integral + integralStep)
            if (nextInt > Math.floor(integral)) {
                cv.ctx.fillText("" + nextInt, ox + 6, oy)
                dots.moveTo(ox + 3, oy)
                dots.ellipse(ox, oy, 3, 3, 0, 0, 2 * Math.PI)
            }

            integral += integralStep
        }

        cv.ctx.lineWidth = 1.5
        cv.ctx.strokeStyle = "red"
        cv.ctx.stroke(curve)

        cv.ctx.lineWidth = 1.5
        cv.ctx.strokeStyle = "red"
        cv.ctx.fillStyle = "white"
        cv.ctx.fill(dots)
        cv.ctx.stroke(dots)
    }),
)

import type { Canvas2 } from "../2d/canvas"
import { Object2 } from "../2d/object"
import { apply2x, apply2y } from "../2d/tform"

export class Relativistic extends Object2 {
    constructor(
        readonly stroke: string,
        readonly f: (t: number) => number,
    ) {
        super()
    }

    draw(cv: Canvas2): void {
        cv.ctx.fillStyle = this.stroke
        cv.ctx.font = "16px Symbola"
        cv.ctx.textAlign = "left"
        cv.ctx.textBaseline = "middle"

        const curve = new Path2D()
        const dots = new Path2D()
        let integral = 0
        const oymin = apply2y(cv.tlo, 0)
        let lastX = this.f(oymin)

        for (let oy = oymin; oy >= 0; oy--) {
            const t = apply2y(cv.tol, oy)
            const x = this.f(t)
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
        cv.ctx.strokeStyle = this.stroke
        cv.ctx.stroke(curve)

        cv.ctx.fillStyle = "white"
        cv.ctx.fill(dots)
        cv.ctx.stroke(dots)
    }
}

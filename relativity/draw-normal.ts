import { spacing } from "../cv/2/2d-object/grid"
import type { Canvas2 } from "../cv/2/2d/canvas"
import { apply2x, apply2y } from "../cv/2/2d/tform"
import type { Config } from "./config"
import type { Path } from "./path"

export function drawNormal(cv: Canvas2, path: Path, config: Config) {
    const trace = new Path2D()
    const holes = new Path2D()

    cv.ctx.lineWidth = 1.5
    cv.ctx.strokeStyle = cv.ctx.fillStyle = config.color
    cv.ctx.textAlign = config.textAlign
    cv.ctx.textBaseline = "middle"
    cv.ctx.font = "16px Symbola"

    let lastClock = Infinity
    const [space] = spacing(-cv.pixelHeight)
    const digits = Math.max(0, -Math.floor(Math.log10(space)))
    for (let oy = 0; oy <= cv.height; oy++) {
        const t = apply2y(cv.tol, oy)
        const x = path.x(t)
        const ox = apply2x(cv.tlo, x)
        trace.lineTo(ox, oy)

        const myClock = path.clock(t)
        if (Math.floor(lastClock / space) !== Math.floor(myClock / space)) {
            holes.moveTo(ox + 3, oy)
            holes.ellipse(ox, oy, 3, 3, 0, 0, 2 * Math.PI)
            cv.ctx.fillText(
                "" + (Math.round(myClock / space) * space).toFixed(digits),
                ox + config.textOffset,
                oy,
            )
        }
        lastClock = myClock
    }

    cv.ctx.stroke(trace)
    cv.ctx.fillStyle = "white"
    cv.ctx.fill(holes)
    cv.ctx.stroke(holes)
}

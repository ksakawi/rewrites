import type { Canvas2 } from "../cv/2/2d/canvas"
import { apply2x, apply2y } from "../cv/2/2d/tform"
import type { Path } from "./path"

export function drawPath(cv: Canvas2, path: Path, color: string, textAlign: "left" | "right") {
    const textOffset = textAlign === "left" ? 8 : -8

    const trace = new Path2D()
    const holes = new Path2D()

    cv.ctx.lineWidth = 1.5
    cv.ctx.strokeStyle = cv.ctx.fillStyle = color
    cv.ctx.textAlign = textAlign
    cv.ctx.textBaseline = "middle"
    cv.ctx.font = "16px Symbola"

    for (let oy = 0; oy <= cv.height; oy++) {
        const t = apply2y(cv.tol, oy)
        const x = path.x(t)
        const ox = apply2x(cv.tlo, x)
        trace.lineTo(ox, oy)

        if (oy % 20 === 0) {
            holes.moveTo(ox + 3, oy)
            holes.ellipse(ox, oy, 3, 3, 0, 0, 2 * Math.PI)
            cv.ctx.fillText(
                "" + path.clock(t).toFixed(2) + " — " + path.fromClock(path.clock(t)).toFixed(2),
                ox + textOffset,
                oy,
            )
        }
    }

    cv.ctx.stroke(trace)
    cv.ctx.fillStyle = "white"
    cv.ctx.fill(holes)
    cv.ctx.stroke(holes)
}

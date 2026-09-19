import { spacing } from "../cv/2/2d-object/grid"
import type { Canvas2 } from "../cv/2/2d/canvas"
import { apply2x, apply2y } from "../cv/2/2d/tform"
import type { Path } from "./path"

export function drawViewedFrom(cv: Canvas2, base: Path, target: Path, color: string) {
    const { ctx, tlo, tol, height } = cv

    const trace = new Path2D()
    const holes = new Path2D()

    ctx.fillStyle = color
    ctx.textAlign = "right"
    ctx.font = "16px Symbola"

    let trackedValue: number | undefined
    const [interval] = spacing(-cv.pixelHeight)
    const digits = Math.max(0, -Math.log10(interval))
    for (let oy = 0; oy <= height; oy++) {
        const clockBase = apply2y(tol, oy)
        const t = base.fromClock(clockBase)
        const xBase = base.x(t)

        const tSourceLight = target.whenDidLightDepartTo(t, xBase)
        const timeTaken = base.clock(t) - base.clock(tSourceLight)
        const v = base.v(t)

        const oxv = apply2x(tlo, -base.x(t))
        const oyv = apply2y(tlo, t)
        trace.lineTo(oxv, oyv)

        const myTrackedValue = base.clock(t)
        if (trackedValue === undefined) {
            trackedValue = myTrackedValue
            continue
        }
        if (Math.floor(myTrackedValue / interval) !== Math.floor(trackedValue / interval)) {
            holes.moveTo(oxv + 3, oyv)
            holes.ellipse(oxv, oyv, 3, 3, 0, 0, 2 * Math.PI)
            ctx.fillText("" + base.clock(t).toFixed(digits), oxv - 8, oyv)
        }
        trackedValue = myTrackedValue
    }

    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.stroke(trace)
    ctx.fillStyle = "white"
    ctx.fill(holes)
    ctx.stroke(holes)
}

// pink at 7.000 (x=9.04) sees yellow at 3.300 (x=4.33)
// distance is about 4.71; 4.71*sqrt(1-.5*.5) = 4.08

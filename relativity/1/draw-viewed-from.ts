import { spacing } from "../../cv/2/2d-object/grid"
import type { Canvas2 } from "../../cv/2/2d/canvas"
import { apply2x, apply2y } from "../../cv/2/2d/tform"
import type { Config } from "./config"
import { type Path } from "./path"

export function drawAsSeenFrom(
    cv: Canvas2,
    base: Path,
    target: Path,
    tilt: boolean,
    config: Config,
) {
    const { ctx, tlo, tol, height } = cv

    const trace = new Path2D()
    const holes = new Path2D()

    ctx.fillStyle = config.color
    ctx.textAlign = config.textAlign
    ctx.font = "16px Symbola"

    let trackedValue: number | undefined
    const [interval] = spacing(-cv.pixelHeight)
    const digits = Math.max(0, -Math.floor(Math.log10(interval)))
    for (let oy = -height; oy <= height; oy++) {
        const clockBase = apply2y(tol, oy)
        const t = base.fromClock(clockBase)
        const xBase = base.x(t)

        const tSourceLight = target.whenDidLightDepartTo(t, xBase)
        const xTarget = target.x(tSourceLight)

        const v = base.v(t)
        const dif = (xTarget - xBase) * -((v - 1) / Math.sqrt(1 - v ** 2))
        const oxv = apply2x(tlo, dif)
        const oyv = tilt ? oy + dif * tlo.sy : oy
        trace.lineTo(oxv, oyv)

        const myTrackedValue = target.clock(tSourceLight)
        if (trackedValue === undefined) {
            trackedValue = myTrackedValue
            continue
        }
        if (Math.floor(myTrackedValue / interval) !== Math.floor(trackedValue / interval)) {
            holes.moveTo(oxv + 3, oyv)
            holes.ellipse(oxv, oyv, 3, 3, 0, 0, 2 * Math.PI)
            ctx.fillText("" + myTrackedValue.toFixed(digits), oxv + config.textOffset, oyv)
        }
        trackedValue = myTrackedValue
    }

    ctx.strokeStyle = config.color
    ctx.lineWidth = 1.5
    ctx.stroke(trace)
    ctx.fillStyle = "white"
    ctx.fill(holes)
    ctx.stroke(holes)
}

// pink at 7.000 (x=9.04) sees yellow at 3.300 (x=4.33)
// distance is about 4.71; 4.71*sqrt(1-.5*.5) = 4.08

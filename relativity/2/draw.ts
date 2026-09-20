import { spacing, toFixed } from "../../cv/2/2d-object/grid"
import type { Canvas2 } from "../../cv/2/2d/canvas"
import { Object2 } from "../../cv/2/2d/object"
import { apply2x, apply2y } from "../../cv/2/2d/tform"
import type { Style } from "./config"
import type { Path } from "./path"

export class DrawnPath extends Object2 {
    constructor(
        readonly path: Path,
        readonly style: Style,
    ) {
        super()
    }

    draw(cv: Canvas2): void {
        drawPathTrace(cv, this.path, this.style)
        drawPathTicks(cv, this.path, this.style)
        drawPathTickLabels(cv, this.path, this.style)
    }
}

export function drawPathTrace(cv: Canvas2, path: Path, style: Style) {
    const { ctx, tlo, tol, height } = cv
    const trace = new Path2D()

    for (let oy = 0; oy <= height; oy++) {
        const t = apply2y(tol, oy)
        const x = path.x(t)
        const ox = apply2x(tlo, x)
        trace.lineTo(ox, oy)
    }

    ctx.lineWidth = style.lineWidth
    ctx.strokeStyle = style.color
    ctx.lineCap = "square"
    ctx.stroke(trace)
}

export function drawPathTicks(cv: Canvas2, path: Path, style: Style) {
    const { ctx, tlo, tol, height } = cv

    const clockMinByScreen = path.clock(apply2y(tol, height))
    const clockMaxByScreen = path.clock(apply2y(tol, 0))

    const [dq, tx, tr, mq] = spacing((clockMaxByScreen - clockMinByScreen) / height)

    const qmin = Math.floor(clockMinByScreen / dq)
    const qmax = Math.ceil(clockMaxByScreen / dq)
    const holes = new Path2D()
    const dots = new Path2D()

    for (let q = qmin; q <= qmax; q++) {
        const clock = q * dq
        const t = path.fromClock(clock)
        if (isNaN(t)) continue

        const x = path.x(t)
        const ox = apply2x(tlo, x)
        const oy = apply2y(tlo, t)

        if (q % (tx / dq) === 0) {
            dots.moveTo(ox + style.tickRadius, 0)
            dots.ellipse(ox, oy, style.tickRadius, style.tickRadius, 0, 0, 2 * Math.PI)
            continue
        }

        for (const [multiplier, alpha] of mq) {
            if (q % multiplier == 0) {
                if (alpha < 0.05) break
                holes.moveTo(ox + style.tickRadius - style.lineWidth / 2, oy)
                holes.ellipse(
                    ox,
                    oy,
                    style.tickRadius - style.lineWidth / 2,
                    style.tickRadius - style.lineWidth / 2,
                    0,
                    0,
                    2 * Math.PI,
                )
                break
            }
        }
    }

    ctx.fillStyle = style.color
    ctx.fill(dots)

    ctx.fillStyle = "white"
    ctx.fill(holes)
    ctx.stroke(holes)
}

export function drawPathTickLabels(cv: Canvas2, path: Path, style: Style) {
    const { ctx, tlo, tol, height } = cv

    const clockMinByScreen = path.clock(apply2y(tol, height))
    const clockMaxByScreen = path.clock(apply2y(tol, 0))

    const [, tx, tr] = spacing((clockMaxByScreen - clockMinByScreen) / height)

    const qmin = Math.floor(clockMinByScreen / tx)
    const qmax = Math.ceil(clockMaxByScreen / tx)
    ctx.textAlign = style.textAlign
    ctx.textBaseline = "middle"
    ctx.strokeStyle = "white"
    ctx.fillStyle = style.color

    for (let q = qmin; q <= qmax; q++) {
        const clock = q * tx
        const t = path.fromClock(clock)
        if (isNaN(t)) continue

        const x = path.x(t)
        const ox = apply2x(tlo, x)
        const oy = apply2y(tlo, t)

        const label = toFixed(clock, tr)

        ctx.save()
        ctx.translate(ox, oy)
        ctx.rotate(Math.atan(path.v(t)))
        ctx.translate(style.textOffset, 0)
        ctx.strokeText(label, 0, 0)
        ctx.fillText(label, 0, 0)
        ctx.restore()
    }
}

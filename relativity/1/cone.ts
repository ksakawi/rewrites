import type { Canvas2 } from "../../cv/2/2d/canvas"
import { Object2, type PEvent } from "../../cv/2/2d/object"
import { apply2x, apply2y } from "../../cv/2/2d/tform"
import type { Path } from "./path"

export class LinearCone extends Object2 {
    constructor(
        readonly xmin: number,
        readonly xmax: number,
        public xFromY: ((y: number) => number) | null,
    ) {
        super()
        queueMicrotask(() => {
            if (this.xFromY) {
                this.x = this.xFromY(this.y)
            }
        })
    }

    color = "orange"
    x = 0
    y = 0
    offsetX = 0

    draw({ ctx, tlo, width, height }: Canvas2): void {
        ctx.fillStyle = this.color

        const ox = apply2x(tlo, this.x)
        const oy = apply2y(tlo, this.y)

        const lhs = Math.max(0, apply2x(tlo, this.xmin))
        const rhs = Math.min(width, apply2x(tlo, this.xmax))

        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(rhs, oy + (rhs - ox))
        ctx.lineTo(rhs, height)
        ctx.lineTo(lhs, height)
        ctx.lineTo(lhs, oy + (ox - lhs))
        ctx.closePath()
        ctx.globalAlpha = this.pointersIn.size ? 0.5 : 0.3
        ctx.fill()
        ctx.globalAlpha = 1
    }

    includes({ cv: { tlo }, offset: [mx, my], size }: PEvent): boolean {
        const ox = apply2x(tlo, this.x + this.offsetX)
        const oy = apply2y(tlo, this.y)
        return Math.hypot(mx - ox, my - oy) < 12 * size
    }

    pointersIn = new Set<number>()

    onPointerEnter({ cv, pointerId }: PEvent): void {
        this.pointersIn.add(pointerId)
        cv.pushCursor("grab")
    }

    onPointerLeave({ cv, pointerId }: PEvent): void {
        this.pointersIn.delete(pointerId)
        cv.popCursor()
    }

    pointersDown = new Set<number>()

    onPointerDown({ cv, pointerId }: PEvent): void {
        this.pointersDown.add(pointerId)
        cv.pushCursor("grabbing")
    }

    onPointerUp({ cv, pointerId }: PEvent): void {
        this.pointersDown.delete(pointerId)
        cv.popCursor()
    }

    onPointerMove({ cv: { tol }, pointerId, offset: [ox, oy] }: PEvent): void {
        if (!this.pointersDown.has(pointerId)) return
        this.y = apply2y(tol, oy)
        this.x = this.xFromY ? this.xFromY(this.y) : apply2x(tol, ox)
        if (this.x < this.xmin) {
            this.x = this.xmin
        }
        if (this.x > this.xmax) {
            this.x = this.xmax
        }
    }

    onPointerCancel({ cv, pointerId }: PEvent): void {
        this.pointersDown.delete(pointerId)
        cv.popCursor()
    }
}

export function createDualCone(cv: Canvas2, path: Path, xInertial: number, xNormal: number) {
    const xmid = (xInertial + xNormal) / 2

    const coneInertial = new LinearCone(-Infinity, xmid, (t) => {
        coneNormal.y = path.fromClock(t)
        coneNormal.x = path.x(coneNormal.y) + xNormal
        return xInertial
    })

    const coneNormal = new LinearCone(xmid, Infinity, (t) => {
        coneInertial.y = path.clock(t)
        return path.x(t) + xNormal
    })

    cv.push(coneInertial)
    cv.push(coneNormal)
}

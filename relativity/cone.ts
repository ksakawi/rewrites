import type { Canvas2 } from "../cv/2/2d/canvas"
import { Object2, type PEvent } from "../cv/2/2d/object"
import { apply2x, apply2y } from "../cv/2/2d/tform"

export class LinearCone extends Object2 {
    color = "orange"
    x = 0
    y = 0
    xFromY: ((y: number) => number) | undefined

    draw({ ctx, tlo, width, height }: Canvas2): void {
        ctx.fillStyle = this.color

        const ox = apply2x(tlo, this.x)
        const oy = apply2y(tlo, this.y)

        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(width, oy + (width - ox))
        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.lineTo(0, oy + ox)
        ctx.closePath()
        ctx.globalAlpha = this.pointersIn.size ? 0.5 : 0.3
        ctx.fill()
        ctx.globalAlpha = 1
    }

    includes({ cv: { tlo }, offset: [mx, my], pointerId, size }: PEvent): boolean {
        const ox = apply2x(tlo, this.x)
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
    }

    onPointerCancel({ cv, pointerId }: PEvent): void {
        this.pointersDown.delete(pointerId)
        cv.popCursor()
    }
}

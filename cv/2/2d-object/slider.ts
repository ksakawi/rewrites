import type { Canvas2 } from "../2d/canvas"
import { Object2, type PEvent } from "../2d/object"

export class Slider extends Object2 {
    public v = 1

    constructor() {
        super()
    }

    public width = 196
    public height = 32
    public insetX = 4
    public insetY = 4
    public track = 6
    public dotRadius = 12

    public strokeWidth = 1
    public colorBorder = "#e0e0e0"
    public colorBg = "white" // "#020617"
    public colorTrack = "#e5e5e5" // "#1e293b"
    public colorSlider = "#3b82f6"

    draw({ ctx, width: cvWidth }: Canvas2): void {
        const { width, height, insetX, insetY, track, dotRadius } = this

        ctx.fillStyle = this.colorBorder
        ctx.beginPath()
        ctx.roundRect(cvWidth - width - insetX, insetY, width, height, height / 2)
        ctx.fill()

        ctx.fillStyle = this.colorBg
        ctx.beginPath()
        ctx.roundRect(
            cvWidth - width - insetX + this.strokeWidth,
            insetY + this.strokeWidth,
            width - this.strokeWidth * 2,
            height - this.strokeWidth * 2,
            height / 2,
        )
        ctx.fill()

        ctx.fillStyle = this.colorTrack
        ctx.beginPath()
        ctx.roundRect(
            cvWidth - width - insetX + (height - track) / 2,
            insetY + (height - track) / 2,
            width - (height - track),
            track,
            track / 2,
        )
        ctx.fill()

        const x = this.oxFromV(cvWidth, this.v)
        const y = insetY + height / 2

        ctx.fillStyle = this.colorSlider
        ctx.globalAlpha = this.pointersEntered.size ? 1 : 0.3
        ctx.beginPath()
        ctx.ellipse(x, y, dotRadius, dotRadius, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.ellipse(x, y, track / 2, track / 2, 0, 0, 2 * Math.PI)
        ctx.fill()
    }

    private oxFromV(cvWidth: number, v: number): number {
        const { width, height, insetX } = this
        return v * (width - height) + cvWidth - insetX + height / 2 - width
    }

    private vFromOx(cvWidth: number, ox: number): number {
        const { width, height, insetX } = this
        const v = (ox + width - height / 2 + insetX - cvWidth) / (width - height)
        return Math.max(0, Math.min(1, v))
    }

    includes(ev: PEvent): boolean {
        const { width, height, insetX, insetY, track, dotRadius } = this

        const ox = this.oxFromV(ev.cv.width, this.v)
        const oy = insetY + height / 2

        return Math.hypot(ox - ev.offset[0], oy - ev.offset[1]) <= dotRadius
    }

    private pointersEntered = new Set<number>()

    onPointerEnter(ev: PEvent): void {
        this.pointersEntered.add(ev.pointerId)
        ev.cv.pushCursor("grab")
    }

    onPointerLeave(ev: PEvent): void {
        this.pointersEntered.delete(ev.pointerId)
        ev.cv.popCursor()
    }

    private pointersDown = new Set<number>()

    onPointerDown(ev: PEvent): void {
        this.pointersDown.add(ev.pointerId)
        ev.cv.pushCursor("grabbing")
    }

    onPointerUp(ev: PEvent): void {
        this.pointersDown.delete(ev.pointerId)
        ev.cv.popCursor()
    }

    onPointerCancel(ev: PEvent): void {
        this.pointersDown.delete(ev.pointerId)
        ev.cv.popCursor()
    }

    onPointerMove(ev: PEvent): void {
        if (!this.pointersDown.has(ev.pointerId)) return
        this.v = this.vFromOx(ev.cv.width, ev.offset[0])
    }
}

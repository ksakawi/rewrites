import { Grid, spacing } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { Object2, type PEvent } from "../cv/2/2d/object"
import { apply2x, apply2y } from "../cv/2/2d/tform"
import { assert } from "../nyalang/15/assert"

/**
 * Terminology:
 *
 * - Global time means the base time in the graph.
 * - Local time means the time as measured by a clock on this `Path`.
 */
abstract class Path {
    /** Position at the given global time. */
    abstract x(t: number): number

    /** Velocity at the given global time. */
    abstract v(t: number): number

    /** Returns what this path's clock reads at the given global time. */
    abstract tLocal(t: number): number

    /** Returns what the global clock reads when this path has a particular local time. */
    abstract tGlobal(t: number): number

    /** Smallest global t-value which should be plotted. */
    abstract tmin: number

    /** Largest global t-value which should be plotted. */
    abstract tmax: number

    slice(tmin: number, tmax: number) {
        return new Slice(this, tmin, tmax)
    }

    join(next: Path) {
        return new Join(this, next)
    }

    /**
     * It takes some time for a visual of `other` to get to `this`. Assuming we are on `this` at
     * global time `t`, what global time are we receiving our image of `this` from?
     *
     * If there are many solutions, only one is found. There should never be multiple solutions,
     * since that means an object went faster than light.
     */
    lightLeftAt(other: Path, t: number) {
        const x = this.x(t)
        // solve for `d` in `abs(other.x(t - d) - x) = d`
        // that is, the offset in position exactly counters how long it took for us to see that position

        const baseDir = Math.sign(other.x(t) - x)
        if (baseDir === 0) return t

        let dmax = 1
        for (let i = 0; i < 308; i++) {
            const sign = Math.sign(other.x(t - dmax) - x - baseDir * dmax)
            if (sign === 0) return t - dmax
            if (sign !== baseDir) break
            dmax *= 2
        }

        let dmin = 0
        while (dmax - dmin > 1e-3) {
            const mid = (dmin + dmax) / 2
            const signMid = Math.sign(other.x(t - mid) - x - baseDir * mid)
            if (signMid === 0) return mid

            if (signMid === baseDir) {
                dmin = mid
            } else {
                dmax = mid
            }
        }
        return t - dmin
    }

    /** Measures the time that `this` sees on `other`'s clock when `this` is at global time `t`. */
    measureClock(other: Path, t: number) {
        return other.tLocal(this.lightLeftAt(other, t))
    }

    absolute(color: string, textAlign: CanvasTextAlign, textOffset: number): AbsolutePath {
        return new AbsolutePath(this, color, textAlign, textOffset)
    }

    seenFrom(
        other: Path,
        color: string,
        textAlign: CanvasTextAlign,
        textOffset: number,
    ): RelativePath {
        return new RelativePath(other, this, color, textAlign, textOffset)
    }
}

class Slice extends Path {
    constructor(
        public base: Path,
        public tmin: number,
        public tmax: number,
    ) {
        assert(tmin >= base.tmin)
        assert(tmax <= base.tmax)
        assert(tmin <= tmax)
        super()
    }

    x(t: number): number {
        return this.base.x(t)
    }

    v(t: number): number {
        return this.base.v(t)
    }

    tLocal(t: number): number {
        return this.base.tLocal(t)
    }

    tGlobal(t: number): number {
        return this.base.tGlobal(t)
    }
}

/**
 * The second path will receive `t=0` when the actual time value is `lhs.tmax`. The second path is
 * shifted so its first x-coordinate is the same as the first path's final x-coordinate.
 */
class Join extends Path {
    private xshift: number

    constructor(
        private lhs: Path,
        private rhs: Path,
    ) {
        super()
        this.tmin = lhs.tmin
        this.tmax = rhs.tmax + lhs.tmax
        this.xshift = lhs.x(lhs.tmax) - rhs.x(0)
    }

    x(t: number): number {
        return t <= this.lhs.tmax ? this.lhs.x(t) : this.rhs.x(t - this.lhs.tmax) + this.xshift
    }

    v(t: number): number {
        return t <= this.lhs.tmax ? this.lhs.v(t) : this.rhs.v(t - this.lhs.tmax)
    }

    tLocal(t: number): number {
        return t <= this.lhs.tmax ?
                this.lhs.tLocal(t)
            :   this.rhs.tLocal(t - this.lhs.tmax) + this.lhs.tLocal(this.lhs.tmax)
    }

    tGlobal(t: number): number {
        return t <= this.lhs.tLocal(this.lhs.tmax) ?
                this.lhs.tGlobal(t)
            :   this.rhs.tGlobal(t - this.lhs.tLocal(this.lhs.tmax)) + this.lhs.tmax
    }

    tmin: number
    tmax: number
}

/** An object with constant velocity. */
class Inertial extends Path {
    constructor(private v0: number) {
        super()
    }

    x(t: number): number {
        return this.v0 * t
    }

    v(t: number): number {
        return this.v0
    }

    tLocal(t: number): number {
        return t * Math.sqrt(1 - this.v0 ** 2)
    }

    tGlobal(t: number): number {
        return t / Math.sqrt(1 - this.v0 ** 2)
    }

    tmin = -Infinity
    tmax = Infinity
}

/** An object with constant acceleration. */
class Accelerating extends Path {
    constructor(private a: number) {
        super()
    }

    x(t: number): number {
        return Math.log(Math.cosh(this.a * t)) / this.a
    }

    v(t: number): number {
        return Math.tanh(this.a * t)
    }

    tLocal(t: number): number {
        return Math.atan(Math.sinh(this.a * t)) / this.a
    }

    tGlobal(t: number): number {
        if (t <= -Math.PI / 2 / this.a) return NaN
        if (t >= Math.PI / 2 / this.a) return NaN
        return Math.asinh(Math.tan(t * this.a)) / this.a
    }

    tmin: number = -Infinity
    tmax: number = Infinity
}

/** Reverses time along the given path. */
class FlipT extends Path {
    constructor(private base: Path) {
        assert(base.tmin === 0)
        assert(base.tmax !== Infinity)
        super()

        this.tmax = base.tmax
    }

    x(t: number): number {
        return this.base.x(this.base.tmax - t)
    }

    v(t: number): number {
        return this.base.v(this.base.tmax - t)
    }

    tLocal(t: number): number {
        return this.base.tLocal(this.base.tmax) - this.base.tLocal(this.base.tmax - t)
    }

    tGlobal(t: number): number {
        return this.base.tmax - this.base.tGlobal(this.base.tLocal(this.base.tmax) - t)
    }

    tmin = 0
    tmax: number
}

/** Reflects the given path in space. */
class FlipX extends Path {
    constructor(private base: Path) {
        super()
        this.tmin = base.tmin
        this.tmax = base.tmax
    }

    x(t: number): number {
        return -this.base.x(t)
    }

    v(t: number): number {
        return -this.base.v(t)
    }

    tLocal(t: number): number {
        return this.base.tLocal(t)
    }

    tGlobal(t: number): number {
        return this.base.tGlobal(t)
    }

    tmin: number
    tmax: number
}

/** Shifts the given path by an amount in space. */
class Shift extends Path {
    constructor(
        public base: Path,
        public xshift: number,
    ) {
        super()
        this.tmin = base.tmin
        this.tmax = base.tmax
    }

    x(t: number): number {
        return this.xshift + this.base.x(t)
    }

    v(t: number): number {
        return this.base.v(t)
    }

    tLocal(t: number): number {
        return this.base.tLocal(t)
    }

    tGlobal(t: number): number {
        return this.base.tGlobal(t)
    }

    tmin: number
    tmax: number
}

/** A light cone. Movable by dragging its vertex. */
class LightCone extends Object2 {
    constructor(
        /** Locks the light cone to a given x-position based on its t-position. */
        readonly x: ((t: number) => number) | null,
    ) {
        super()
    }

    lx = 0
    ly = 0
    private init = false

    draw(cv: Canvas2): void {
        if (!this.init && this.x !== null) {
            this.init = true
            this.lx = this.x(this.ly)
        }

        const ox = apply2x(cv.tlo, this.lx)
        const oy = apply2y(cv.tlo, this.ly)

        const d = Math.max(cv.width, cv.height) + 8
        cv.ctx.beginPath()
        cv.ctx.moveTo(-d, oy + ox + d)
        if (true) {
            cv.ctx.lineTo(ox, oy)
        } else {
            cv.ctx.lineTo(cv.width + d, oy - cv.width - d + ox)
            cv.ctx.lineTo(-d, oy - ox - d)
        }
        cv.ctx.lineTo(cv.width + d, oy + cv.width + d - ox)
        cv.ctx.strokeStyle = "orange"
        cv.ctx.lineWidth = 2.5
        cv.ctx.stroke()
        cv.ctx.fillStyle = "#f804"
        cv.ctx.fill()
    }

    includes(ev: PEvent): boolean {
        return (
            Math.hypot(
                ev.offset[0] - apply2x(ev.cv.tlo, this.lx),
                ev.offset[1] - apply2y(ev.cv.tlo, this.ly),
            ) < 24
        )
    }

    private down = new Set<number>()

    onPointerDown(ev: PEvent): void {
        this.down.add(ev.pointerId)
    }

    onPointerUp(ev: PEvent): void {
        this.down.delete(ev.pointerId)
    }

    onPointerMove(ev: PEvent): void {
        if (!this.down.has(ev.pointerId)) return
        this.ly = apply2y(ev.cv.tol, ev.offset[1])
        if (this.x === null) {
            this.lx = apply2x(ev.cv.tol, ev.offset[0])
        } else {
            this.lx = this.x(this.ly)
        }
    }
}

class AbsolutePath extends Object2 {
    constructor(
        private path: Path,
        private color: string,
        private textAlign: CanvasTextAlign,
        private textOffset: number,
    ) {
        super()
    }

    draw(cv: Canvas2): void {
        cv.ctx.textBaseline = "middle"
        cv.ctx.fillStyle = this.color
        cv.ctx.font = "16px Symbola"
        cv.ctx.textAlign = this.textAlign

        const trace = new Path2D()
        const dots = new Path2D()

        const ymin = Math.max(-cv.width, apply2y(cv.tlo, this.path.tmax))
        const ymax = Math.min(cv.height, apply2y(cv.tlo, this.path.tmin))

        const tLocalMax = this.path.tLocal(apply2y(cv.tol, ymin))

        const [tLocalInterval] = spacing(-cv.pixelHeight)
        const digits = Math.floor(Math.log10(tLocalInterval))

        let lastTLocal = tLocalMax
        for (let oy = ymin; oy < ymax + 2; oy++) {
            const ly = apply2y(cv.tol, oy)
            const lx = this.path.x(ly)
            const ox = apply2x(cv.tlo, lx)
            trace.lineTo(ox, oy)

            let tLocal = this.path.tLocal(ly)
            if (Math.floor(tLocal / tLocalInterval) < Math.floor(lastTLocal / tLocalInterval)) {
                const label = lastTLocal.toFixed(digits < 0 ? -digits : 0)
                cv.ctx.fillText(label, ox + this.textOffset, oy)
                dots.moveTo(ox + 4, oy)
                dots.ellipse(ox, oy, 4, 4, 0, 0, 2 * Math.PI)
            }
            lastTLocal = tLocal
        }

        cv.ctx.lineWidth = 2.5
        cv.ctx.strokeStyle = this.color
        cv.ctx.stroke(trace)

        cv.ctx.fillStyle = "white"
        cv.ctx.fill(dots)
        cv.ctx.stroke(dots)
    }
}

class RelativePath extends Object2 {
    constructor(
        private reference: Path,
        private self: Path,
        private color: string,
        private textAlign: CanvasTextAlign,
        private textOffset: number,
    ) {
        super()
    }

    draw(cv: Canvas2): void {
        const base = this.reference
        const viewed = this.self
        const color = this.color

        cv.ctx.strokeStyle = color
        cv.ctx.fillStyle = color
        cv.ctx.lineWidth = 2.5
        cv.ctx.lineCap = cv.ctx.lineJoin = "round"
        cv.ctx.textAlign = this.textAlign
        cv.ctx.textBaseline = "middle"
        cv.ctx.font = "16px Symbola"
        const path = new Path2D()
        const dots = new Path2D()

        const oxSelf = apply2x(cv.tlo, 0)

        const [tLocalInterval] = spacing(-cv.pixelHeight)
        const digits = Math.floor(Math.log10(tLocalInterval))

        let tInertialLast = -Infinity
        for (let oySelf = -cv.width; oySelf < cv.height; oySelf++) {
            const tSelf = apply2y(cv.tol, oySelf)
            const t = base.tGlobal(tSelf)

            const lightLeft_viewedAt_global = base.lightLeftAt(viewed, t)
            const lightLeft_viewedAt = viewed.tLocal(lightLeft_viewedAt_global)
            if (lightLeft_viewedAt_global < viewed.tmin) break
            if (lightLeft_viewedAt_global > viewed.tmax) continue
            const v = base.v(t)
            const dist_relativeToSpace = viewed.x(lightLeft_viewedAt_global) - base.x(t)
            console.log(t, dist_relativeToSpace)
            const dist_relativeToBase = dist_relativeToSpace * 0.735

            const oxSeen = oxSelf - dist_relativeToBase * cv.tlo.sy
            const oySeen = oySelf + dist_relativeToBase * cv.tlo.sy
            path.lineTo(oxSeen, oySeen)

            if (
                Math.floor(lightLeft_viewedAt / tLocalInterval)
                !== Math.floor(tInertialLast / tLocalInterval)
            ) {
                const value = Math.round(lightLeft_viewedAt / tLocalInterval) * tLocalInterval

                dots.moveTo(oxSeen + 4, oySeen)
                dots.ellipse(oxSeen, oySeen, 4, 4, 0, 0, 2 * Math.PI)
                cv.ctx.fillText(
                    "" + value.toFixed(digits < 0 ? -digits : 0),
                    oxSeen + this.textOffset,
                    oySeen,
                )
            }
            tInertialLast = lightLeft_viewedAt
        }

        cv.ctx.stroke(path)
        cv.ctx.fillStyle = "white"
        cv.ctx.fill(dots)
        cv.ctx.stroke(dots)
    }
}

const cv = new Canvas2({ sx: 20, sy: 20, tx: 0, ty: 5 })
cv.el.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
cv.push(new Grid({ xText: false, yText: false }))
document.body.appendChild(cv.el)

const base = new Accelerating(0.5).slice(0, new Accelerating(0.5).tGlobal(2.5))

// const accelerated = base
//     .join(new FlipX(new FlipT(base)))
//     .join(new FlipX(base))
//     .join(new FlipT(base))
//     .join(new Inertial(0))

const accelerated = new Inertial(0.3).slice(0, Infinity)

const a = new Inertial(0).slice(0, Infinity)

cv.pushFn(() => cv.ctx.translate(cv.tlo.sx * 5, 0))
cv.push(accelerated.absolute("green", "left", 8))
cv.push(a.absolute("blue", "right", -8))
cv.pushFn(() => cv.ctx.translate(-cv.tlo.sx * 5, 0))

cv.pushFn(() => cv.ctx.translate(-cv.tlo.sx * 5, 0))
cv.push(a.seenFrom(accelerated, "blue", "right", -8))
cv.push(new Inertial(0).slice(0, Infinity).absolute("green", "left", 8))
cv.pushFn(() => cv.ctx.translate(cv.tlo.sx * 5, 0))

const coneFromEarth = new LightCone((t) => {
    coneStatic.lx = -5
    coneStatic.ly = accelerated.tLocal(t)
    return accelerated.x(t) + 5
})

const coneStatic = new LightCone((t) => {
    coneFromEarth.ly = accelerated.tGlobal(t)
    coneFromEarth.lx = accelerated.x(coneFromEarth.ly) + 5
    return -5
})

cv.push(coneFromEarth)
cv.push(coneStatic)

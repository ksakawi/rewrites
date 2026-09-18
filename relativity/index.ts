import { Grid } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { Object2 } from "../cv/2/2d/object"
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

    draw(cv: Canvas2, strokeStyle: string | CanvasGradient | CanvasPattern) {
        cv.ctx.textAlign = "left"
        cv.ctx.textBaseline = "middle"
        cv.ctx.fillStyle = strokeStyle
        cv.ctx.font = "16px Symbola"

        const trace = new Path2D()
        const dots = new Path2D()

        const ymin = Math.max(0, apply2y(cv.tlo, this.tmax))
        const ymax = Math.min(cv.height, apply2y(cv.tlo, this.tmin), apply2y(cv.tlo, 0))

        const tLocalMin = this.tLocal(apply2y(cv.tol, ymax))
        const tLocalMax = this.tLocal(apply2y(cv.tol, ymin))

        let tLocalIntervalRaw = (tLocalMax - tLocalMin) / 50
        let digits = Math.ceil(Math.log10(tLocalIntervalRaw))
        let tLocalInterval = 10 ** digits
        if (
            Math.ceil(Math.log10(tLocalIntervalRaw)) - Math.round(Math.log10(tLocalIntervalRaw))
            < 0.5
        )
            tLocalInterval *= 2

        let lastTLocal = tLocalMax
        for (let oy = ymin; oy < ymax + 2; oy++) {
            const ly = apply2y(cv.tol, oy)
            const lx = this.x(ly)
            const ox = apply2x(cv.tlo, lx)
            trace.lineTo(ox, oy)

            let tLocal = this.tLocal(ly)
            if (Math.floor(tLocal / tLocalInterval) < Math.floor(lastTLocal / tLocalInterval)) {
                cv.ctx.fillText("" + lastTLocal.toFixed(digits < 0 ? -digits : 0), ox + 8, oy)
                dots.moveTo(ox + 4, oy)
                dots.ellipse(ox, oy, 4, 4, 0, 0, 2 * Math.PI)
            }
            lastTLocal = tLocal
        }

        cv.ctx.lineWidth = 2.5
        cv.ctx.strokeStyle = strokeStyle
        cv.ctx.stroke(trace)

        cv.ctx.fillStyle = "white"
        cv.ctx.fill(dots)
        cv.ctx.stroke(dots)
    }

    slice(tmin: number, tmax: number) {
        return new Slice(this, tmin, tmax)
    }

    join(next: Path) {
        return new Join(this, next)
    }

    /** What time does `this` see on `other`'s clock at global time `t`? */
    measureClock(other: Path, t: number) {
        const x = this.x(t)
        // goal: solve other.x()
    }
}

class Slice extends Path {
    constructor(
        private base: Path,
        readonly tmin: number,
        readonly tmax: number,
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
        return Math.asinh(Math.tan(t * this.a)) / this.a
    }

    tmin: number = -Infinity
    tmax: number = Infinity
}

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

class Shift extends Path {
    constructor(
        private base: Path,
        private xshift: number,
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

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 0 })
cv.el.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
cv.push(new Grid())
document.body.appendChild(cv.el)

const base = new Accelerating(0.2).slice(0, 8.368497)

const nonlinear = base
    .join(new FlipX(new FlipT(base)))
    .join(new FlipX(base))
    .join(new FlipT(base))
    .join(new Inertial(0))

cv.adopt(nonlinear, (x) => x.draw(cv, "green"))
cv.adopt(new Inertial(-0.3), (x) => x.draw(cv, "blue"))
console.log(nonlinear.tGlobal(3.2))

const triangle = new (class extends Object2 {
    lx = 0
    ly = 0

    draw(cv: Canvas2): void {
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
})()
cv.push(triangle)
cv.el.addEventListener("pointermove", (ev) => {
    triangle.lx = apply2x(cv.tol, ev.offsetX)
    triangle.ly = apply2y(cv.tol, ev.offsetY)
    cv.redraw()
})

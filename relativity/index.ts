import { Grid } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { apply2x, apply2y } from "../cv/2/2d/tform"
import { assert } from "../nyalang/15/assert"

abstract class Path {
    abstract x(t: number): number
    abstract v(t: number): number
    abstract tLocal(t: number): number
    abstract tmin: number
    abstract tmax: number

    draw(cv: Canvas2, strokeStyle: string | CanvasGradient | CanvasPattern) {
        cv.ctx.textAlign = "left"
        cv.ctx.textBaseline = "middle"
        cv.ctx.fillStyle = strokeStyle
        cv.ctx.font = "16px Symbola"

        const trace = new Path2D()
        const dots = new Path2D()

        const ymin = Math.max(0, apply2y(cv.tlo, this.tmax))
        const ymax = Math.min(cv.height, apply2y(cv.tlo, this.tmin))

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
        for (let oy = ymin; oy < ymax; oy++) {
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

    tmin: number
    tmax: number
}

class ConstantAcceleration extends Path {
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

    tmin: number = -Infinity
    tmax: number = Infinity
}

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 0 })
cv.el.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
cv.push(new Grid())
document.body.appendChild(cv.el)

cv.adopt(new ConstantAcceleration(0.2), (x) => x.draw(cv, "green"))

function acot(x: number): number {
    return Math.PI / 2 - Math.atan(x)
}

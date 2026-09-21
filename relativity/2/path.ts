import { solve } from "../../math/solve"

export abstract class Path {
    abstract x(t: number): number

    /** d/dt x(t). */
    abstract v(t: number): number

    /** int_0^t sqrt(1 - v(t)**2) dt. */
    abstract clock(t: number): number

    /** Inverse of `fromClock`. */
    abstract fromClock(t: number): number

    /**
     * Returns a time `t` such that `t=m*x(t)+b`, or `NaN` if no such value
     * exists.
     *
     * Assumes `-1 <= m <= 1`.
     *
     * `tIntersectingWith(0, b) == t`.
     */
    tIntersectingWith(m: number, b: number): number {
        return solve(1e-10, (t) => t - m * this.x(t) - b)
    }

    translate(dx: number, dt: number) {
        return new Translate(this, dx, dt)
    }
}

export class Inertial extends Path {
    constructor(public v0: number) {
        super()
    }

    x(t: number): number {
        return this.v0 * t
    }

    v(_t: number): number {
        return this.v0
    }

    clock(t: number): number {
        return t * Math.sqrt(1 - this.v0 ** 2)
    }

    fromClock(t: number): number {
        return t / Math.sqrt(1 - this.v0 ** 2)
    }

    tIntersectingWith(m: number, b: number): number {
        return b / (1 - m * this.v0)
    }
}

export class Accelerating extends Path {
    static awayAndBack(a: number, timeAway: number) {
        const switchPoint = timeAway / 4
        const base = new Accelerating(a)
        return new Switch(
            new Switch(
                new Switch(
                    new Switch(new Inertial(0), base, 0),
                    new Translate(new Accelerating(-a), 0, 2 * switchPoint),
                    switchPoint,
                ),
                new Translate(base, 0, 4 * switchPoint),
                3 * switchPoint,
            ),
            new Inertial(0),
            4 * switchPoint,
        )
    }

    constructor(public a0: number) {
        super()
    }

    x(t: number): number {
        return Math.log(Math.cosh(this.a0 * t)) / this.a0
    }

    v(t: number): number {
        return Math.tanh(this.a0 * t)
    }

    clock(t: number): number {
        return Math.atan(Math.sinh(this.a0 * t)) / this.a0
    }

    fromClock(t: number): number {
        if (Math.abs(t) > Math.PI / (2 * Math.abs(this.a0))) return NaN
        return Math.asinh(Math.tan(this.a0 * t)) / this.a0
    }
}

export class Translate<T extends Path> extends Path {
    constructor(
        public base: T,
        public dx: number,
        public dt: number,
    ) {
        super()
    }

    x(t: number): number {
        return this.base.x(t - this.dt) + this.dx
    }

    v(t: number): number {
        return this.base.v(t - this.dt)
    }

    clock(t: number): number {
        return this.base.clock(t - this.dt) - this.base.clock(-this.dt)
    }

    fromClock(t: number): number {
        return this.base.fromClock(t + this.base.clock(-this.dt)) + this.dt
    }

    tIntersectingWith(m: number, b: number): number {
        // t=m*x(t)+b
        // t-dt=m*(x(t-dt))+b+m*dx

        return this.base.tIntersectingWith(m, b - this.dt + m * this.dx) + this.dt
    }
}

/**
 * Translates `b` in space so that its `(x(tmid), tmid)` point lines up with
 * that of `a`.
 */
export class Switch<A extends Path, B extends Path> extends Path {
    constructor(
        public a: A,
        public b: B,
        public mid: number,
    ) {
        super()
    }

    x(t: number): number {
        return t > this.mid ? this.b.x(t) - this.b.x(this.mid) + this.a.x(this.mid) : this.a.x(t)
    }

    v(t: number): number {
        return t > this.mid ? this.b.v(t) : this.a.v(t)
    }

    clock(t: number): number {
        return t > this.mid ?
                this.b.clock(t) - this.b.clock(this.mid) + this.a.clock(this.mid)
            :   this.a.clock(t)
    }

    fromClock(t: number): number {
        return t > this.a.clock(this.mid) ?
                this.b.fromClock(t + this.b.clock(this.mid) - this.a.clock(this.mid))
            :   this.a.fromClock(t)
    }
}

export class Shift<T extends Path> extends Path {
    constructor(
        public base: T,
        public dv: number,
    ) {
        super()
    }

    x(t: number): number {
        const tBase = this.base.tIntersectingWith(-this.dv, t * Math.sqrt(1 - this.dv ** 2))
        const xBase = this.base.x(tBase)
        return (xBase + this.dv * tBase) / Math.sqrt(1 - this.dv ** 2)
    }

    v(t: number): number {
        const tBase = this.base.tIntersectingWith(-this.dv, t * Math.sqrt(1 - this.dv ** 2))
        const vBase = this.base.v(tBase)
        return (vBase + this.dv) / (1 + vBase * this.dv)
    }

    clock(t: number): number {
        const tBase = this.base.tIntersectingWith(-this.dv, t * Math.sqrt(1 - this.dv ** 2))
        return this.base.clock(tBase)
    }

    fromClock(t: number): number {
        const tBase = this.base.fromClock(t)
        const xBase = this.base.x(tBase)
        return (tBase + this.dv * xBase) / Math.sqrt(1 - this.dv ** 2)
    }
}

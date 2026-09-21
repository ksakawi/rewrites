import { solve } from "../../math/solve"

export abstract class Path {
    abstract x(t: number): number

    /** d/dt x(t). */
    abstract v(t: number): number

    /** int_C^t sqrt(1 - v(t)**2) dt, for some C. Most paths set C to 0. */
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

    tPosition(dx: number) {
        return new TPosition(this, dx)
    }

    tTime(dt: number) {
        return new TTime(this, dt)
    }

    tVelocity(dv: number) {
        return new TVelocity(this, dv)
    }

    switch(at: number, next: Path) {
        return new Switch(this, next, at)
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
    static awayAndBack(a: number, SwitchPoint: number) {
        const base = new Accelerating(a)
        const switchPoint = base.fromClock(SwitchPoint)
        return new Switch(
            new Switch(
                new Switch(
                    new Switch(new Inertial(0), base, 0),
                    new Accelerating(-a).tTime(2 * switchPoint),
                    switchPoint,
                ),
                base.tTime(4 * switchPoint),
                3 * switchPoint,
            ),
            new Inertial(0),
            4 * switchPoint,
        )
    }

    static toVelocity(a: number, v: number) {
        return new Inertial(0)
            .switch(0, new Accelerating(a))
            .switch(new Accelerating(a).tFromV(v), new Inertial(v))
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

    tFromV(v: number): number {
        return Math.atanh(v) / this.a0
    }

    clock(t: number): number {
        return Math.atan(Math.sinh(this.a0 * t)) / this.a0
    }

    fromClock(t: number): number {
        if (Math.abs(t) > Math.PI / (2 * Math.abs(this.a0))) return NaN
        return Math.asinh(Math.tan(this.a0 * t)) / this.a0
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

export class TPosition<T extends Path> extends Path {
    constructor(
        public base: T,
        public dx: number,
    ) {
        super()
    }

    x(t: number): number {
        return this.base.x(t) + this.dx
    }

    v(t: number): number {
        return this.base.v(t)
    }

    clock(t: number): number {
        return this.base.clock(t)
    }

    fromClock(t: number): number {
        return this.base.fromClock(t)
    }

    tIntersectingWith(m: number, b: number): number {
        return this.base.tIntersectingWith(m, b + m * this.dx)
    }
}

export class TTime<T extends Path> extends Path {
    constructor(
        public base: T,
        public dt: number,
    ) {
        super()
    }

    x(t: number): number {
        return this.base.x(t - this.dt)
    }

    v(t: number): number {
        return this.base.v(t - this.dt)
    }

    clock(t: number): number {
        return this.base.clock(t - this.dt)
    }

    fromClock(t: number): number {
        return this.base.fromClock(t) + this.dt
    }

    tIntersectingWith(m: number, b: number): number {
        return this.base.tIntersectingWith(m, b - this.dt) + this.dt
    }
}

export class TVelocity<T extends Path> extends Path {
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

/**
 * Not a real path; it can appear faster than light-speed, and its clock times
 * do not correspond to the integral.
 */
export class SeenFrom<Them extends Path, Us extends Path> extends Path {
    constructor(
        public them: Them,
        public us: Us,
    ) {
        super()
    }

    x(T: number): number {
        const t = this.us.fromClock(T)

        return this.them //
            .tPosition(-this.us.x(t))
            .tTime(-t)
            .tVelocity(-this.us.v(t))
            .x(0)
    }

    v(t: number): number {
        return (this.x(t + 0.001) - this.x(t)) / 0.001
    }

    clock(T: number): number {
        const t = this.us.fromClock(T)

        return this.them //
            .tPosition(-this.us.x(t))
            .tTime(-t)
            .tVelocity(-this.us.v(t))
            .clock(0)
    }

    fromClock(t: number): number {
        return solve(1e-8, (x) => this.clock(x) - t)
    }
}

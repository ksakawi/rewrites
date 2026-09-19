export abstract class Path {
    /** Position of the object at a given global time. */
    abstract x(t: number): number

    /** Equivalent to `d/dt x(t)`. */
    abstract v(t: number): number

    /** Equivalent to `int_0^t (sqrt(1-v(x)^2) dx)`. */
    abstract clock(t: number): number

    /** Inverse of `clock`. */
    abstract fromClock(t: number): number

    /**
     * Plot `(q, this.x(q))` on a graph, then draw a linear
     * light cone at `(t, x)`. This returns a value of `q`
     * such that `(q, this.x(q))` intersects the light
     * cone's boundary.
     *
     * More precisely, let `r` be the returned value. Then
     * either:
     *
     * - `r` is `NaN`
     * - `r <= t` and `this.x(r) == x - (t - r)`
     * - `r <= t` and `this.x(r) == x + (t - r)`
     */
    abstract whenDidLightDepartTo(t: number, x: number): number
}

export class Inertial extends Path {
    constructor(public v0: number) {
        super()
    }

    x(t: number): number {
        return t * this.v0
    }

    v(_t: number): number {
        return this.v0
    }

    a(_t: number): number {
        return 0
    }

    clock(t: number): number {
        return t * Math.sqrt(1 - this.v0 ** 2)
    }

    fromClock(t: number): number {
        return t / Math.sqrt(1 - this.v0 ** 2)
    }

    whenDidLightDepartTo(t: number, x: number): number {
        const t1 = (x - t) / (this.v0 - 1)
        const t2 = (x + t) / (this.v0 + 1)
        return t1 > t ? t2 : t1
    }
}

export class Accelerating extends Path {
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
        return Math.asinh(Math.tan(this.a0 * t)) / this.a0
    }

    whenDidLightDepartTo(t: number, x: number): number {
        const a = this.a0

        const o = x > this.x(t) ? x - t : x + t
        const v = a * o

        const r =
            Math.acosh(
                ((Math.sinh(v / 2) + Math.cosh(v / 2)) * (Math.sinh(v) + 3 * Math.cosh(v) - 2))
                    / (3 * Math.sinh(v / 2) + Math.cosh(v / 2)),
            )
            / (2 * a)

        return r * Math.sign(a) * Math.sign(x > this.x(t) ? t - x : x + t)
    }
}

/**
 * `(t=0, x=base.x(0))` will be shifted to `(t=dt,
 * x=base.x(0)+dx)`.
 */
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

    whenDidLightDepartTo(t: number, x: number): number {
        return this.base.whenDidLightDepartTo(t - this.dt, x - this.dx) + this.dt
    }
}

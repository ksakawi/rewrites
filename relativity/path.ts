export abstract class Path {
    /** Position of the object at a given global time. */
    abstract x(t: number): number

    /** Equivalent to `d/dt x(t)`. */
    abstract v(t: number): number

    /** Equivalent to `int_0^t sqrt(1-v(x)^2) dx`. */
    abstract clock(t: number): number

    /** Inverse of `clock`. */
    abstract fromClock(t: number): number

    /**
     * Equivalent to `int_0^t 1/sqrt(1-v(x)^2) dx`. Used for
     * length contraction. In inertial frames, equal to
     * k`fromClock`.
     */
    abstract contr(t: number): number

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

    clock(t: number): number {
        return t * Math.sqrt(1 - this.v0 ** 2)
    }

    fromClock(t: number): number {
        return t / Math.sqrt(1 - this.v0 ** 2)
    }

    contr(t: number): number {
        return t / Math.sqrt(1 - this.v0 ** 2)
    }

    whenDidLightDepartTo(t: number, x: number): number {
        const t1 = (x - t) / (this.v0 - 1)
        const t2 = (x + t) / (this.v0 + 1)
        return t1 > t ? t2 : t1
    }
}

export class Accelerating extends Path {
    static withInitialVelocity(v0: number, a: number) {
        const base = new Accelerating(a)
        const dt = base.tFromV(v0)
        return new Translate(base, -base.x(dt), -dt)
    }

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
        const clockMax = Math.PI / (2 * Math.abs(this.a0))
        if (t > clockMax || t < -clockMax) return NaN
        return Math.asinh(Math.tan(this.a0 * t)) / this.a0
    }

    contr(t: number): number {
        const a = this.a0
        return (Math.tanh(a * t) * Math.cosh(a * t) ** 2) / a
    }

    whenDidLightDepartTo(t: number, x: number): number {
        const a = this.a0

        const o = x > this.x(t) ? x - t : x + t
        const v = a * o

        const r = Math.acosh(Math.exp(v) + 1 / (4 * Math.exp(v) - 2) - 1 / 2) / (2 * a)

        return r * Math.sign(a) * Math.sign(x > this.x(t) ? t - x : x + t)
    }

    tFromV(v: number): number {
        return Math.atanh(v) / this.a0
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

    contr(t: number): number {
        return this.base.contr(t - this.dt) - this.base.contr(-this.dt)
    }

    whenDidLightDepartTo(t: number, x: number): number {
        return this.base.whenDidLightDepartTo(t - this.dt, x - this.dx) + this.dt
    }
}

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

    contr(t: number): number {
        return t > this.mid ?
                this.b.contr(t) - this.b.contr(this.mid) + this.a.contr(this.mid)
            :   this.a.contr(t)
    }

    whenDidLightDepartTo(t: number, x: number): number {
        const at = this.a.whenDidLightDepartTo(t, x)
        const bt = this.b.whenDidLightDepartTo(t, x + this.b.x(this.mid) - this.a.x(this.mid))
        return at > this.mid ? bt : at
    }
}

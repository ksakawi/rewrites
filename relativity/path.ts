export abstract class Path {
    /** Position of the object at a given global time. */
    abstract x(t: number): number

    /** Equivalent to `d/dt x(t)`. */
    abstract v(t: number): number

    /** Equivalent to `int_0^t (sqrt(1-v(x)^2) dx)`. */
    abstract clock(t: number): number

    /** Inverse of `clock`. */
    abstract fromClock(t: number): number
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
}

export abstract class Path {
    abstract x(t: number): number
    abstract v(t: number): number
    abstract clock(t: number): number
    abstract fromClock(t: number): number
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
        if (Math.abs(t) > Math.PI / (2 * Math.abs(this.a0))) return NaN
        return Math.asinh(Math.tan(this.a0 * t)) / this.a0
    }
}

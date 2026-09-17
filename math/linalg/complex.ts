import { Frac } from "./frac"

export class Complex {
    static ZERO = new Complex(Frac.ZERO, Frac.ZERO)

    static from(value: bigint | Frac | string | Complex) {
        if (value instanceof Complex) return value
        if (value instanceof Frac) return new Complex(value, Frac.ZERO)
        if (typeof value === "bigint") return new Complex(Frac.from(value), Frac.ZERO)

        if (value === "i") return new Complex(Frac.from(0n), Frac.from(1n))
        if (value === "-i") return new Complex(Frac.from(0n), Frac.from(-1n))
        return new Complex(Frac.from(value), Frac.ZERO)
    }

    constructor(
        readonly re: Frac,
        readonly im: Frac,
    ) {}

    add(rhs: Complex): Complex {
        return new Complex(this.re.add(rhs.re), this.im.add(rhs.im))
    }

    sub(rhs: Complex): Complex {
        return new Complex(this.re.sub(rhs.re), this.im.sub(rhs.im))
    }

    neg(): Complex {
        return new Complex(this.re.neg(), this.im.neg())
    }

    mul(rhs: Complex): Complex {
        const { re: a, im: b } = this
        const { re: c, im: d } = rhs

        return new Complex(a.mul(c).sub(b.mul(d)), a.mul(d).add(b.mul(c)))
    }

    inv(): Complex {
        const denom = this.re.mul(this.re).add(this.im.mul(this.im))
        return new Complex(this.re.div(denom), this.im.neg().div(denom))
    }

    div(rhs: Complex): Complex {
        return this.mul(rhs.inv())
    }

    zero(): boolean {
        return this.re.zero() && this.im.zero()
    }

    toString() {
        if (this.im.zero()) return this.re.toString()

        const im =
            this.im.eq(Frac.from(1n)) ? "i"
            : this.im.eq(Frac.from(-1n)) ? "-i"
            : this.im.toString() + "i"

        if (this.re.zero()) return im

        return this.re.toString() + (im.startsWith("-") ? "" : "+") + im
    }
}

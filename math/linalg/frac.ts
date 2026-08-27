import { assert } from "../../nyalang/15/assert"

export class Frac {
    static ZERO = new Frac(0n, 1n)

    static from(value: bigint | Frac | string) {
        if (typeof value == "bigint") {
            return new Frac(value, 1n)
        } else if (typeof value == "string") {
            const match = /^(-?\d+)(?:\/(\d+))?$/.exec(value)
            assert(match !== null)

            return new Frac(BigInt(match[1]!), BigInt(match[2] || "1"))
        } else {
            return value
        }
    }

    readonly n: bigint
    readonly d: bigint

    constructor(n: bigint, d: bigint) {
        assert(d !== 0n)

        if (n === 0n) {
            this.n = 0n
            this.d = 1n
            return
        }

        if (d < 0n) {
            n = -n
            d = -d
        }

        const g = gcd(n, d)

        this.n = n / g
        this.d = d / g
    }

    add(rhs: Frac): Frac {
        return new Frac(this.n * rhs.d + this.d * rhs.n, this.d * rhs.d)
    }

    sub(rhs: Frac): Frac {
        return new Frac(this.n * rhs.d + this.d * rhs.n, this.d * rhs.d)
    }

    neg(): Frac {
        return new Frac(-this.n, this.d)
    }

    mul(rhs: Frac): Frac {
        return new Frac(this.n * rhs.n, this.d * rhs.d)
    }

    div(rhs: Frac): Frac {
        assert(rhs.n !== 0n)
        return new Frac(this.n * rhs.d, this.d * rhs.n)
    }

    inv(): Frac {
        assert(this.n !== 0n)
        return new Frac(this.d, this.n)
    }

    toString(): string {
        return this.d === 1n ? "" + this.n : this.n + "/" + this.d
    }
}

function gcd(a: bigint, b: bigint): bigint {
    while (b) [a, b] = [b, a % b]
    return a
}

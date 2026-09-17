import { assert } from "../../nyalang/15/assert"
import { Frac } from "./frac"

export type Log =
    | { k: "rowAddInto"; v: { src: number; scale: Frac; dst: number } }
    | { k: "rowSwap"; v: { a: number; b: number } }
    | { k: "rowScale"; v: { row: number; scale: Frac } }

export class Matrix {
    static from(body: TemplateStringsArray) {
        const source = body[0]!

        const data = source
            .split("\n")
            .map((x) => x.trim())
            .filter((x) => x)
            .map((x) => x.split(/\s+/g).map((el) => Frac.from(el)))

        return new Matrix(data.length, data[0]!.length, data.flat())
    }

    static zero(rows: number, cols: number): Matrix {
        return new Matrix(rows, cols, Array.from<Frac>({ length: rows * cols }).fill(Frac.ZERO))
    }

    static id(size: number): Matrix {
        const ret = Matrix.zero(size, size)
        for (let i = 0; i < size; i++) {
            ret.set(i, i, Frac.from(1n))
        }
        return ret
    }

    static joinIntoWider(A: Matrix, B: Matrix): Matrix {
        assert(A.rows === B.rows)
        const ret = Matrix.zero(A.rows, A.cols + B.cols)
        for (let r = 0; r < ret.rows; r++) {
            for (let c = 0; c < ret.cols; c++) {
                if (c < A.cols) {
                    ret.set(r, c, A.get(r, c))
                } else {
                    ret.set(r, c, B.get(r, c - A.cols))
                }
            }
        }
        return ret
    }

    readonly log: Log[] = []

    constructor(
        readonly rows: number,
        readonly cols: number,
        readonly data: Frac[], // row-contiguous format
    ) {
        assert(data.length === rows * cols)
    }

    get(row: number, col: number): Frac {
        assert(0 <= row && row < this.rows)
        assert(0 <= col && col < this.cols)
        return this.data[row * this.cols + col]!
    }

    set(row: number, col: number, value: Frac) {
        assert(0 <= row && row < this.rows)
        assert(0 <= col && col < this.cols)
        this.data[row * this.cols + col] = value
    }

    rowAddInto(src: number, scale: Frac, dst: number) {
        assert(0 <= src && src < this.rows)
        assert(0 <= dst && dst < this.rows)
        assert(src !== dst)
        this.log.push({ k: "rowAddInto", v: { src, scale, dst } })

        for (let col = 0; col < this.cols; col++) {
            this.set(dst, col, this.get(src, col).mul(scale).add(this.get(dst, col)))
        }
    }

    rowSwap(a: number, b: number) {
        assert(0 <= a && a < this.rows)
        assert(0 <= b && b < this.rows)
        assert(a !== b)
        this.log.push({ k: "rowSwap", v: { a, b } })

        for (let col = 0; col < this.cols; col++) {
            const temp = this.get(a, col)
            this.set(a, col, this.get(b, col))
            this.set(b, col, temp)
        }
    }

    rowScale(row: number, scale: Frac) {
        assert(scale.d !== 0n)
        this.log.push({ k: "rowScale", v: { row, scale } })

        for (let col = 0; col < this.cols; col++) {
            this.set(row, col, this.get(row, col).mul(scale))
        }
    }

    rowNullify(src: number, col: number, dst: number) {
        assert(0 <= src && src < this.rows)
        assert(0 <= dst && dst < this.rows)
        assert(0 <= col && col < this.cols)
        assert(src !== dst)

        if (this.get(dst, col).zero()) {
            return
        }

        this.rowAddInto(src, this.get(dst, col).div(this.get(src, col)).neg(), dst)
    }

    rowScaleTo1(row: number, col: number) {
        assert(0 <= row && row < this.rows)
        assert(0 <= col && col < this.cols)
        assert(!this.get(row, col).zero())
        this.rowScale(row, this.get(row, col).inv())
    }

    nullifyAllRowsBelow(row: number, col: number) {
        for (let i = row + 1; i < this.rows; i++) {
            if (this.get(i, col).zero()) continue
            this.rowNullify(row, col, i)
        }
    }

    nullifyAllRowsAbove(row: number, col: number) {
        for (let i = row - 1; i >= 0; i--) {
            if (this.get(i, col).zero()) continue
            this.rowNullify(row, col, i)
        }
    }

    mul(rhs: Matrix): Matrix {
        assert(this.cols == rhs.rows)

        const ret = Matrix.zero(this.rows, this.cols)

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < rhs.cols; c++) {
                let total = Frac.ZERO
                for (let i = 0; i < this.cols; i++) {
                    total = total.add(this.get(r, i).mul(rhs.get(i, c)))
                }
                ret.set(r, c, total)
            }
        }

        return ret
    }

    sliceCols(min: number, max: number) {
        assert(0 <= min && min <= this.cols)
        assert(0 <= max && max <= this.cols)
        assert(min <= max)
        const ret = Matrix.zero(this.rows, max - min)
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < max - min; c++) {
                ret.set(r, c, this.get(r, c + min))
            }
        }
        return ret
    }

    toString() {
        const rows: string[] = Array.from<string>({ length: this.rows }).fill("")

        for (let col = 0; col < this.cols; col++) {
            const colAsText = Array.from({ length: this.rows }, (_, row) =>
                this.get(row, col).toString(),
            )
            const len = colAsText.reduce((a, b) => Math.max(a, b.length), 0)
            colAsText.forEach((text, row) => (rows[row] += text.padStart(len) + "  "))
        }

        return rows.map((x) => x.trimEnd()).join("\n")
    }
}

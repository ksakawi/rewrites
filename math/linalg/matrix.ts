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
            this.set(
                dst,
                col,
                this.get(src, col).mul(scale).add(this.get(dst, col)),
            )
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

        this.rowAddInto(
            src,
            this.get(dst, col).div(this.get(src, col)).neg(),
            dst,
        )
    }

    toString() {
        const rows: string[] = Array.from<string>({ length: this.rows }).fill(
            "",
        )

        for (let col = 0; col < this.cols; col++) {
            const colAsText = Array.from({ length: this.rows }, (_, row) =>
                this.get(row, col).toString(),
            )
            const len = colAsText.reduce((a, b) => Math.max(a, b.length), 0)
            colAsText.forEach(
                (text, row) => (rows[row] += text.padStart(len) + "  "),
            )
        }

        return rows.map((x) => x.trimEnd()).join("\n")
    }
}

import type { Canvas2 } from "../2d/canvas"
import { apply2x, apply2y } from "../2d/tform"

const BLACK = "#0f172a"

// false == .orange
// true  == .pomelo
export type Fruit = boolean

export class Game {
    readonly nodes: Node[] = []

    push(x: number, y: number): Node {
        return new Node(this, x, y)
    }

    draw(cv: Canvas2) {
        cv.ctx.font = -0.5 * cv.tlo.sy + "px sans-serif"
        cv.ctx.fillStyle = BLACK
        cv.ctx.strokeStyle = BLACK
        cv.ctx.lineWidth = -0.1 * cv.tlo.sy
        cv.ctx.lineCap = "round"

        for (const el of this.nodes) {
            const ox = el.ox(cv)
            const oy = el.oy(cv)

            if (el.fruit !== null) {
                const angle = el.textAngle()
                const ax = -0.3 * Math.cos(angle) * cv.tlo.sx
                const ay = -0.3 * Math.sin(angle) * cv.tlo.sy

                cv.ctx.lineWidth = -0.05 * cv.tlo.sy
                cv.ctx.beginPath()
                if (el.fruit) {
                    const len = 0.25 * cv.tlo.sy

                    cv.ctx.save()
                    cv.ctx.translate(ox + ax, oy + ay - len / 2)
                    cv.ctx.moveTo(0, 0)
                    cv.ctx.lineTo(0, len)
                    cv.ctx.restore()
                } else {
                    cv.ctx.ellipse(
                        ox + ax,
                        oy + ay,
                        -0.12 * cv.tlo.sy,
                        -0.12 * cv.tlo.sy,
                        0,
                        0,
                        2 * Math.PI,
                    )
                }
                cv.ctx.stroke()
                cv.ctx.lineWidth = -0.1 * cv.tlo.sy
            }

            cv.ctx.beginPath()

            if (el.edges.length === 0) {
                const r = -0.1 * cv.tlo.sy
                cv.ctx.ellipse(ox, oy, r, r, 0, 0, 2 * Math.PI)
                cv.ctx.fill()
                continue
            }

            for (const outer of el.edges) {
                if (el.index <= outer) continue
                cv.ctx.moveTo(ox, oy)
                cv.ctx.lineTo(this.nodes[outer]!.ox(cv), this.nodes[outer]!.oy(cv))
            }

            cv.ctx.stroke()
        }
    }

    addTo(cv: Canvas2) {
        cv.push(this)
    }
}

export class Node {
    readonly index
    readonly edges: number[] = []
    public fruit: Fruit | null = null

    constructor(
        readonly game: Game,
        readonly x: number,
        readonly y: number,
    ) {
        this.index = game.nodes.length
        game.nodes.push(this)
    }

    set(fruit: Fruit | null) {
        this.fruit = fruit
        return this
    }

    ox(cv: Canvas2) {
        return apply2x(cv.tlo, this.x)
    }

    oy(cv: Canvas2) {
        return apply2y(cv.tlo, this.y)
    }

    join(target: Node) {
        this.edges.push(target.index)
        target.edges.push(this.index)
    }

    push(x: number, y: number): Node {
        const next = this.game.push(x, y)
        this.join(next)
        return next
    }

    line(count: number, angle1 = -30, angle2 = 30): Node {
        if (count < 0) {
            count = -count
            angle1 = 180 - angle1
            angle2 = 180 - angle2
        }

        angle1 = (angle1 * Math.PI) / 180
        angle2 = (angle2 * Math.PI) / 180

        let base: Node = this

        for (let i = 0; i < count; i++) {
            const angle = i % 2 ? angle2 : angle1
            base = base.push(base.x + Math.cos(angle), base.y - Math.sin(angle))
        }

        return base
    }

    fork(...f: ((self: Node) => void)[]): Node {
        for (const el of f) {
            el(this)
        }

        return this
    }

    loop(count: number, initialAngle = 0, delta = 360 / count): Node {
        initialAngle *= Math.PI / 180
        delta *= Math.PI / 180

        let base: Node = this

        for (let i = 1; i < count; i++) {
            base = base.push(
                base.x + Math.cos(initialAngle + delta * (i - 1)),
                base.y + Math.sin(initialAngle + delta * (i - 1)),
            )
        }

        this.join(base)
        return this
    }

    n12(n: number): Node {
        return this.fork(
            (x) => x.line(n).set(false),
            (x) => x.line(-2).set(false),
            (x) => x.line(1, 90).set(false),
        )
    }

    /** Angle from `this` to `game.nodes[index]`. */
    private angleTo(index: number): number {
        const other = this.game.nodes[index]!
        return Math.atan2(other.y - this.y, other.x - this.x)
    }

    /** Sum of differences between `angle` and angle to each adjacent node. */
    angleDifferenceSum(angle: number): number {
        let sum = 0

        for (const el of this.edges) {
            sum += angleDifference(angle, this.angleTo(el))
        }

        return sum
    }

    textAngle(): number {
        if (this.edges.length === 0) {
            return -Math.PI / 2
        }

        if (this.edges.length === 1) {
            return this.angleTo(this.edges[0]!)
        }

        if (this.edges.length === 2) {
            return angleAverage(this.angleTo(this.edges[0]!), this.angleTo(this.edges[1]!))
        }

        return Math.PI / 2
    }
}

function angleDifference(a: number, b: number) {
    const diff = Math.max(a, b) - Math.min(a, b)
    if (diff > Math.PI) return 2 * Math.PI - diff // e.g. pi to -pi
    return diff
}

function angleAverage(a: number, b: number) {
    const ret = (a + b) / 2 + (Math.abs(a - b) < Math.PI ? 0 : Math.PI)
    if (ret > Math.PI) return ret - 2 * Math.PI
    return ret
}

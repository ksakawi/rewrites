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

        for (const el of this.nodes) {
            console.log(el)
            cv.ctx.beginPath()

            const ox = el.ox(cv)
            const oy = el.oy(cv)

            if (el.edges.length === 0) {
                cv.ctx.fillStyle = BLACK
                const r = -0.1 * cv.tlo.sy
                cv.ctx.ellipse(ox, oy, r, r, 0, 0, 2 * Math.PI)
                cv.ctx.fill()

                if (el.fruit !== null) {
                    cv.ctx.textBaseline = "bottom"
                    cv.ctx.textAlign = "center"
                    cv.ctx.fillText(el.fruit ? "I" : "O", ox, oy + 0.1 * cv.tlo.sy)
                }

                continue
            }

            cv.ctx.strokeStyle = BLACK
            cv.ctx.lineWidth = -0.1 * cv.tlo.sy
            cv.ctx.lineCap = "round"

            for (const outer of el.edges) {
                if (el.index <= outer) continue
                cv.ctx.moveTo(ox, oy)
                cv.ctx.lineTo(this.nodes[outer]!.ox(cv), this.nodes[outer]!.oy(cv))
            }

            cv.ctx.stroke()
        }
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

    line(count: number, angle1 = 30, angle2 = -30): Node {
        angle1 = (angle1 * Math.PI) / 180
        angle2 = (angle2 * Math.PI) / 180

        let base: Node = this

        for (let i = 0; i < count; i++) {
            const angle = i % 2 ? angle2 : angle1
            base = base.push(base.x + Math.cos(angle), base.y + Math.sin(angle))
        }

        return base
    }
}

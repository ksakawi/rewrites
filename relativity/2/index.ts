import { Grid } from "../../cv/2/2d-object/grid"
import { Slider } from "../../cv/2/2d-object/slider"
import { Canvas2 } from "../../cv/2/2d/canvas"
import { apply2x, apply2y } from "../../cv/2/2d/tform"
import { Style } from "./config"
import { DrawnPath } from "./draw"
import { Accelerating, Inertial, Shift } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 5 })
cv.push(new Grid())
cv.el.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const pInertial = new Shift(new Inertial(0), 0)
const pAwayAndBack = new Shift(Accelerating.awayAndBack(0.9, 12), 0)

cv.push(new DrawnPath(pInertial, new Style("blue", "left")))
cv.push(new DrawnPath(pAwayAndBack, new Style("green", "right")))

const mr = new Slider()
const m = () => mr.v * 2 - 1

const br = new Slider()
const b = () => br.v * 20 - 10
br.insetY = mr.insetY + mr.height + 4

cv.pushFn(() => {
    cv.debug({ m: m(), b: b() })

    const x1 = apply2x(cv.tol, 0)
    const y1 = m() * x1 + b()

    const x2 = apply2x(cv.tol, cv.width)
    const y2 = m() * x2 + b()

    cv.ctx.beginPath()
    cv.ctx.lineWidth = 1
    cv.ctx.strokeStyle = "black"
    cv.ctx.moveTo(0, apply2y(cv.tlo, y1))
    cv.ctx.lineTo(cv.width, apply2y(cv.tlo, y2))

    for (const p of [pAwayAndBack, pInertial]) {
        const t = p.tIntersectingWith(m(), b())
        const x = p.x(t)

        const ox = apply2x(cv.tlo, x)
        const oy = apply2y(cv.tlo, t)

        cv.ctx.moveTo(ox + 8, oy)
        cv.ctx.ellipse(ox, oy, 8, 8, 0, 0, 2 * Math.PI)
    }

    cv.ctx.stroke()
})

cv.push(mr)
cv.push(br)

const q = new Slider(() => {
    pAwayAndBack.dv = pInertial.dv = Math.tanh(2 * q.v - 1)
})
q.v = 0.5
q.insetY = br.insetY + br.height + 4
cv.push(q)

import { Grid } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { apply2x, apply2y } from "../cv/2/2d/tform"
import { LinearCone } from "./cone"
import { drawPath } from "./draw"
import { Accelerating, Inertial, Translate } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 10 })
cv.push(new Grid())
cv.el.style = "position: fixed; inset: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const a = new Inertial(-0.5)
const b = new Translate(new Accelerating(0.05), 2, 5)

cv.adopt(a, (cv, path) => drawPath(cv, path, "blue", "right"))
cv.adopt(b, (cv, path) => drawPath(cv, path, "green", "left"))

const cone = new LinearCone()
cone.x = 2
cone.y = 20
cv.push(cone)

cv.pushFn(({ ctx, tlo }) => {
    const t = b.whenDidLightDepartTo(cone.y, cone.x)
    const x = b.x(t)

    const ox = apply2x(tlo, x)
    const oy = apply2y(tlo, t)

    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.ellipse(ox, oy, 3, 3, 0, 0, 2 * Math.PI)
    ctx.stroke()
})

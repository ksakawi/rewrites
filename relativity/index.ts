import { Grid } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { apply2x, apply2y } from "../cv/2/2d/tform"
import { LinearCone } from "./cone"
import { drawPath } from "./draw"
import { Accelerating, Inertial, Switch } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 10 })
cv.push(new Grid())
cv.el.style = "position: fixed; inset: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const a = new Switch(new Inertial(-0.5), new Accelerating(0.05), 10)
const b = Accelerating.withInitialVelocity(0.5, 0.03)

console.log(a.fromClock(35))
cv.adopt(a, (cv, path) => drawPath(cv, path, "blue", "left"))
cv.adopt(b, (cv, path) => drawPath(cv, path, "green", "left"))

const cone = new LinearCone()
cone.x = 2
cone.y = 20
cv.push(cone)

cv.pushFn(({ ctx, tlo }) => {
    const t = a.whenDidLightDepartTo(cone.y, cone.x)
    const x = a.x(t)

    const ox = apply2x(tlo, x)
    const oy = apply2y(tlo, t)

    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.ellipse(ox, oy, 3, 3, 0, 0, 2 * Math.PI)
    ctx.stroke()
})

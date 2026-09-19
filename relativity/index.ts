import { Grid } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { LinearCone } from "./cone"
import { drawPath } from "./draw"
import { Accelerating, Inertial } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 10 })
cv.push(new Grid())
cv.el.style = "position: fixed; inset: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const a = new Inertial(-0.5)
const b = new Accelerating(0.05)

cv.adopt(a, (cv, path) => drawPath(cv, path, "blue", "right"))
cv.adopt(b, (cv, path) => drawPath(cv, path, "green", "left"))

const cone = new LinearCone()
cone.xFromY = (t) => b.x(t)
cv.push(cone)

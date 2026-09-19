import { Grid } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { LinearCone } from "./cone"
import { drawNormal } from "./draw-normal"
import { drawViewedFrom } from "./draw-viewed-from"
import { Accelerating, Inertial } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 10 })
cv.push(new Grid())
cv.el.style = "position: fixed; inset: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const moving = Accelerating.awayAndBack(0.05, 50)
const earth = new Inertial(0)

cv.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))
cv.adopt(earth, (cv, path) => drawNormal(cv, path, "blue", "right"))
cv.adopt(moving, (cv, path) => drawNormal(cv, path, "green", "left"))
cv.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))

cv.push(new LinearCone())

cv.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))
cv.adopt(new Inertial(0), (cv, path) => drawNormal(cv, path, "green", "left"))
cv.pushFn((cv) => drawViewedFrom(cv, moving, earth, "blue"))
cv.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))

// green at 7.0000 (x=9.0401) sees blue at 3.2998 (x=4.2365)
// distance is 4.8036 raw
// which is 4.8036*sqrt(1-.5*.5)=4.1600396296

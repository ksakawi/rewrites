import { Grid } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { LinearCone } from "./cone"
import { Config } from "./config"
import { drawNormal } from "./draw-normal"
import { drawAsSeenFrom } from "./draw-viewed-from"
import { Accelerating, Inertial } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 10 })
cv.push(new Grid({ yText: false }))
cv.el.style = "position: fixed; inset: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const moving = Accelerating.awayAndBack(0.5, 12)
const earth = new Inertial(0)

const blue = new Config("blue", "right")
const green = new Config("green", "left")

cv.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))
cv.adopt(earth, (cv, path) => drawNormal(cv, path, blue))
cv.adopt(moving, (cv, path) => drawNormal(cv, path, green))
cv.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))

const cone = new LinearCone()
cv.push(cone)

cv.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))
cv.adopt(new Inertial(0), (cv, path) => drawNormal(cv, path, green))
cv.pushFn((cv) => drawAsSeenFrom(cv, moving, earth, blue))
cv.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))

cv.adopt(new Inertial(0), (cv, path) => drawNormal(cv, path, blue))
cv.pushFn((cv) => drawAsSeenFrom(cv, earth, moving, green))

console.log(moving.whenDidLightDepartTo(4, 0))

// green at 7.0000 (x=9.0401) sees blue at 3.2998 (x=4.2365)
// distance is 4.8036 raw
// which is 4.8036*sqrt(1-.5*.5)=4.1600396296

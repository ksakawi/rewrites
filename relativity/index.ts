import { Grid } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { LinearCone } from "./cone"
import { Config } from "./config"
import { drawNormal } from "./draw-normal"
import { drawAsSeenFrom } from "./draw-viewed-from"
import { Accelerating, Inertial, Translate } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 10 })
cv.push(new Grid({ yText: false }))
cv.el.style = "position: fixed; inset: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const moving = Accelerating.awayAndBack(0.5, 12)
const earth = new Translate(new Inertial(0), 5, 0)

const blue = new Config("blue", "right")
const green = new Config("green", "left")

cv.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))
cv.adopt(earth, (cv, path) => drawNormal(cv, path, blue))
cv.adopt(moving, (cv, path) => drawNormal(cv, path, green))
cv.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))

const cone1 = new LinearCone(-Infinity, 1, (t) => {
    cone2.y = moving.fromClock(t)
    cone2.x = moving.x(cone2.y) + 5
    return -5
})
const cone2 = new LinearCone(4, Infinity, (t) => {
    cone1.y = moving.clock(t)
    return moving.x(t) + 5
})
cv.push(cone1)
cv.push(cone2)

cv.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))
cv.adopt(new Inertial(0), (cv, path) => drawNormal(cv, path, green))
cv.pushFn((cv) => drawAsSeenFrom(cv, moving, earth, true, blue))
cv.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))

// cv.adopt(new Inertial(0), (cv, path) => drawNormal(cv, path, green))
// cv.pushFn((cv) => drawAsSeenFrom(cv, moving, earth, true, blue))

console.log(moving.whenDidLightDepartTo(4, 0))

// green at 7.0000 (x=9.0401) sees blue at 3.2998 (x=4.2365)
// distance is 4.8036 raw
// which is 4.8036*sqrt(1-.5*.5)=4.1600396296

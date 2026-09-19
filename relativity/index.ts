import { Grid } from "../cv/2/2d-object/grid"
import { Canvas2 } from "../cv/2/2d/canvas"
import { createDualCone } from "./cone"
import { Config } from "./config"
import { drawNormal } from "./draw-normal"
import { drawAsSeenFrom } from "./draw-viewed-from"
import { Accelerating, Inertial } from "./path"

const cv1 = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 5 })
cv1.push(new Grid({ yText: false }))
cv1.el.style =
    "position: fixed; top: 0; left: 0; width: 100vw; height: 50vh; border-bottom: 1px solid black"
document.body.appendChild(cv1.el)

const cv2 = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 5 })
cv2.push(new Grid({ yText: false }))
cv2.el.style =
    "position: fixed; top: calc(50vh + 1px); left: 0; width: 100vw; height: calc(50vh - 1px); border-bottom: 1px solid black"
document.body.appendChild(cv2.el)

cv1.handleEvent = cv2.handleEvent = (ev) => {
    Canvas2.prototype.handleEvent.call(cv1, ev)
    Canvas2.prototype.handleEvent.call(cv2, ev)
}

const stationary = new Inertial(0)
const inertial = new Inertial(0.5)
const spaceship = Accelerating.awayAndBack(0.3, 12)

const blue = new Config("blue", "right")
const green = new Config("green", "left")
const red = new Config("red", "left")

createDualCone(cv1, inertial, -5, 5)
cv1.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))
cv1.adopt(stationary, (cv, path) => drawNormal(cv, path, blue))
cv1.adopt(inertial, (cv, path) => drawNormal(cv, path, green))
cv1.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))
cv1.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))
cv1.pushFn((cv) => drawNormal(cv, stationary, green))
cv1.pushFn((cv) => drawAsSeenFrom(cv, inertial, stationary, true, blue))
cv1.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))

createDualCone(cv2, spaceship, -5, 5)
cv2.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))
cv2.adopt(stationary, (cv, path) => drawNormal(cv, path, blue))
cv2.adopt(spaceship, (cv, path) => drawNormal(cv, path, red))
cv2.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))
cv2.pushFn((cv) => cv.ctx.translate(-5 * cv.tlo.sx, 0))
cv2.pushFn((cv) => drawNormal(cv, stationary, red))
cv2.pushFn((cv) => drawAsSeenFrom(cv, spaceship, stationary, true, blue))
cv2.pushFn((cv) => cv.ctx.translate(5 * cv.tlo.sx, 0))

import { Grid } from "../../cv/2/2d-object/grid"
import { Slider } from "../../cv/2/2d-object/slider"
import { Canvas2 } from "../../cv/2/2d/canvas"
import { Style } from "./config"
import { DrawnPath } from "./draw"
import { Accelerating, Inertial, SeenFrom, TranslateStableClock } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 5 })
cv.push(new Grid({ yText: false, yAxis: false }))
cv.el.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const bInertial = new Inertial(0)
const bAwayAndBack = Accelerating.awayAndBack(0.5, 4 * new Accelerating(0.5).fromClock(3))

const pInertial = bInertial.translateStableClock(0, 0).shift(0)
const pAwayAndBack = bAwayAndBack.translateStableClock(0, 0).shift(0)

const bSeen = new SeenFrom(bInertial, bAwayAndBack).translateStableClock(0, 0)

cv.push(new DrawnPath(pInertial, new Style("blue", "left")))
cv.push(new DrawnPath(pAwayAndBack, new Style("green", "right")))
cv.push(new DrawnPath(bSeen, new Style("red", "left")))

console.log(bSeen.base.clock(3))

cv.push(
    new Slider(({ v }) => {
        const T = v * 10
        const t = bAwayAndBack.fromClock(T)
        pInertial.base.dt = pAwayAndBack.base.dt = -t
        pInertial.base.dx = pAwayAndBack.base.dx = -bAwayAndBack.x(t)
        pInertial.dv = pAwayAndBack.dv = -bAwayAndBack.v(t)
        bSeen.dt = -T
        console.log(pInertial.clock(0))
    }),
)

import { Grid } from "../../cv/2/2d-object/grid"
import { Slider } from "../../cv/2/2d-object/slider"
import { Canvas2 } from "../../cv/2/2d/canvas"
import { Style } from "./config"
import { DrawnPath } from "./draw"
import { Accelerating, Inertial } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 5 })
cv.push(new Grid())
cv.el.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const pAwayAndBack = Accelerating.awayAndBack(0.9, 12)
const pInertial = new Inertial(-0.3)

cv.push(new DrawnPath(pInertial, new Style("blue", "left")))
cv.push(new DrawnPath(pAwayAndBack, new Style("green", "right")))

const q = new Slider()
cv.push(q)

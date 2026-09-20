import { Grid } from "../../cv/2/2d-object/grid"
import { Slider } from "../../cv/2/2d-object/slider"
import { Canvas2 } from "../../cv/2/2d/canvas"
import { Style } from "./config"
import { drawPath, drawPathTickLabels, drawPathTicks } from "./draw"
import { Accelerating } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 5 })
cv.push(new Grid())
cv.el.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const path = Accelerating.awayAndBack(0.9, 12)
const style = new Style("green", "left")
cv.pushFn((cv) => drawPath(cv, path, style))
cv.pushFn((cv) => drawPathTicks(cv, path, style))
cv.pushFn((cv) => drawPathTickLabels(cv, path, style))

const q = new Slider()
cv.push(q)

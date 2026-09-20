import { Grid } from "../../cv/2/2d-object/grid"
import { Slider } from "../../cv/2/2d-object/slider"
import { Canvas2 } from "../../cv/2/2d/canvas"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 5 })
cv.push(new Grid({ yText: false }))
cv.el.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const q = new Slider()
cv.push(q)

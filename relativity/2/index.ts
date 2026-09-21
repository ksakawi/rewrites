import { Grid } from "../../cv/2/2d-object/grid"
import { Slider } from "../../cv/2/2d-object/slider"
import { Canvas2 } from "../../cv/2/2d/canvas"
import { Style } from "./config"
import { DrawnPath } from "./draw"
import { Accelerating, Inertial, Path, SeenFrom } from "./path"

const cv = new Canvas2({ sx: 10, sy: 10, tx: 0, ty: 5 })
cv.push(new Grid({ yText: false, yAxis: false }))
cv.el.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
document.body.appendChild(cv.el)

const us = Accelerating.awayAndBack(0.5, 2.9)

const OBJECTS: [path: Path, live: Style, static_: Style][] = [
    [us, new Style("green", "right"), new Style("#4c4", "right")],
    [new Inertial(0), new Style("blue", "right"), new Style("#4cc", "right")],
]

const LIVE = OBJECTS.map((obj) => obj[0].tPosition(0).tTime(0).tVelocity(0))
const STATIC = OBJECTS.map((obj) => new SeenFrom(obj[0], us).tTime(0))

for (let i = 0; i < OBJECTS.length; i++) {
    cv.push(new DrawnPath(LIVE[i]!, OBJECTS[i]![1]))
    cv.push(new DrawnPath(STATIC[i]!, OBJECTS[i]![2]))
}

const slider = new Slider(({ v }) => {
    const T = v * 14 - 1
    const t = us.fromClock(T)

    for (const el of LIVE) {
        el.base.base.dx = -us.x(t)
        el.base.dt = -t
        el.dv = -us.v(t)
    }

    for (const el of STATIC) {
        el.dt = -T
    }
})

cv.push(slider)

const stream = cv.el.captureStream()
const recorder = new MediaRecorder(stream)
recorder.start()
recorder.ondataavailable = (ev) => {
    const url = URL.createObjectURL(ev.data)
    console.log(url)
}

const time = performance.now()
requestAnimationFrame(function go(now) {
    slider.v = (now - time) / 14000
    slider.onChange?.(slider)
    cv.redraw()
    if (slider.v > 1) {
        recorder.stop()
        return
    }
    requestAnimationFrame(go)
})

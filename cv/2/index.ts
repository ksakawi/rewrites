import { Grid } from "./2d-object/grid"
import { Relativistic } from "./2d-object/relativistic"
import { Canvas2 } from "./2d/canvas"

const cv = new Canvas2({ sx: 20, sy: 20, tx: 0, ty: 0 })

document.body.appendChild(cv.el)

cv.push(new Grid({ yText: false }))

cv.push(new Relativistic("black", () => 0))
cv.push(new Relativistic("red", (t) => 4 * Math.sin(0.25 * t)))
cv.push(new Relativistic("blue", (t) => -0.5 * t))
cv.push(
    new Relativistic(
        "green",
        (t, lastX, dt) => lastX + dt * product(0.01, t / 0.1),
    ),
)

function product(v: number, n: number): number {
    let a = 0

    for (let i = 0; i < n; i++) {
        a = (a + v) / (1 + a * v)
    }

    return a
}

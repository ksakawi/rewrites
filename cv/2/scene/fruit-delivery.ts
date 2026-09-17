import { Game } from "../2d-object/fruit-delivery"
import { Canvas2 } from "../2d/canvas"

const cv = new Canvas2({ sx: 20, sy: 20, tx: 0, ty: 0 })
cv.pushFn(() => {
    cv.ctx.fillStyle = "#e2e8f0"
    cv.ctx.fillRect(0, 0, cv.width, cv.height)
})
document.body.appendChild(cv.el)

const game = new Game()

const base = game.push(0, 0)

base.line(5).set(false)
base.line(2, 150, -150).set(false)
base.line(1, -90).set(false)

cv.push(game)

import { Game } from "../2d-object/fruit-delivery"
import { Canvas2 } from "../2d/canvas"

const cv = new Canvas2({ sx: 20, sy: 20, tx: 0, ty: 0 })
cv.pushFn(() => {
    cv.ctx.fillStyle = "#e2e8f0"
    cv.ctx.fillRect(0, 0, cv.width, cv.height)
})
document.body.appendChild(cv.el)

const game = new Game()
game.push(0, 0).line(5).fruit
game.push(0, 5).fruit = true
game.push(0, -5).fruit = false
cv.push(game)

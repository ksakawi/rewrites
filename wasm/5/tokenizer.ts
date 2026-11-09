import { randomItem } from "../../random-item"
import source from "./tokenizer.wasm"

const mod = new WebAssembly.Module(await Bun.file(source).bytes())

const memory = new WebAssembly.Memory({ initial: 0 })

const inst = new WebAssembly.Instance(mod, {
    env: {
        regex_get_last_index(regex) {
            return regex.lastIndex
        },

        regex_set_last_index(regex, lastIndex) {
            regex.lastIndex = lastIndex
        },

        regex_test(regex, source) {
            return regex.test(source)
        },

        regex_construct(source, flags) {
            return new RegExp(source, flags)
        },

        str_length(source) {
            return source.length
        },

        str_char_code_at(source, index) {
            return source.charCodeAt(index)
        },

        regex_numeric_digits: /\d+/y,

        regex_identifier: /[A-Za-z_]\w*/y,

        memory,
    },
})

let text = ""
for (let i = 0; i < 1e2; i++) {
    text += Array.from({ length: Math.floor(Math.random() * 8) }, () =>
        randomItem(" \t\n&*%@$%!!)("),
    ).join("")

    text +=
        randomItem("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_")
        + Array.from({ length: Math.floor(Math.random() * 32) }, () =>
            randomItem("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789"),
        )
}

console.time()
console.log(inst.exports.tokenize(text))
console.timeEnd()

/**
 * Complete deterministic finite-state automaton.
 *
 * Start node is state zero.
 */
export class DFA {
    constructor(
        readonly states: number,
        readonly chars: number,
    ) {
        this.transitions = Array.from<number>({ length: this.states * this.chars }).fill(0)
        this.accepts = Array.from<boolean>({ length: this.states }).fill(false)
    }

    /**
     * A map from (states × chars) -> states. Each input state is a contiguous
     * sequence of elements.
     *
     * For example, in a DFA with 3 states and 2 chars, each index of
     * `transitions` specifies:
     *
     * 0. state 0 + char 0 maps where?
     * 1. state 0 + char 1 maps where?
     * 2. state 1 + char 0 maps where?
     *
     * ... and so on.
     */
    readonly transitions: number[]

    readonly accepts: boolean[]

    toString() {
        let text = ""
        for (let state = 0; state < this.states; state++) {
            if (state != 0) text += "\n"
            text += "["
            text += this.accepts[state] ? "x" : " "
            text += "] "
            text += state
            text += ": "
            for (let char = 0; char < this.chars; char++) {
                if (char != 0) text += ", "
                text += String.fromCharCode("a".charCodeAt(0) + char)
                text += "->"
                text += this.transitions[state * this.chars + char]
            }
        }
        return text
    }
}

console.log(new DFA(3, 1).toString())

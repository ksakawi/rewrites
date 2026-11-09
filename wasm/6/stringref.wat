(global $a (export "a") (mut externref)
    ref.null extern)

(global $b (export "b") (mut externref)
    ref.null extern)

(func (export "c") (result i32)
    global.get $a
    any.convert_extern
    ref.cast eqref
    global.get $b
    any.convert_extern
    ref.cast eqref
    ref.eq)

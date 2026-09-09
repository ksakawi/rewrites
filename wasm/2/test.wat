(module
    (type $x (func (param i32) (param i32) (result i32)))
    (func $add (param i32) (param i32) (result i32)
        local.get 0
        local.get 1
        i32.add)
    (elem declare funcref
        (ref.func $add))
    (func $get_add (export "get_add") (result (ref $x))
        ref.func $add))

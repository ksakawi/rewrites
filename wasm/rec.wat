(module
    (type $x (struct (field i32 i32)))
    (func $main (export "main") (param i32 i32) (result (ref $x))
        local.get 0
        local.get 1
        struct.new $x))

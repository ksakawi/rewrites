(type $bufi32 (array (mut i32)))

(type $ArrayList_i32
    (struct
        (field $len (mut i32))
        (field $buf (mut (ref $bufi32)))))

(func $ArrayList_i32_reserve_1 (param $list (ref $ArrayList_i32))
    (local $ret (ref $bufi32))
    (if
        (i32.lt_u
            (struct.get $ArrayList_i32 $len
                (local.get $list))
            (array.len
                (struct.get $ArrayList_i32 $buf
                    (local.get $list))))
        (then
            return))
    (array.copy $bufi32 $bufi32
        (array.new_default $bufi32
            (if (result i32)
                (array.len
                    (struct.get $ArrayList_i32 $buf
                        (local.get $list)))
                (then
                    (i32.shl
                        (array.len
                            (struct.get $ArrayList_i32 $buf
                                (local.get $list)))
                        (i32.const 1)))
                (else
                    i32.const 1)))
        (local.tee $ret)
        (i32.const 0)
        (struct.get $ArrayList_i32 $buf
            (local.get $list))
        (i32.const 0)
        (array.len
            (struct.get $ArrayList_i32 $buf
                (local.get $list))))
    (struct.set $ArrayList_i32 $buf
        (local.get $list)
        (local.get $ret)))

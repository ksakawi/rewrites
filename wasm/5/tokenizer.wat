(import "env" "regex_get_last_index" (func $regex_get_last_index (param $regex (ref extern)) (result i32)))
(import "env" "regex_set_last_index" (func $regex_set_last_index (param $regex (ref extern)) (param $last_index i32)))
(import "env" "regex_test" (func $regex_test (param $regex (ref extern)) (param $str (ref extern)) (result i32)))
(import "env" "regex_construct" (func $regex_construct (param $source (ref extern)) (param $flags (ref extern)) (result (ref extern))))

(import "env" "str_length" (func $str_length (param $str (ref extern)) (result i32)))
(import "env" "str_char_code_at" (func $str_char_code_at (param $str (ref extern)) (param $index i32) (result i32)))

(import "env" "regex_numeric_digits" (global $regex_numeric_digits externref))
(import "env" "regex_identifier" (global $regex_identifier externref))

(memory $mem (import "env" "memory") 0)

(func (export "tokenize") (param $str (ref extern)) (result i32) (result i32)
    (local $index i32)
    (local $len i32)
    (local $alloc_start i32)
    (local $alloc_len i32)
    (local $current_char i32)

    local.get $str
    call $str_length
    local.set $len

    ;; avoid complex allocator code by severely overallocating
    memory.size $mem
    i32.const 0x4000
    i32.mul
    local.set $alloc_start
    local.get $len
    i32.const 0x4000
    i32.add
    i32.const 0x4000
    i32.div_u
    memory.grow $mem
    i32.const -1
    i32.eq
    (if
        (then
            unreachable))

    (block $loop_outer
        (loop $loop
            local.get $index
            local.get $len
            i32.ge_u
            (if
                (then
                    br $loop_outer))

            local.get $str
            local.get $index
            call $str_char_code_at
            local.set $current_char

            ;; 'A'...'Z', 'a'...'z', '_'
            local.get $current_char
            i32.const 0x41
            i32.ge_u
            local.get $current_char
            i32.const 0x5a
            i32.le_u
            i32.and
            local.get $current_char
            i32.const 0x61
            i32.ge_u
            local.get $current_char
            i32.const 0x7a
            i32.le_u
            i32.and
            local.get $current_char
            i32.const 0x95
            i32.eq
            i32.or
            i32.or

            (if
                (then
                    global.get $regex_identifier
                    ref.as_non_null
                    local.get $index
                    call $regex_set_last_index

                    global.get $regex_identifier
                    ref.as_non_null
                    local.get $str
                    call $regex_test
                    i32.const 1
                    i32.ne
                    (if
                        (then
                            unreachable))

                    local.get $alloc_start
                    local.get $alloc_len
                    i32.add
                    i32.const 1
                    i32.store8

                    local.get $alloc_len
                    i32.const 1
                    i32.add
                    local.set $alloc_len

                    global.get $regex_identifier
                    ref.as_non_null
                    call $regex_get_last_index
                    local.set $index

                    br $loop))

            local.get $index
            i32.const 1
            i32.add
            local.set $index

            br $loop))

    local.get $alloc_start
    local.get $alloc_len)

(func $start)

(start $start)

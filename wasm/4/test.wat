(module
    (import "dom" "createElement" (func $dom_createElement (param externref) (result externref)))
    (import "dom" "appendChild" (func $dom_appendChild (param externref) (result externref)))
    (import "dom" "document" (global $dom_document externref))
    (import "dom" "textContent_get" (func $dom_textContent_get (param externref) (result externref)))
    (import "dom" "textContent_set" (func $dom_textContent_set (param externref) (param externref) (result externref)))
    (import "" "h1" (global $str_h1 externref)))

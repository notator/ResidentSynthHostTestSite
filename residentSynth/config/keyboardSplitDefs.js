console.log('load keyboardSplitDefs.js');

// This file can be omitted by applications that don't use split keyboards.
// The keyboardSplitDefs array contains up to 126 keyboardSplit definition (=keyboardSplitDef) strings,
// each of which must contain between 1 and 127 `<key>:<channel>;` substrings separated by whitespace.
// An empty keyboardSplitDef is illegal here, but is allocated automatically as the first definition internally,
// meaning that the MIDI message's channel will be used unchanged. This is also the default used when this file does not exist.
//
// The following restrictions are checked when this file is loaded into the ResidentSynth:
// There are less than 127 keyboardSplitDef strings in the array.
// Each `<key>` must be an integer in range 0..127. The first `<key>` must be 0, with the rest in ascending
// order. `<key>` values may not repeat in the string.
// Each `<channel>` is an integer in range 0..15. These values can be in any order, and repeat in the string.
// The `:` and `;` characters must be present, except at the very end of each keyboardSplitDef.  
// Each keyboardSplitDef is parsed from left to right.
// All keys greater than or equal to the `<key>` component of a `<key>:<channel>` substring send on the
// substring's channel unless overridden by a substring further to the right.  
// Example keyboardSplitDef strings are:
// `""`, `"0:0; 42:1;"`, `"0:3; 40:1; 50:2;"`, `"0:0; 40:1; 50:2; 60:1; 72:5"` etc. 
// The (non-standard MIDI) SET_KEYBOARD_SPLIT_ARRAY message sets the current keyboard split configuration  
// using its index in this array.
ResSynth.keyboardSplitDefs =
    [
        // index 0 is automatically given the value "", meaning that the message channel will be used.
        "0:0", // index 1 
        "0:0; 60:1", // index 2
        "0:0; 48:1; 60:0; 72:1", // index 3
        "0:0; 48:1; 60:2; 72:3" // index 4
    ];



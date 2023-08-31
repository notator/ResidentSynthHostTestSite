console.log('load keyboardSplitDefs.js');

// This file can be omitted by applications that don't use keyboardSplits.
// There can be up to 128 keyboardSplit definitions (=keyboardSplitDef) in the keyboardSplitDefs array, each of which
// contains zero or more "<key>:<channel>;" strings separated by whitespace.
// An empty keyboardSplitDef means that there is no overriding keyboardSplit, so that the incoming
// MIDI message's channel will be used unchanged. This is the default when this file does not exist.
// Otherwise, each keyboardSplitDef contains up to 127 "<key>:<channel>;" sub-strings separated by whitespace.
// The following restrictions are checked when this file is loaded into the ResidentSynth using getKeyboardSplits():
// There are less than 128 keyboardSplitDef strings in this file.
// Each <key> is a number in range 0..127. Key values must be in ascending order, and may not repeat.
// Each <channel> is a number in range 0..15. These values can be in any order, and repeat in the string.
// The ':' and ';' characters must be present, except at the very end of each keyboardSplitDef.
// Each keyboardSplitDef is parsed from left to right.
// All keys greater than or equal to the key component of a <key:channel> substring send on the
// substring's channel unless overridden by a substring further to the right.
// Valid keyboardSplitDef strings are "", "42:1;", "40:1; 50:2;", "40:1; 50:2; 60:1; 72:5" etc.
ResSynth.keyboardSplitDefs =
    [
        "", // index 0, (use incoming channel)
        "0:0", // index 1 
        "0:0; 60:1", // index 2
        "0:0; 48:1; 60:0; 72:1", // index 3
        "0:0; 48:1; 60:2; 72:3", // index 4
    ];



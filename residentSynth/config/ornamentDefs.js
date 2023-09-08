console.log('load ornamentDefs.js');

// This file can be omitted by applications that don't use ornaments.
// There can be up to 128 ornamentPerKeysStrings in the ornamentPerKeysStrings array, each of which
// contains zero or more "<key>:<ornamentName>;" strings separated by whitespace.
// An empty ornamentPerKeyString means that there are no ornaments defined. This is the default when this file does not exist.
// Otherwise, each ornamentPerKeyString contains up to 127 "<key>:<ornamentName>;" sub-strings separated by whitespace.
// The following restrictions are checked when this file is loaded into the ResidentSynth using setPrivateOrnamentPerKeyArrays():
// There are less than 128 ornamentPerKeysStrings defined in this file.
// Each <key> is a number in range 0..127. Key values must be in ascending order, and may not repeat.
// Each <ornamentName> is a the <name> attribute of an ornamentDef defined below in ResSynth.ornamentDefs.
// The <ornamentName> values can be in any order, and may repeat in the string.
// The ':' and ';' characters must be present, except at the very end of each ornamentPerKeyString.
// The following ornamentPerKeysStrings provide examples of valid strings.
// In the ResidentSynthHost, these strings are used to populate a select control.
ResSynth.ornamentPerKeysStrings =
    [
        "",
        "64:turn1",
        "64:turn2; 66:tr1",
        "64:rpt1; 66:tr3; 68:trem1"
    ]

// There can be 1..127 ornament definitions in the ornamentDefs, each of which has name, chords and repeats attributes.
// Each chord definition is an array:
//      [0] is its msDuration(between its noteOns and corresponding noteOffs)
//      [1] is an array of <keyIncrement,velocityIncrement> pairs describing the notes in the chord,
// msDuration must always be > 0 (even when it is on the final chord of a non-repeating ornament, and will be ignored).
// keyIncrement and velocityIncrement must each be in range -127..127.
// The repeats attribute is a boolean value that can be either "yes" or "no".
// If the repeats attribute is "no", the msDuration of the final chord is ignored. It is held until the trigger note's noteOff is received.
// If the repeats attribute is "yes", the chords are played in a continuous cycle until the trigger note's noteOff is received.
ResSynth.ornamentDefs =
    [
        {
            name: "turn1",
            chords:
                [
                    [125, [[0, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[2, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[0, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[-1, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    // final noteOn is same pitch+velocity as original note, 500ms later.
                    [125, [[0, 0]]] // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                ],
            repeats: "no"
        },
        {
            name: "turn2",
            chords:
                [
                    [500, [[0, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[4, 10]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [400, [[0, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[-2, 20]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    // final noteOn is same pitch+velocity as original note, 500ms later.
                    [125, [[0, 0]]] // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                ],
            repeats: "no"
        },
        {
            name: "rpt1",
            chords:
                [
                    [125, [[0, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[2, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[0, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[-1, 0]]] // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                ],
            repeats: "yes"
        },
        {
            name: "tr1",
            chords:
                [
                    [125, [[0, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[1, 0]]] // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                ],
            repeats: "yes"
        },
        {
            name: "tr2",
            chords:
                [
                    [125, [[0, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [125, [[2, 0]]] // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                ],
            repeats: "yes"
        },
        {
            name: "tr3", // fast, wide
            chords:
                [
                    [25, [[0, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [25, [[11, 0]]] // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                ],
            repeats: "yes"
        },
        {
            name: "trem1",
            chords:
                [
                    [110, [[0, 0], [4, 0], [7, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [110, [[9, 0], [13, 0], [16, 0]]] // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                ],
            repeats: "yes"
        },
        {
            name: "trem2",
            chords:
                [
                    [110, [[0, 0], [3, 0], [7, 0]]], // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    [110, [[-7, 0], [-1, 0], [6, 0], [13, 0], [17, 0]]] // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                ],
            repeats: "yes"
        }
    ];



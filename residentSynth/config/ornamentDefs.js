console.log('load ornamentDefs.js');

// This file can be omitted by applications that don't use ornaments.
// It contains the definitions of two objects: the `ResSynth.ornamentPerKeysStrings` and the
// `ResSynth.ornamentsDefs`.The strings in the`ResSynth.ornamentPerKeysStrings` connect particular
// ornaments to particular keys, using the ornament definitions in the`ResSynth.ornamentsDefs`.
//
// The(non-standard MIDI) SET_KEYBOARD_ORNAMENT_DEFS message sets the ornament per key configuration
// by sending the configuration's index in an internal list of configurations.
// The first configuration in the internal list(at index 0) always sets "no ornaments defined".
// Subsequent configurations are set using the `ornamentPerKeysStrings` array.
//
// The `ResSynth.ornamentPerKeysStrings` array contains up to 126 ornamentPerKeysString elements,
// each of which  contains between 1 and 127 `<key>:<ornamentName>;` sub-strings separated by whitespace.
// Each `<key>` is a number in range 0..127. `<key>` values must be in ascending order, and may not repeat.
// Each `<ornamentName>` is the `<name>` attribute of an ornament defined in the`ResSynth.ornamentDefs`.
// The`<ornamentName>` values can be in any order, and may repeat within an ornamentPerKeysString.
// The `:` and `;` characters must be present, except at the very end of each ornamentPerKeysString.

var ResSynth = ResSynth || {};

ResSynth.ornamentPerKeysStrings =
    [
         // message index 0 will be allocated automatically to mean "no ornaments defined"
        "64:turn1", // message index 1
        "64:turn2; 66:tr1", // message index 2
        "64:rpt1; 66:tr3; 68:trem1; 70:trem2" // message index 3
    ];

// The `ResSynth.ornamentDefs` contain up to 127 ornament definitions, each of which has a `name`, `msgs`
// and `repeat` attribute.
//      `name` is an arbitrary, descriptive string.
//      `msgs` is an array containing objects of the following types:
//           `delay`: milliseconds // must always be > 0 (default is no delay between messages)
//           `chordOn`: an array of `[keyIncrement, velocityIncrement]` arrays (one element per note in the chord)
//           `chordOff`: an array of `[keyIncrement]` values matching the keyIncrements in the chordOn (one element per note in the chord)
// `keyIncrement` and `velocityIncrement` must each be in range - 127..127.
// The resulting key values are silently coerced to the range 0..127. Velocities are silently coerced to the range 1..127.
// The `repeat` attribute is a boolean value that can be either "yes" or "no".
// If the `repeat` attribute is "no", the ornamented event ends when the ornamented note's noteOff is received.
// If the `repeat`  attribute is "yes", the `msgs` are played in a continuous cycle until the ornamented note's noteOff is received.
ResSynth.ornamentDefs =
    [
        {
            name: "turn1",
            msgs:
                [
                    {chordOn: [[0, 0]]},
                    {delay: 125},
                    {chordOff: [0]},

                    {chordOn: [[2, 0]]},
                    {delay: 125},
                    {chordOff: [2]},

                    {chordOn: [[0, 0]]},
                    {delay: 125},
                    {chordOff: [0]},

                    {chordOn: [[-1, 0]]},
                    {delay: 125},
                    {chordOff: [-1]},

                    {chordOn: [[0, 0]]}
                ],
            repeat: "no"
        },
        {
            name: "turn2",
            msgs:
                [
                    {chordOn: [[0, 0]]},
                    {delay: 125},
                    {chordOff: [0]},

                    {chordOn: [[4, 10]]},
                    {delay: 125},
                    {chordOff: [4]},

                    {chordOn: [[0, 0]]},
                    {delay: 125},
                    {chordOff: [0]},

                    {chordOn: [[-2, 20]]},
                    {delay: 125},
                    {chordOff: [-2]},

                    {chordOn: [[0, 0]]}
                ],
            repeat: "no"
        },
        {
            name: "rpt1",
            msgs:
                [
                    {chordOn: [[0, 0]]},
                    {delay: 125},
                    {chordOff: [0]},

                    {chordOn: [[2, 0]]},
                    {delay: 125},
                    {chordOff: [2]},

                    {chordOn: [[0, 0]]},
                    {delay: 125},
                    {chordOff: [0]},

                    {chordOn: [[-1, 0]]},
                    {delay: 125},
                    {chordOff: [-1]}
                ],
            repeat: "yes"
        },
        {
            name: "tr1",
            msgs:
                [
                    {chordOn: [[0, 0]]},
                    {delay: 125},
                    {chordOff: [0]},

                    {chordOn: [[1, 0]]},
                    {delay: 125},
                    {chordOff: [1]}
                ],
            repeat: "yes"
        },
        {
            name: "tr2",
            msgs:
                [
                    {chordOn: [[0, 0]]},
                    {delay: 125},
                    {chordOff: [0]},

                    {chordOn: [[2, 0]]},
                    {delay: 125},
                    {chordOff: [2]}
                ],
            repeat: "yes"
        },
        {
            name: "tr3", // fast, wide
            msgs:
                [
                    {chordOn: [[0, 0]]},
                    {delay: 25},
                    {chordOff: [0]},

                    {chordOn: [[11, 0]]},
                    {delay: 25},
                    {chordOff: [11]}
                ],
            repeat: "yes"
        },
        {
            name: "trem1",
            msgs:
                [
                    {chordOn: [[0, 0], [4, 0], [7, 0]]},
                    {delay: 110},
                    {chordOff: [0, 4, 7]},

                    {chordOn: [[9, 0], [13, 0], [16, 0]]},
                    {delay: 110},
                    {chordOff: [9, 13, 16]}
                ],
            repeat: "yes"
        },
        {
            name: "trem2",
            msgs:
                [
                    {chordOn: [[0, 0], [3, 0], [7, 0]]},
                    {delay: 110},
                    {chordOff: [0, 3, 7]},

                    {chordOn: [[-7, 0], [-1, 0], [6, 0], [13, 0], [17, 0]]},
                    {delay: 110},
                    {chordOff: [-7, -1, 6, 13, 17]}
                ],
            repeat: "yes"
        }
    ];



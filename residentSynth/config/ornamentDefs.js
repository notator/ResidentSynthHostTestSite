console.log('load ornamentDefs.js');

let ResSynth = ResSynth || {};

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
    ];

// There can be 1..127 ornament definitions in the ornamentDefs, each of which has name, msgs and repeat attributes.
// Each msgs definition is an array containing objects having one each of the following attributes (defining their type):
//      delay: milliseconds -- must always be > 0 (default is no delay between messages)
//      chordOn: an array of [keyIncrement, velocityIncrement] arrays (one element per note in the chord)
//      chordOff: an array of [keyIncrement] values matching the keyIncrements in the chordOn (one element per note in the chord)
// delay must always be > 0 (default is no delay between messages)
// keyIncrement and velocityIncrement must each be in range -127..127.
// The repeat attribute is a boolean value that can be either "yes" or "no".
// If the repeat attribute is "no", the ornamented event ends when the trigger note's noteOff is received.
// If the repeat attribute is "yes", the chords are played in a continuous cycle until the trigger note's noteOff is received.
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



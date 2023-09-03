console.log('load ornamentDefs.js');

// This file can be omitted by applications that don't use ornaments.
// There can be up to 128 ornamentPerKeysStrings in the ornamentPerKeysStrings array, each of which
// contains zero or more "<key>:<ornamentIndex>;" strings separated by whitespace.
// An empty ornamentPerKeyString means that there are no ornaments defined. This is the default when this file does not exist.
// Otherwise, each ornamentPerKeyString contains up to 127 "<key>:<ornamentIndex>;" sub-strings separated by whitespace.
// The following restrictions are checked when this file is loaded into the ResidentSynth using setPrivateOrnamentPerKeyArrays():
// There are less than 128 ornamentPerKeysStrings defined in this file.
// Each <key> is a number in range 0..127. Key values must be in ascending order, and may not repeat.
// Each <ornamentIndex> is a number in range 0..n-1, where n is the number of ornaments defined below in ResSynth.ornamentDefs.
// The < ornamentIndex > values can be in any order, and may repeat in the string.
// The ':' and ';' characters must be present, except at the very end of each ornamentPerKeyString.
// With 5 ornaments defined, valid ornamentPerKeyString strings are "", "42:1;", "40:1; 50:2;", "40:1; 50:2; 60:1; 72:4" etc.
// In the ResidentSynthHost, these strings are used to populate a select control.
ResSynth.ornamentPerKeysStrings =
[
    "",
    "64:0",
    "64:0; 66:1",
    "64:0; 66:1; 68:2"
]

// There can be 1..127 ornament definitions in the ornamentDefs, each of which has name, notes and repeats attributes.
// Each note definition (except the first) corresponds to a NoteOn that is immediately preceded by the previous note's noteOff.
// The repeats attribute is a boolean value that can be either "yes" or "no".
// If the repeats attribute is "no", the msDuration of the final note is ignored. It is held until the trigger note's noteOff is received.
// If the repeats attribute is "yes", the notes are played in a continuous cycle until the trigger note's noteOff is received.
ResSynth.ornamentDefs =
    [
        {   // index 0
            name: "head1",
            notes:
                [
                    [0, 0, 125], // keyIncrement, velocityIncrement, msDuration
                    [2, 0, 125],
                    [0, 0, 125],
                    [-1, 0, 125],
                    [0, 0, 0] // final noteOn is same pitch+velocity as original note, 500ms later.
                ],
                repeats: "no"
        },
        {   // index 1
            name: "head2",
            notes:
                [
                    [0, 0, 500], // keyIncrement, velocityIncrement, msDuration
                    [4, 10, 125],
                    [0, 0, 400],
                    [-2, 20, 125],
                    [0, 0, 0] // final noteOn is same pitch+velocity as original note, 1150ms (=500+125+400+400)ms later.
                ],
            repeats: "no"
        },
    {   // index 2
            name: "repeat1",
            notes:
                [
                    [0, 0, 125], // keyIncrement, velocityIncrement, msDuration
                    [2, 0, 125],
                    [0, 0, 125],
                    [-1, 0, 125]
                ],
            repeats: "yes"
        },
    {   // index 3
            name: "trill_1",
            notes:
                [
                    [0, 0, 125], // keyIncrement, velocityIncrement, msDuration
                    [2, 0, 125]
                ],
            repeats: "yes"
        },
    {   // index 4
            name: "trill_2 (fast)",
            notes:
                [
                    [0, 0, 25], // keyIncrement, velocityIncrement, msDuration
                    [11, 0, 25]
                ],
            repeats: "yes"
        }
    ];



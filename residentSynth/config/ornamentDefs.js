console.log('load ornamentDefs.js');

CMD = ResSynth.constants.COMMAND;
CTL = ResSynth.constants.CONTROL;

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
        "64:rpt1; 66:tr3; 68:trem1",
        "64:rpt1; 66:tr3; 68:trem1; 70:complex1"
    ]

// There can be 1..127 ornament definitions in the ornamentDefs, each of which has name, msgs and repeats attributes.
// Each msgs definition is an array containing objects having one each of the following attributes (defining their type):
//      cmd: [commandIndex, value]
//      ctl: [controlIndex, value]
//      delay: milliseconds -- must always be > 0 (default is no delay between messages)
//      noteOn: [keyIncrement, velocityIncrement]
//      noteOff: keyIncrement
// delay must always be > 0 (default is no delay between messages)
// keyIncrement and velocityIncrement must each be in range -127..127.
// The repeats attribute is a boolean value that can be either "yes" or "no".
// If the repeats attribute is "no", the ornamented event ends when the trigger note's noteOff is received.
// If the repeats attribute is "yes", the chords are played in a continuous cycle until the trigger note's noteOff is received.
ResSynth.ornamentDefs =
    [
        {
            name: "turn1",
            msgs:
                [
                    //{chord: [125, [[0, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[2, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[0, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[-1, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //// final noteOn is same pitch+velocity as original note, 500ms later.
                    //{chord: [125, [[0, 0]]]}// msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    {noteOn: [0, 0]},
                    {delay: 125},
                    {noteOff: 0},

                    {noteOn: [2, 0]},
                    {delay: 125},
                    {noteOff: 2},

                    {noteOn: [0, 0]},
                    {delay: 125},
                    {noteOff: 0},

                    {noteOn: [-1, 0]},
                    {delay: 125},
                    {noteOff: -1},

                    {noteOn: [0, 0]}
                ],
            repeats: "no"
        },
        {
            name: "turn2",
            msgs:
                [
                    //{chord: [500, [[0, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[4, 10]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [400, [[0, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[-2, 20]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //// final noteOn is same pitch+velocity as original note, 500ms later.
                    //{chord: [125, [[0, 0]]]} // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    {noteOn: [0, 0]},
                    {delay: 125},
                    {noteOff: 0},

                    {noteOn: [4, 10]},
                    {delay: 125},
                    {noteOff: 4},

                    {noteOn: [0, 0]},
                    {delay: 125},
                    {noteOff: 0},

                    {noteOn: [-2, 20]},
                    {delay: 125},
                    {noteOff: -2},

                    {noteOn: [0, 0]}
                ],
            repeats: "no"
        },
        {
            name: "rpt1",
            msgs:
                [
                    //{chord: [125, [[0, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[2, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[0, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[-1, 0]]]} // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    {noteOn: [0, 0]},
                    {delay: 125},
                    {noteOff: 0},
                    {noteOn: [2, 0]},
                    {delay: 125},
                    {noteOff: 2},
                    {noteOn: [0, 0]},
                    {delay: 125},
                    {noteOff: 0},
                    {noteOn: [-1, 0]},
                    {delay: 125},
                    {noteOff: -1}
                ],
            repeats: "yes"
        },
        {
            name: "tr1",
            msgs:
                [
                    //{chord: [125, [[0, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[1, 0]]]} // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    {noteOn: [0, 0]},
                    {delay: 125},
                    {noteOff: 0},
                    {noteOn: [1, 0]},
                    {delay: 125},
                    {noteOff: 1}
                ],
            repeats: "yes"
        },
        {
            name: "tr2",
            msgs:
                [
                    //{chord: [125, [[0, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [125, [[2, 0]]]} // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    {noteOn: [0, 0]},
                    {delay: 125},
                    {noteOff: 0},
                    {noteOn: [2, 0]},
                    {delay: 125},
                    {noteOff: 2}
                ],
            repeats: "yes"
        },
        {
            name: "tr3", // fast, wide
            msgs:
                [
                    //{chord: [25, [[0, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [25, [[11, 0]]]}// msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    {noteOn: [0, 0]},
                    {delay: 25},
                    {noteOff: 0},
                    {noteOn: [11, 0]},
                    {delay: 25},
                    {noteOff: 11}
                ],
            repeats: "yes"
        },
        {
            name: "trem1",
            msgs:
                [
                    //{chord: [110, [[0, 0], [4, 0], [7, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [110, [[9, 0], [13, 0], [16, 0]]]} // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    {noteOn: [0, 0]},
                    {noteOn: [4, 0]},
                    {noteOn: [7, 0]},
                    {delay: 110},
                    {noteOff: 0},
                    {noteOff: 4},
                    {noteOff: 7},
                    {noteOn: [9, 0]},
                    {noteOn: [13, 0]},
                    {noteOn: [16, 0]},
                    {delay: 110},
                    {noteOff: 9},
                    {noteOff: 13},
                    {noteOff: 16}
                ],
            repeats: "yes"
        },
        {
            name: "trem2",
            msgs:
                [
                    //{chord: [110, [[0, 0], [3, 0], [7, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    //{chord: [110, [[-7, 0], [-1, 0], [6, 0], [13, 0], [17, 0]]]} // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                    {noteOn: [0, 0]},
                    {noteOn: [3, 0]},
                    {noteOn: [7, 0]},
                    {delay: 110},
                    {noteOff: 0},
                    {noteOff: 3},
                    {noteOff: 7},

                    {noteOn: [-7, 0]},
                    {noteOn: [-1, 0]},
                    {noteOn: [6, 0]},
                    {noteOn: [13, 0]},
                    {noteOn: [17, 0]},
                    {delay: 110},
                    {noteOff: -7},
                    {noteOff: -1},
                    {noteOff: 6},
                    {noteOff: 13},
                    {noteOff: 17}
                ],
            repeats: "yes"
        },
        {
            name: "complex1",
            msgs:
            [
                {cmd: [CMD.PRESET, 0]},
                {ctl: [CTL.VOLUME, 10]},
                //{chord: [110, [[0, 0], [3, 0], [7, 0]]]}, // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                {noteOn: [0, 0]},
                {noteOn: [3, 0]},
                {noteOn: [7, 0]},
                {delay: 110},
                {noteOff: 0},
                {noteOff: 3},
                {noteOff: 7},
                {cmd: [CMD.PRESET, 8]},
                {ctl: [CTL.VOLUME, 100]},
                //{chord: [110, [[-7, 0], [-1, 0], [6, 0], [13, 0], [17, 0]]]} // msDuration, [|:[keyIncrement, velocityIncrement]:|]
                {noteOn: [-7, 0]},
                {noteOn: [-1, 0]},
                {noteOn: [6,  0]},
                {noteOn: [13, 0]},
                {noteOn: [17, 0]}
            ],
            repeats: "no"
        }
    ];



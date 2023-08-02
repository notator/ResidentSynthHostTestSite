console.log('load ornamentDefs.js');

// This file can be omitted by applications that don't use ornaments.
// There can be 1..127 ornament definitions in the ornamentDefs, each of which has name, notes and repeats attributes.
// Each note definition (except the first) corresponds to a NoteOn that is immediately preceded by the previous note's noteOff.
// The repeats attribute is a boolean value that can be either "yes" or "no".
// If the repeats attribute is "no", the msDuration of the final note is ignored. It is held until the trigger note's noteOff is received.
// If the repeats attribute is "yes", the notes are played in a continuous cycle until the trigger note's noteOff is received.
ResSynth.ornamentDefs =
    [
        {
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
        {
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
        {
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
        {
            name: "trill_1",
            notes:
                [
                    [0, 0, 125], // keyIncrement, velocityIncrement, msDuration
                    [2, 0, 125]
                ],
            repeats: "yes"
        },
        {
            name: "trill_2 (fast)",
            notes:
                [
                    [0, 0, 25], // keyIncrement, velocityIncrement, msDuration
                    [11, 0, 25]
                ],
            repeats: "yes"
        }
    ];



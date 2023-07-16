console.log('load ornamentDefs.js');

// This file can be omitted by applications that don't use ornaments.
// There can be 1..127 ornament definitions in the ornamentDefs, each of which has name and notes attributes.
// Each note definition (except the first) corresponds to a NoteOn that is immediately preceded by the previous note's noteOff.
// The msDuration of the final note is ignored. It is held until the trigger note's noteOff is received.
ResSynth.ornamentDefs =
    [
        {
            name: "mordent1",
            notes:
                [
                    [0, 0, 125], // keyIncrement, velocityIncrement, msDuration
                    [2, 0, 125],
                    [0, 0, 125],
                    [-1, 0, 125],
                    [0, 0, 0] // final noteOn is same pitch+velocity as original note, 500ms later.
                ]
        },
        {
            name: "ornament2",
            notes:
                [
                    [0, 0, 500], // keyIncrement, velocityIncrement, msDuration
                    [4, 10, 125],
                    [0, 0, 400],
                    [-2, 20, 125],
                    [0, 0, 0] // final noteOn is same pitch+velocity as original note, 500ms later.
                ]
        },
        {
            name: "mordent3",
            notes:
                [
                    [0, 0, 125], // keyIncrement, velocityIncrement, msDuration
                    [2, 0, 125],
                    [0, 0, 125],
                    [-1, 0, 125],
                    [0, 0, 0] // final noteOn is same pitch+velocity as original note, 500ms later.
                ]
        },
        {
            name: "mordent4",
            notes:
                [
                    [0, 0, 125], // keyIncrement, velocityIncrement, msDuration
                    [2, 0, 125],
                    [0, 0, 125],
                    [-1, 0, 125],
                    [0, 0, 0] // final noteOn is same pitch+velocity as original note, 500ms later.
                ]
        },
        {
            name: "mordent5",
            notes:
                [
                    [0, 0, 125], // keyIncrement, velocityIncrement, msDuration
                    [2, 0, 125],
                    [0, 0, 125],
                    [-1, 0, 125],
                    [0, 0, 0] // final noteOn is same pitch+velocity as original note, 500ms later.
                ]
        }


    ];



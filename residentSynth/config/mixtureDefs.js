console.log('load mixtureDefs.js');

// This file can be omitted by applications that don't use mixtures.
// The mixtureDefs array is an array of mixture definitions.
// The maximum number of mixture definitions is 127.
// Each mixture definition contains a name and an extraNotes array
// containing entries of the form[keyInterval, relativeVelocity].
// Each extraNotes array can have any length greater than 0.
// If the [keyInterval, relativeVelocity] array is not _empty_,
// it defines a new noteOn that will be sent with the original noteOn message.
// If the original noteOn has (originalKey, originalvelocity),
// the new noteOn(s) will have(originalKey + keyInterval, originalvelocity * relativeVelocity).
// keyInterval must be integers in range -127..+127 inclusive.
// relativeVelocity are usually floats > 0 and < 1, but can be <= 100.0.
// (originalKey + keyInterval) will be silently coerced to the range 0..127 inclusive.
// (originalvelocity * relativeVelocity) will be silently coerced to the range 1..127 inclusive.
ResSynth.mixtureDefs =
[
    {
        name: "none",
        extraNotes:
            [
                []
            ]
    },
    {
        name: "2.1: (+19)",
        extraNotes:
            [
                [19, 0.5]
            ]
    },
    {
        name: "4.1 (+4, 8, 13)",
        extraNotes:
            [
                [4, 0.75], [8, 0.5], [13, 0.4]
            ]
    },
    {
        name: "5.1: (+4, 7, 12, 24)",
        extraNotes:
            [
                [4, 0.75], [7, 0.5], [12, 0.4], [24, 0.2]
            ]
    },
    {
        name: "5.2 (+6, 12, 24, 37)",
        extraNotes:
            [
                [6, 0.75], [12, 0.4], [24, 0.2], [37, 0.1]
            ]
    },
    {
        name: "5.3 (+9, 13, 12, 24)",
        extraNotes:
            [
                [9, 0.4], [13, 0.3], [12, 0.2], [24, 0.1]
            ]
    }
];



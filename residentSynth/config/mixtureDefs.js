console.log('load mixtureDefs.js');

// This file can be omitted by applications that don't use mixtures.
// There can be 1..127 mixture definitions in the mixtureDefs, each of which has the following
// attributes:
//   name
//   notesExtraNotes - undefined or a possibly empty array of up to 127 noteExtraNotes objects.
// The first mixtureDef must be named "none", and have a notesExtraNotes array that is either
// undefined or empty. This "no mixture" option must exist because mixtures are later referenced
// by index, and the convention will be that mixtures[0] means "no mixture".
// If the notesExtraNotes array is defined and not empty, it contains noteExtraNotes objects having
// the following attributes:
//   note - undefined or in range 0..127 (keyInterval can be negative)
//   extraNotes - undefined or a possibly empty array of up to 127 [keyInterval, relativeVelocity] arrays
// The keyInterval is an integer in range -127..127
// The relativeVelocity is the (float) factor by which to multiply the original
// note's velocity. It will usually be in range 0..1, but can be <= 100.0.
//
// If noteExtraNote.note is undefined, its extraNotes are the default for each
// note in the mixture, otherwise the extraNotes apply only to their note.
// A Mixture may not contain more than one extraNotes definition for a particular note.
ResSynth.mixtureDefs =
    [
        {
            name: "none",
            // notesExtraNotes: []
        },
        {
            name: "mostly +19",
            notesExtraNotes:
                [
                    {
                        // note: undefined, // default for all notes not mentioned in the other notesExtraNotes
                        extraNotes:
                            [
                                [19, 0.5]
                            ]
                    },
                    {
                        note: 60, // extraNotes just for key 60
                        extraNotes:
                            [
                                [4, 0.9]
                            ]
                    },
                    {
                        note: 48, // just for key 48
                        // extraNotes: (no extra notes)
                    }
                ]
        },
        {
            name: "+4, 8, 13",
            notesExtraNotes:
                [
                    {
                        note: undefined, // default for all notes not mentioned in the other notesExtraNotes
                        extraNotes:
                            [
                                [4, 0.75], [8, 0.5], [13, 0.4]
                            ]
                    }
                ]

        },
        {
            name: "+4, 7, 12, 24",
            notesExtraNotes:
                [
                    {
                        note: undefined, // default for all notes not mentioned in the other notesExtraNotes
                        extraNotes:
                            [
                                [4, 0.75], [7, 0.5], [12, 0.4], [24, 0.2]
                            ]
                    }
                ]

        },
        {
            name: "+6, 12, 24, 37",
            notesExtraNotes:
                [
                    {
                        note: undefined, // default for all notes not mentioned in the other notesExtraNotes
                        extraNotes:
                            [
                                [6, 0.75], [12, 0.4], [24, 0.2], [37, 0.1]
                            ]
                    }
                ]

        },
        {
            name: "+9, 13, 12, 24",
            notesExtraNotes:
                [
                    {
                        note: undefined, // default for all notes not mentioned in the other notesExtraNotes
                        extraNotes:
                            [
                                [9, 0.4], [13, 0.3], [12, 0.2], [24, 0.1]
                            ]
                    }
                ]

        }
    ];



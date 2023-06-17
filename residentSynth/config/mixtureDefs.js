console.log('load mixtureDefs.js');

// This file can be omitted by applications that don't use mixtures.
// There can be 1..127 mixture definitions in the mixtureDefs, each of which has the following
// attributes:
//   name
//   extraNotes - a possibly empty array of up to 127 [keyInterval, relativeVelocity] arrays
//   except - a possibly empty array of up to 127 [note, mixtureIndex] arrays
//
// extraNotes defines notes that will be added to the original note when the mixture is active:
//   keyInterval is an integer in range - 127..127
//   relativeVelocity is the (float) factor by which to multiply the original note's velocity.
//   relativeVelocity will usually be in range 0..1, but can be <= 100.0.
//
// The except attribute defines keys that are assigned a different mixture when this mixture
// is selected.
//   note is an integer in range 0..127 denoting the relevant note (value in MIDI message)
//   mixtureIndex is an integer pointing at the mixture (extraNotes) to apply to this note.
// A Mixture may not contain more than one except definition for a particular note.
ResSynth.mixtureDefs =
    [
        // The first mixture definition in the list must be defined exactly like this.
        {   // index 0
            name: "none",
            extraNotes: [],
            except: []
        },
        {   // index 1
            name: "just key 64",
            extraNotes: [],
            except:
                [
                    [64, 2] // mixture index 2, extraNotes (+19)
                ]
        },
        {   // index 2
            name: "mostly +19",
            extraNotes:
                [
                    [19, 0.5]
                ],
            except:
                [
                    [64, 0],
                    [65, 0],
                    [66, 0],
                    [67, 0],
                    [68, 0],
                    [69, 0]
                ]
        },
        {   // index 3
            name: "+4, 8, 13",
            extraNotes:
                [
                    [4, 0.75], [8, 0.5], [13, 0.4]
                ],
            except: []

        },
        {   // index 4
            name: "+4, 7, 12, 24",
            extraNotes:
                [
                    [4, 0.75], [7, 0.5], [12, 0.4], [24, 0.2]
                ],
            except: []
        },
        {   // index 5
            name: "+6, 12, 24, 37",
            extraNotes:
                [
                    [6, 0.75], [12, 0.4], [24, 0.2], [37, 0.1]
                ],
            except: []
        },
        {   // index 6
            name: "+9, 13, 12, 24",
            extraNotes:
                [
                    [9, 0.4], [13, 0.3], [12, 0.2], [24, 0.1]
                ],
            except: []
        }
    ];



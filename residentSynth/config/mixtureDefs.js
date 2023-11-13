console.log('load mixtureDefs.js');


// This file can be omitted by applications that don't use mixtures.
// The mixtureDefs array contains up to 126 mixture definitions. These are allocated
// to indexes 1 to 127 of an internal array that will be accessed by the (non-standard MIDI)
// MIXTURE_INDEX message. Index 0 is reserved for a "no mixture" mixture definition, that is
// allocated internally even if this file does not exist(see below).
// Each mixture definition has the following attributes:
//     `name` // an arbitrary, descriptive string.
//     `extraNotes` // a possibly empty array of up to 127 `[keyInterval, velocityInterval]` arrays,
//     `except` // a possibly empty array of up to 127 `[key, mixtureIndex]` arrays
//
// The `extraNotes` attribute defines values that will be added to the original note's key and
// velocity values to define a new note in the mixture.
// Both `keyInterval` and `velocityInterval` are integers in range -127..127. New note keys are
// silently coerced to the range 0..127.New note velocities are silently coerced to the range 1..127.
//
// The `except` attribute defines keys that are assigned a different mixture when this mixture is selected.
//     `key` is an integer in range 0..127 denoting the key (value in MIDI message) for which the `mixtureIndex` applies
//     `mixtureIndex` is the index of the mixture whose `extraNotes` apply to this `key`.
// A Mixture may not contain more than one `except` definition for a particular`key`.
//
// The "no mixture" mixture definition, allocated to index 0 for the MIXTURE_INDEX message even if
// this file is missing, has the following form:
// ```
//     {
//         name: "no mixture",
//         extraNotes: [],
//         except: []
//     }
// ```

var ResSynth = ResSynth || {};

ResSynth.mixtureDefs =
    [
        {   // index 1 (index 0 is automatically "no mixtures" -- see above.)
            name: "just key 64",
            extraNotes: [],
            except:
                [
                    [64, 2] // mixture index 2, extraNotes (+19)
                ]
        },
        {   // index 2
            name: "all +19 except 64, 65, 66, 67, 68, 69",
            extraNotes:
                [
                    [19, -10]
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
                    [4, -10], [8, -20], [13, -30]
                ],
            except: []

        },
        {   // index 4
            name: "+4, 7, 12, 24",
            extraNotes:
                [
                    [4, -10], [7, -20], [12, -30], [24, -40]
                ],
            except: []
        },
        {   // index 5
            name: "+6, 12, 24, 37",
            extraNotes:
                [
                    [6, -10], [12, -20], [24, -40], [37, -50]
                ],
            except: []
        },
        {   // index 6
            name: "+9, 13, 12, 24",
            extraNotes:
                [
                    [9, -20], [13, -30], [12, -40], [24, -50]
                ],
            except: []
    },
    {   // index 7
        name: "harmonics1",
        extraNotes: [[19, -20], [28, -30], [34, -40], [38, -50], [42, -60]],
        except: []
    }
    ];



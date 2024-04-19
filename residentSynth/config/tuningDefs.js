console.log('load tuningDefs.js');

// This file can be omitted by applications that do not define special tunings.
// (12-tone Equal Temperament tuning is always defined by default.)

// Definitions (28.10.2023):
// A MidiKey is an integer in range 0..127. This is the MIDI key value sent in MIDI messages.
// If the message is sent from a keyboard, the midiKey value designates a physical key on the keyboard.
//
// A MidiPitch is a pitch described as a floating point value in range 0..<128.
// By definition, MidiPitch 69.0 is 440Hz, which is the frequency of MidiKey 69 (A4) in standard
// equal temperament.
// Integer MidiPitch values are separated by one equal temperament semitone.
// MidiPitch values that differ by 0.01 differ by one equal temperament cent.
//
// A Tuning is an array of 128 MidiPitch values. Tuning[MidiKey] is the MidiPitch of the MidiKey
// in that tuning. By convention, the MidiPitches in a tuning are always in ascending order.

var ResSynth = ResSynth || {};

ResSynth.tuningType =
{
    CONSTANT_FIFTH_FACTOR: 0,
    CONSTANT_MIDI_KEY_FACTOR: 1,
    ODD_HARMONIC: 2,
    PRIME_HARMONIC: 3,
    INVERTED_ODD_HARMONIC: 4,
    INVERTED_PRIME_HARMONIC: 5,
    WARPED_OCTAVES: 6,
    WARPED_GAMUT: 7,
    BAROQUE: 8
};

// All tunings are initially related to standard A4=440Hz.
ResSynth.tuningDefs =
    [
        // constant fifths tunings (A4=440Hz)
        {
            // This tuning group uses the following constructor:
            //   tuning = getTuningFromConstantFifthFactor(root, factor);
            //
            // The 'factor' argument is the ratio between the frequencies at the top and bottom of a sounding 'fifth'.
            ctor: ResSynth.tuningType.CONSTANT_FIFTH_FACTOR,
            name: "constant fifths tunings (A4=440Hz)",
            tunings:
                [
                    {
                        name: "Equal Temperament, factor=(2^(1/12))^7",
                        root: 0,
                        factor: 1.498307 // Math.pow(Math.pow(2, (1.0 / 12)), 7) i.e. 7 equal temperament semitones
                    },
                    {
                        // The 'wolf fifth' is at G#-Eb for root=0 (C).
                        name: "Pythagorean, factor=(3/2), root=C, wolf fifth:G#-Eb",
                        root: 0,
                        factor: 1.5
                    },
                    {
                        // According to https://en.xen.wiki/w/1/4_syntonic_comma_meantone
                        // The 1/4 comma meantone fifth is the ratio 5^(1/4) (= 1.495349)
                        //
                        // The 'wolf fifth' is at G#-Eb for root=0 (=C).
                        name: "1/4 comma meantone, factor=5^(1/4), root=C, wolf fifth:G#-Eb",
                        root: 0,
                        factor: 1.495349 // Math.pow(5, (1.0 / 4))
                    },
                    {
                        // According to https://en.xen.wiki/w/1/3_syntonic_comma_meantone
                        // The 1/3 comma meantone fifth is 694.786 cents in size, which according to
                        // http://www.sengpielaudio.com/calculator-centsratio.htm corresponds to a
                        // frequency ratio (=factor) of 1.493801.
                        // The 'wolf fifth' is at G#-Eb
                        name: "1/3 comma meantone, factor=1.493801, root=C, wolf fifth:G#-Eb",
                        root: 0,
                        factor: 1.493801
                    },
                    {
                        // factor is calculated as follows:
                        // 10 fifths reach the 7th harmonic (Bb from C) 3 octaves above the base pitch,
                        // so 'factor' is the 10th root of (7 * (2^3)).
                        // This is very close to the factor for 1/4 comma meantone.
                        // The 'wolf fifth' is at G#-Eb
                        name: "Perfect 7th harmonic, factor=(7*8)^(0.1), root=C, wolf fifth:G#-Eb",
                        root: 0,
                        factor: 1.495612 // Math.pow((7 * 8), 0.1)
                    }
                ]
        },
        // constant midi key interval tunings (A4=440Hz)
        {
            // This tuning group uses the following constructor:
            //   tuning = getTuningFromKeysPerOctave(keysPerOctave);
            ctor: ResSynth.tuningType.CONSTANT_MIDI_KEY_FACTOR,
            name: "other constant interval tunings (A4=440Hz)",
            tunings:
                [
                    {
                        name: "keys per octave: 38, factor=2^(1/38) [ 2 x 19 ]",
                        keysPerOctave: 38
                    },
                    {
                        name: "keys per octave: 36, factor=2^(1/36) [standard ET sixthtones]",
                        keysPerOctave: 36
                    },
                    {
                        name: "keys per octave: 24, factor=2^(1/24) [standard ET quartertones]",
                        keysPerOctave: 24
                    },
                    {
                        name: "keys per octave: 23, factor=2^(1/23)",
                        keysPerOctave: 23
                    },
                    {
                        name: "keys per octave: 22, factor=2^(1/22)",
                        keysPerOctave: 22
                    },
                    {
                        name: "keys per octave: 21, factor=2^(1/21)",
                        keysPerOctave: 21
                    },
                    {
                        name: "keys per octave: 20, factor=2^(1/20)",
                        keysPerOctave: 20
                    },
                    {
                        name: "keys per octave: 19, factor=2^(1/19) [octave at octave+fifth key]",
                        keysPerOctave: 19
                    },
                    {
                        name: "keys per octave: 18, factor=2^(1/18)",
                        keysPerOctave: 18
                    },
                    {
                        name: "keys per octave: 17, factor=2^(1/17)",
                        keysPerOctave: 17
                    },
                    {
                        name: "keys per octave: 16, factor=2^(1/16)",
                        keysPerOctave: 16
                    },
                    {
                        name: "keys per octave: 15, factor=2^(1/15)",
                        keysPerOctave: 15
                    },
                    {
                        name: "keys per octave: 14, factor=2^(1/14)",
                        keysPerOctave: 14
                    },
                    {
                        name: "keys per octave: 13, factor=2^(1/13)",
                        keysPerOctave: 13
                    },
                    {
                        name: "keys per octave: 12, factor=2^(1/12) [standard ET semitones]",
                        keysPerOctave: 12
                    },
                    {
                        name: "keys per octave: 11, factor=2^(1/11)",
                        keysPerOctave: 11
                    },
                    {
                        name: "keys per octave: 10, factor=2^(1/10)",
                        keysPerOctave: 10
                    },
                    {
                        name: "keys per octave: 9, factor=2^(1/9)",
                        keysPerOctave: 9
                    },
                    {
                        name: "keys per octave: 8, factor=2^(1/8)",
                        keysPerOctave: 8
                    },
                    {
                        name: "keys per octave: 7, factor=2^(1/7)",
                        keysPerOctave: 7
                    },
                    {
                        name: "keys per octave: 6, factor=2^(1/6)",
                        keysPerOctave: 6
                    },
                    {
                        name: "keys per octave: 5, factor=2^(1/5)",
                        keysPerOctave: 5
                    },
                    {
                        name: "keys per octave: 4, factor=2^(1/4)", //
                        keysPerOctave: 4
                    },
                    {
                        name: "keys per octave: 3, factor=2^(1/3)",
                        keysPerOctave: 3
                    },
                    {
                        name: "keys per octave: 2, factor=2^(1/2)",
                        keysPerOctave: 2
                    }
                ]
        },
        // Warped octave tunings
        {
            // This tuning group uses the following constructor:
            //   tuning = tuningsFactory.getWarpedTuning(keyValuesArray, "octaves");
            ctor: ResSynth.tuningType.WARPED_OCTAVES,
            name: "warped octave tunings",
            tunings:
                [
                    {
                        name: "White Note Equal Temperament",
                        keyValuesArray:
                            [
                                [0, 0],
                                [2, (12.0 / 7)],
                                [4, ((12.0 / 7) * 2)],
                                [5, ((12.0 / 7) * 3)],
                                [7, ((12.0 / 7) * 4)],
                                [9, ((12.0 / 7) * 5)],
                                [11, ((12.0 / 7) * 6)]
                            ]
                    },
                    {
                        name: "RWO 1: [[0, 0], [1, 11]]",
                        keyValuesArray:
                            [
                                [0, 0],
                                [1, 11]
                            ]
                    },
                    {
                        name: "RWO 2: [[0, 0], [11, 1]]",
                        keyValuesArray:
                            [
                                [0, 0],
                                [11, 1]
                            ]
                    },
                    {
                        name: "RWO 3: [[6, 6], [11, 17]]",
                        keyValuesArray:
                            [
                                [6, 6],
                                [11, 17]
                            ]
                    },
                    {
                        name: "RWO 4: [[0, 0], [4, 7], [7, 8.3], [11, 11.5]]",
                        keyValuesArray:
                            [
                                [0, 0],
                                [4, 7],
                                [7, 8.3],
                                [11, 11.5]
                            ]
                    },
                    {
                        name: "RWO 5: [[0, 5], [4, 12], [7, 13.3], [11, 16.5]]",
                        keyValuesArray:
                            [
                                [0, 5],
                                [4, 12],
                                [7, 13.3],
                                [11, 16.5]
                            ]
                    },
                    {
                        name: "RWO 6: [[0, 0], [6, 3], [7, 4], [9, 7]]",
                        keyValuesArray:
                            [
                                [0, 0],
                                [6, 3],
                                [7, 4],
                                [9, 7]
                            ]
                    },
                    {
                        name: "RWO 7 (=ET): [[0, 0], [11, 11]]",
                        keyValuesArray:
                            [
                                [0, 0],
                                [11, 11]
                            ]
                    }
                ]
        },
        // Warped gamut tunings
        {
            // This tuning group uses the following constructor:
            //   tuning = tuningsFactory.getWarpedTuning(keyValuesArray, "gamut");
            ctor: ResSynth.tuningType.WARPED_GAMUT,
            name: "warped gamut tunings",
            tunings:
                [
                    {
                        name: "Limited Quartertone Tuning [keys 36 to 84, pitches 36 to 60]]",
                        keyValuesArray:
                            [
                                [36, 36],
                                [84, 60]
                            ]
                    },
                    {
                        name: "Complete Quartertone Tuning [keys 0 to 127, pitches 24 to 87.5]",
                        keyValuesArray:
                            [
                                [0, 24],
                                [127, 87.5]
                            ]
                    },
                    {
                        name: "19 ET pitches per octave [keys 0 to 127]",
                        keyValuesArray:
                            [
                                [0, 12],
                                [19, 24],
                                [38, 36],
                                [57, 48],
                                [76, 60],
                                [95, 72],
                                [114, 84],
                                [127, 127]
                            ]
                    },
                    {
                        name: "23 ET pitches per octave [keys 0 to 127]",
                        keyValuesArray:
                            [
                                [0, 12],
                                [23, 24],
                                [46, 36],
                                [69, 48],
                                [92, 60],
                                [115, 72],
                                [127, 127]
                            ]
                    },
                    {
                        name: "Free Warped Tuning 1 [keys 0 to 127]",
                        keyValuesArray:
                            [
                                [0, 0],
                                [60, 60],
                                [65, 79],
                                [90, 90],
                                [127, 127]
                            ]
                    },
                    {
                        name: "Free Warped Tuning 2 [keys 0 to 127]",
                        keyValuesArray:
                            [
                                [0, 0],
                                [60, 60],
                                [65, 62.5],
                                [72, 72],
                                [127, 127]
                            ]
                    }
                ]
        },
        // Odd Harmonic tunings
        {
            // Constructor:   tunings = getHarmonicTunings(tuningGroupDef);
            // All harmonic tuning types use the same constructor, but with different arguments.
            // The constructor returns 12 128-note tunings, on 12 different root MidiKeys.
            //
            // The MidiPitches in the tuning at tuning index 0 begin with MidiPitch 0.00 at (root) MidiKey 0 (MIDI C).
            // Each further tuning is constructed by rotating tuning[0] (horizontally in the diagram below) so that
            // tuning[rootKey][rootMidiKey] is always rootMidiPitch, where rootMidiPitch is rootKey + 0.00.
            // For example, the root MidiPitch of tuning[5] is at MidiKey 5.
            // Each tuning has _perfect_ harmonic intervals with respect to its rootKey.
            // --------------------------------------------------------------------------------------------------------
            // Odd harmonic tunings are constructed using the first 12 _odd-numbered_natural_harmonics_ above each root.
            //
            //                              --- midiPitches per key (x) per tuning (y) ---
            // Note 1: In the lowest octave, all tunings are actually coerced to be greater than or equal to 0.
            //         In other octaves, _all_ tunings are such that tuning[rootKey][rootMidiKey] equals rootMidiKey + 0.00.
            // Note 2: Internally, MidiPitches are simple floating point values: Here, for convenience, they are rounded
            //         to the nearest cent.
            // Note 3: In accordance with the above definitions, integral midiPitches have standard equal temperament frequencies.
            //
            //                                                   midiKey
            //                     C     C#    D     D#    E     F     F#    G     G#    A     A#     B
            //                     0     1     2     3     4     5     6     7     8     9     10     11
            //                 ----------------------------------------------------------------------------
            //            C   0|   0     1.05  2.04  2.98  3.86  4.71  5.51  7.02  7.73  8.41   9.69  10.88
            //            C#  1|  -0.12  1     2.05  3.04  3.98  4.86  5.71  6.51  8.02  8.73   9.41  10.69
            //            D   2|  -0.31  0.88  2     3.05  4.04  4.98  5.86  6.71  7.51  9.02   9.73  10.41
            //            D#  3|  -0.59  0.69  1.88  3     4.05  5.04  5.98  6.86  7.71  8.51  10.02  10.73
            //   tuning   E   4|  -0.27  0.41  1.69  2.88  4     5.05  6.04  6.98  7.86  8.71   9.51  11.02
            //  (rootKey) F   5|   0.02  0.73  1.41  2.69  3.88  5     6.05  7.04  7.98  8.86   9.71  10.51
            //            F#  6|  -0.49  1.02  1.73  2.41  3.69  4.88  6     7.05  8.04  8.98   9.86  10.71
            //            G   7|  -0.29  0.51  2.02  2.73  3.41  4.69  5.88  7     8.05  9.04   9.98  10.86
            //            G#  8|  -0.14  0.71  1.51  3.02  3.73  4.41  5.69  6.88  8     9.05  10.04  10.98
            //            A   9|  -0.02  0.86  1.71  2.51  4.02  4.73  5.41  6.69  7.88  9     10.05  11.04
            //            A# 10|   0.04  0.98  1.86  2.71  3.51  5.02  5.73  6.41  7.69  8.88  10     11.05
            //            B  11|   0.05  1.04  1.98  2.86  3.71  4.51  6.02  6.73  7.41  8.69   9.88  11
            // -----------------------------------------------------------------------------------------------------------------------------------
            //
            //                                 --- pivot keys: keys whose tuning difference is <= 0.05 in tunings x and y. ---
            // Note 1: The key values are mirrored along the "ALL" diagonal. (Either the x or y tuning can be thought of as the target).
            // Note 2: The _key_ values in this table are also _absolute_, i.e.: 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B.
            //
            //                                                                   target tuning
            //                  C         C#        D         D#        E         F         F#        G         G#        A         A#        B
            //                  0         1         2         3         4         5         6         7         8         9         10        11
            //              ------------------------------------------------------------------------------------------------------------------------
            //         C   0|   ALL       1,2       2,10      3,8       7         0,4,7,10  1,7       2,5,7,11  3         0,5       0,8       0,1
            //         C#  1|   1,2       ALL       2,3       3,11      4,9       8         1,5,8,11  2,8       0,3,6,8   4         1,6       1,9
            //         D   2|   2,10      2,3       ALL       3,4       0,4       5,10      9         0,2,6,9   3,9       1,4,7,9   5         2,7
            //         D#  3|   3,8       3,11      3,4       ALL       4,5       1,5       6,11      10        1,3,7,10  4,10      2,5,8,10  6
            //         E   4|   7         4,9       0,4       4,5       ALL       5,6       2,6       0,7       11        2,4,8,11  5,11      3,6,9,11
            // initial F   5|   0,4,7,10  8         5,10      1,5       5,6       ALL       6,7       3,7       1,8       0         0,3,5,9   0,6
            //  tuning F#  6|   1,7       1,5,8,11  9         6,11      2,6       6,7       ALL       7,8       4,8       2,9       1         1,4,6,10
            //         G   7|   2,5,7,11  2,8       0,2,6,9   10        0,7       3,7       7,8       ALL       8,9       5,9       3,10      2
            //         G#  8|   3         0,3,6,8   3,9       1,3,7,10  11        1,8       4,8       8,9       ALL       9,10      6,10      4,11
            //         A   9|   0,5       4         1,4,7,9   4,10      2,4,8,11  0         2,9       5,9       9,10      ALL       10,11     7,11
            //         A# 10|   0,8       1,6       5         2,5,8,10  5,11      0,3,5,9   1         3,10      6,10      10,11     ALL       0,11
            //         B  11|   0,1       1,9       2,7       6         3,6,9,11  0,6       1,4,6,10  2         4,11      7,11      0,11      ALL      
            //
            // =====================================================================================================================================
            ctor: ResSynth.tuningType.ODD_HARMONIC,
            name: "odd harmonic tunings",
            keyFactorArray:
                [
                    [57, 1], // A
                    [64, 3 / 2], // E(5th above A)
                    [61, 5 / 4], // C# (3rd above A)
                    [67, 7 / 4], // G
                    [59, 9 / 8], // B (5th above E)
                    [63, 11 / 8], // D#
                    [66, 13 / 8], // F#
                    [68, 15 / 8], // G# (5th above C#, 3rd above E)
                    [58, 17 / 16], // A#
                    [60, 19 / 16], // C
                    [62, 21 / 16], // D (5th above G)
                    [65, 25 / 16]  // F (3rd above C#) -- N.B.: 25/16, not 23/16.
                ],
            tunings:
                [
                    {
                        name: "C&emsp;|| Perfect Major Triads: C-E-G, G-B-D, E-G#-B. Perfect Fifth: Bb-F",
                        root: 48 // C key
                    },
                    {
                        name: "C# || Perfect Major Triads:  C#-F-G#, G#-C-D#, F-A-C; Perfect Fifth: B-F#",
                        root: 49 // C# key
                    },
                    {
                        name: "D&emsp;|| Perfect Major Triads: D-F#-A, A-C#-E, F#-A#-C#; Perfect Fifth: C-G",
                        root: 50 // D key
                    },
                    {
                        name: "Eb || Perfect Major Triads: Eb-G-Bb, Bb-D-F, G-B-D; Perfect Fifth: Db-Ab",
                        root: 51 // Eb key
                    },
                    {
                        name: "E&emsp;|| Perfect Major Triads: E-G#-B, B-D#-F#, Ab-C-Eb, ; Perfect Fifth: D-A",
                        root: 52 // E key
                    },
                    {
                        name: "F&emsp;|| Perfect Major Triads: F-A-C, C-E-G, A-C#-E; Perfect Fifth: D#-A#",
                        root: 53 // F key
                    },
                    {
                        name: "F# || Perfect Major Triads: F#-A#-C#, Db-F-Ab, Bb-D-F; Perfect Fifth: E-B",
                        root: 54 // F# key
                    },
                    {
                        name: "G&emsp;|| Perfect Major Triads: G-B-D, D-F#-A, B-D#-F#; Perfect Fifth: F-C",
                        root: 55 // G key
                    },
                    {
                        name: "Ab || Perfect Major Triads: Ab-C-Eb, Eb-G-Bb, C-E-G; Perfect Fifth: Gb-Db",
                        root: 56 // Ab key
                    },
                    {
                        name: "A&emsp;|| Perfect Major Triads: A-C#-E, E-G#-B, Db-F-Ab; Perfect Fifth: G-D",
                        root: 57 // A key
                    },
                    {
                        name: "Bb || Perfect Major Triads: Bb-D-F, F-A-C, D-F#-A, ; Perfect Fifth: Ab-Eb",
                        root: 58 // Bb key
                    },
                    {
                        name: "B&emsp;|| Perfect Major Triads: B-D#-F#, F#-A#-C#, Eb-G-Bb; Perfect Fifth: A-E",
                        root: 59 // B key
                    }
                ]
        },
        // Inverted Odd Harmonic tunings
        {
            // Constructor:   tunings = getHarmonicTunings(tuningGroupDef);
            // All harmonic tuning types use the same constructor, but with different arguments.
            // The constructor returns 12 128-note tunings, on 12 different root MidiKeys.
            //
            // The MidiPitches in the tuning at tuning index 0 begin with MidiPitch 0.00 at (root) MidiKey 0 (MIDI C).
            // Each further tuning is constructed by rotating tuning[0] (horizontally in the diagram below) so that
            // tuning[rootKey][rootMidiKey] is always rootMidiPitch, where rootMidiPitch is rootKey + 0.00.
            // For example, the root MidiPitch of tuning[5] is at MidiKey 5.
            // Each tuning has _perfect_ harmonic intervals with respect to its rootKey.
            // --------------------------------------------------------------------------------------------------------
            // Inverted harmonic tunings are constructed using the first 12 odd-numbered natural harmonics _below_ each root,
            // as if the harmonic is, in fact, the root: The factors are the reciprocals of the corresponding odd harmonic
            // factors multiplied by two. The key numbers correspond to the inverted intervals re the root, transposed an
            // octave higher. (See below.)
            //
            //                   --- midiPitches per key (x) per tuning (y) (diagonal tunings) ---
            // Note 1: In the lowest octave, all tunings are actually coerced to be greater than or equal to 0.
            //         In other octaves, _all_ tunings are such that tuning[rootKey][rootMidiKey] equals rootMidiKey + 0.00.
            // Note 2: Internally, MidiPitches are simple floating point values: Here, for convenience, they are rounded
            //         to the nearest cent.
            // Note 3: In accordance with the above definitions, integral midiPitches have standard equal temperament frequencies.
            //
            //                                                   midiKey
            //                     C     C#    D     D#    E     F     F#    G     G#    A     A#     B
            //                     0     1     2     3     4     5     6     7     8     9     10     11
            //                 ----------------------------------------------------------------------------
            //            C   0|  0      1.12  2.31  3.59  4.27  4.98  6.49  7.29  8.14  9.02   9.96  10.95
            //            C#  1|  -0.05  1     2.12  3.31  4.59  5.27  5.98  7.49  8.29  9.14  10.02  10.96
            //            D   2|  -0.04  0.95  2     3.12  4.31  5.59  6.27  6.98  8.49  9.29  10.14  11.02
            //            D#  3|  0.02   0.96  1.95  3     4.12  5.31  6.59  7.27  7.98  9.49  10.29  11.14
            //   tuning   E   4|  0.14   1.02  1.96  2.95  4     5.12  6.31  7.59  8.27  8.98  10.49  11.29
            //  (rootKey) F   5|  0.29   1.14  2.02  2.96  3.95  5     6.12  7.31  8.59  9.27   9.98  11.49
            //            F#  6|  0.49   1.29  2.14  3.02  3.96  4.95  6     7.12  8.31  9.59  10.27  10.98
            //            G   7|  -0.02  1.49  2.29  3.14  4.02  4.96  5.95  7     8.12  9.31  10.59  11.27
            //            G#  8|  0.27   0.98  2.49  3.29  4.14  5.02  5.96  6.95  8     9.12  10.31  11.59
            //            A   9|  0.59   1.27  1.98  3.49  4.29  5.14  6.02  6.96  7.95  9     10.12  11.31
            //            A# 10|  0.31   1.59  2.27  2.98  4.49  5.29  6.14  7.02  7.96  8.95  10     11.12
            //            B  11|  0.12   1.31  2.59  3.27  3.98  5.49  6.29  7.14  8.02  8.96   9.95  11
            // -----------------------------------------------------------------------------------------------------------------------------------
            //
            //                                 --- pivot keys: keys whose tuning difference is <= 0.05 in tunings x and y. ---
            // Note 1: The key values are mirrored along the "ALL" diagonal. (Either the x or y tuning can be thought of as the target).
            // Note 2: The _key_ values in this table are also _absolute_, i.e.: 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B.
            //                                                                   target tuning
            //                  C         C#        D         D#        E         F         F#        G         G#        A         A#        B
            //                  0         1         2         3         4         5         6         7         8         9         10        11
            //              ------------------------------------------------------------------------------------------------------------------------
            //         C   0|   ALL       0,11      0,4       0,7       9         1,5,7,10  5,11      0,2,5,8   5         4,9       2,10      10,11
            //         C#  1|   0,11      ALL       0,1       1,5       1,8       10        2,6,8,11  0,6       1,3,6,9   6         5,10      3,11
            //         D   2|   0,4       0,1       ALL       1,2       2,6       2,9       11        0,3,7,9   1,7       2,4,7,10  7         6,11
            //         D#  3|   0,7       1,5       1,2       ALL       2,3       3,7       3,10      0         1,4,8,10  2,8       3,5,8,11  8
            //         E   4|   9         1,8       2,6       2,3       ALL       3,4       4,8       4,11      1         2,5,9,11  3,9       0,4,6,9
            // initial F   5|   1,5,7,10  10        2,9       3,7       3,4       ALL       4,5       5,9       0,5       2         0,3,6,10  4,10
            //  tuning F#  6|   5,11      2,6,8,11  11        3,10      4,8       4,5       ALL       5,6       6,10      1,6       3         1,4,7,11
            //         G   7|   0,2,5,8   0,6       0,3,7,9   0         4,11      5,9       5,6       ALL       6,7       7,11      2,7       4
            //         G#  8|   5         1,3,6,9   1,7       1,4,8,10  1         0,5       6,10      6,7       ALL       7,8       0,8       3,8
            //         A   9|   4,9       6         2,4,7,10  2,8       2,5,9,11  2         1,6       7,11      7,8       ALL       8,9       1,9
            //         A# 10|   2,10      5,10      7         3,5,8,11  3,9       0,3,6,10  3         2,7       0,8       8,9       ALL       9,10
            //         B  11|   10,11     3,11      6,11      8         0,4,6,9   4,10      1,4,7,11  4         3,8       1,9       9,10      ALL     
            //
            // =====================================================================================================================================
            ctor: ResSynth.tuningType.INVERTED_ODD_HARMONIC,
            name: "inverted odd harmonic tunings",
            keyFactorArray:
                [
                    // These factors are the reciprocals of the corresponding odd harmonic factors multiplied by two.
                    // The key numbers correspond to the inverted intervals re the root, transposed an octave higher.
                    [57, 1],       // A                             odd: [57, 1], // A
                    [62, 4 / 3],   // D(5th below, 4th above A)     odd: [64, 3 / 2], // E(5th above A)
                    [65, 8 / 5],   // F (3rd below, 6th above A)    odd: [61, 5 / 4], // C# (3rd above A)
                    [59, 8 / 7],   // B                             odd: [67, 7 / 4], // G
                    [67, 16 / 9],  // G (5th below, 4th above D)    odd: [59, 9 / 8], // B (5th above E)
                    [63, 16 / 11], // D#                            odd: [63, 11 / 8], // D#
                    [60, 16 / 13], // C                             odd: [66, 13 / 8], // F#
                    [58, 16 / 15], // A# (5th below F, 3rd below D) odd: [68, 15 / 8], // G# (5th above C#, 3rd above E)
                    [68, 32 / 17], // G#                            odd: [58, 17 / 16], // A#
                    [66, 32 / 19], // F#                            odd: [60, 19 / 16], // C
                    [64, 32 / 21], // E (5th below, 4th above B)    odd: [62, 21 / 16], // D (5th above G)
                    [61, 32 / 25]  // C# (3rd below, 6th above F)   odd: [65, 25 / 16]  // F (3rd above C#) -- N.B.: 25/16, not 23/16.
                ],
            tunings:
                [
                    {
                        name: "C&emsp;|| Perfect Minor Triads: Bb-Db-F, C#-E-G#, F-Ab-C; Perfect Fifth: G-D",
                        root: 48 // C key
                    },
                    {
                        name: "C# || Perfect Minor Triads: B-D-F#, D-F-A, Gb-A-Db; Perfect Fifth: Ab-Eb",
                        root: 49 // C# key
                    },
                    {
                        name: "D&emsp;|| Perfect Minor Triads: C-Eb-G, Eb-Gb-Bb, G-Bb-D; Perfect Fifth: A-E",
                        root: 50 // D key
                    },
                    {
                        name: "Eb || Perfect Minor Triads: C#-E-G#, E-G-B, G#-B-D#; Perfect Fifth: Bb-F",
                        root: 51 // Eb key
                    },
                    {
                        name: "E&emsp;|| Perfect Minor Triads: D-F-A, F-Ab-C, A-C-E; Perfect Fifth: B-F#",
                        root: 52 // E key
                    },
                    {
                        name: "F&emsp;|| Perfect Minor Triads: Eb-Gb-Bb, F#-A-C#, Bb-Db-F; Perfect Fifth: C-G",
                        root: 53 // F key
                    },
                    {
                        name: "F# || Perfect Minor Triads: E-G-B, G-Bb-D, B-D-F#; Perfect Fifth: C#-G#",
                        root: 54 // F# key
                    },
                    {
                        name: "G&emsp;|| Perfect Minor Triads: F-Ab-C, G#-B-D#, C-Eb-G; Perfect Fifth: D-A",
                        root: 55 // G key
                    },
                    {
                        name: "Ab || Perfect Minor Triads: F#-A-C#, A-C-E, Db-E-Ab; Perfect Fifth: Eb-Bb",
                        root: 56 // Ab key
                    },
                    {
                        name: "A&emsp;|| Perfect Minor Triads: G-Bb-D, Bb-Db-F, D-F-A; Perfect Fifth: E-B",
                        root: 57 // A key
                    },
                    {
                        name: "Bb || Perfect Minor Triads: G#-B-D#, B-D-F#, Eb-Gb-Bb; Perfect Fifth: F-C",
                        root: 58 // Bb key
                    },
                    {
                        name: "B&emsp;|| Perfect Minor Triads: A-C-E, C-Eb-G, E-G-B; Perfect Fifth: F#-C#",
                        root: 59 // B key
                    }
                ]
        },
        // Prime Harmonic tunings
        {
            // Constructor:   tunings = getHarmonicTunings(tuningGroupDef);
            // All harmonic tuning types use the same constructor, but with different arguments.
            // The constructor returns 12 128-note tunings, on 12 different root MidiKeys.
            //
            // The MidiPitches in the tuning at tuning index 0 begin with MidiPitch 0.00 at (root) MidiKey 0 (MIDI C).
            // Each further tuning is constructed by rotating tuning[0] (horizontally in the diagram below) so that
            // tuning[rootKey][rootMidiKey] is always rootMidiPitch, where rootMidiPitch is rootKey + 0.00.
            // For example, the root MidiPitch of tuning[5] is at MidiKey 5.
            // Each tuning has _perfect_ harmonic intervals with respect to its rootKey.
            // --------------------------------------------------------------------------------------------------------
            // Prime harmonic tunings are constructed using the first 12 odd prime natural harmonics above each root.
            // (The first 12 odd primes are: 1, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37.)
            //
            //                              --- midiPitches per key (x) per tuning (y) ---
            // Note 1: In the lowest octave, all tunings are actually coerced to be greater than or equal to 0.
            //         In other octaves, _all_ tunings are such that tuning[rootKey][rootMidiKey] equals rootMidiKey + 0.00.
            // Note 2: Internally, MidiPitches are simple floating point values: Here, for convenience, they are rounded
            //         to the nearest cent.
            // Note 3: In accordance with the above definitions, integral midiPitches have standard equal temperament frequencies.
            //
            //                                                   midiKey
            //                    C     C#    D     D#    E     F     F#    G     G#    A     A#     B
            //                    0     1     2     3     4     5     6     7     8     9     10     11
            //                 ---------------------------------------------------------------------------
            //            C   0|  0     1.05  2.51  2.98  3.86  5.51  6.28  7.02  8.41  9.69  10.3   11.45
            //            C#  1|  0.45  1     2.05  3.51  3.98  4.86  6.51  7.28  8.02  9.41  10.69  11.3
            //            D   2|  0.3   1.45  2     3.05  4.51  4.98  5.86  7.51  8.28  9.02  10.41  11.69
            //            D#  3|  0.69  1.3   2.45  3     4.05  5.51  5.98  6.86  8.51  9.28  10.02  11.41
            //   tuning   E   4|  0.41  1.69  2.3   3.45  4     5.05  6.51  6.98  7.86  9.51  10.28  11.02
            // (root key) F   5|  0.02  1.41  2.69  3.3   4.45  5     6.05  7.51  7.98  8.86  10.51  11.28
            //            F#  6|  0.28  1.02  2.41  3.69  4.3   5.45  6     7.05  8.51  8.98   9.86  11.51
            //            G   7|  0.51  1.28  2.02  3.41  4.69  5.3   6.45  7     8.05  9.51   9.98  10.86
            //            G#  8| -0.14  1.51  2.28  3.02  4.41  5.69  6.3   7.45  8     9.05  10.51  10.98
            //            A   9| -0.02  0.86  2.51  3.28  4.02  5.41  6.69  7.3   8.45  9     10.05  11.51
            //            A# 10|  0.51  0.98  1.86  3.51  4.28  5.02  6.41  7.69  8.3   9.45  10     11.05
            //            B  11|  0.05  1.51  1.98  2.86  4.51  5.28  6.02  7.41  8.69  9.3   10.45  11
            // _____________________________________________________________________________________________________________________________________
            //
            //                                 --- pivot keys: keys whose tuning difference is <= 0.05 in tunings x and y. ---
            // Note 1: The key values are mirrored along the "ALL" diagonal. (Either the x or y tuning can be thought of as the target).
            // Note 2: The _key_ values in this table are also _absolute_, i.e.: 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B.
            //
            //                                                                   target tuning
            //                  C         C#        D         D#        E         F         F#        G         G#        A        A#       B
            //                  0         1         2         3         4         5         6         7         8         9        10       11
            //              ----------------------------------------------------------------------------------------------------------------------
            //         C   0|   ALL       1         -         3,5,11    7,10      0         1,7       7         3,6       0,2,8     -         0
            //         C#  1|   1         ALL       2         -         0,4,6     8,11      1         2,8       8         4,7       1,3,9     -
            //         D   2|   -         2         ALL       3         -         1,5,7     0,9       2         3,9       9         5,8       2,4,10
            //         D#  3|   3,5,11    -         3         ALL       4         -         2,6,8     1,10      3         4,10      10        6,9
            //         E   4|   7,10      0,4,6     -         4         ALL       5         -         3,7,9     2,11      4         5,11      11
            // initial F   5|   0         8,11      1,5,7     -         5         ALL       6         -         4,8,10    0,3       5         0,6
            //  tuning F#  6|   1,7       1         0,9       2,6,8     -         6         ALL       7         -         5,9,11    1,4       6
            //         G   7|   7         2,8       2         1,10      3,7,9     -         7         ALL       8         -         0,6,10    2,5
            //         G#  8|   3,6       8         3,9       3         2,11      4,8,10    -         8         ALL       9         -         1,7,11
            //         A   9|   0,2,8     4,7       9         4,10      4         0,3       5,9,11    -         9         ALL       10        -
            //         A# 10|   -         1,3,9     5,8       10        5,11      5         1,4       0,6,10    -         10        ALL       11
            //         B  11|   0         -         2,4,10    6,9       11        0,6       6         2,5       1,7,11    -         11        ALL     
            //
            // =====================================================================================================================================
            ctor: ResSynth.tuningType.PRIME_HARMONIC,
            name: "prime harmonic tunings",
            keyFactorArray:
                [
                    [57, 1], // A
                    [64, 3 / 2], // E(5th above A)
                    [61, 5 / 4], // C# (3rd above A)
                    [66, 7 / 4], // F#
                    [62, 11 / 8], // D
                    [65, 13 / 8], // F
                    [58, 17 / 16], // A#
                    [60, 19 / 16], // C
                    [63, 23 / 16], // D#
                    [67, 29 / 16], // G
                    [68, 31 / 16], // G#
                    [59, 37 / 32]  // B
                ],
            tunings:
                [
                    {
                        name: "C&emsp;|| Perfect Major Triad C-E-G",
                        root: 48 // C key
                    },
                    {
                        name: "Db || Perfect Major Triad Db-F-Ab",
                        root: 49 // C# key
                    },
                    {
                        name: "D&emsp;|| Perfect Major Triad D-F#-A",
                        root: 50 // D key
                    },
                    {
                        name: "Eb || Perfect Major Triad Eb-G-Bb",
                        root: 51 // D# key
                    },
                    {
                        name: "E&emsp;|| Perfect Major Triad E-G#-B",
                        root: 52 // E key
                    },
                    {
                        name: "F&emsp;|| Perfect Major Triad F-A-C",
                        root: 53 // F key
                    },
                    {
                        name: "F# || Perfect Major Triad F#-A#-C#",
                        root: 54 // F# key
                    },
                    {
                        name: "G&emsp;|| Perfect Major Triad G-B-D",
                        root: 55 // G key
                    },
                    {
                        name: "Ab || Perfect Major Triad Ab-C-Eb",
                        root: 56 // Ab key
                    },
                    {
                        name: "A&emsp;|| Perfect Major Triad A-C#-E",
                        root: 57 // A key
                    },
                    {
                        name: "Bb || Perfect Major Triad Bb-D-F",
                        root: 58 // Bb key
                    },
                    {
                        name: "B&emsp;|| Perfect Major Triad B-D#-F#",
                        root: 59 // B key
                    }
                ]
        },
        // Inverted Prime Harmonic tunings
        {
            // Constructor:   tunings = getHarmonicTunings(tuningGroupDef);
            // All harmonic tuning types use the same constructor, but with different arguments.
            // The constructor returns 12 128-note tunings, on 12 different root MidiKeys.
            //
            // The MidiPitches in the tuning at tuning index 0 begin with MidiPitch 0.00 at (root) MidiKey 0 (MIDI C).
            // Each further tuning is constructed by rotating tuning[0] (horizontally in the diagram below) so that
            // tuning[rootKey][rootMidiKey] is always rootMidiPitch, where rootMidiPitch is rootKey + 0.00.
            // For example, the root MidiPitch of tuning[5] is at MidiKey 5.
            // Each tuning has _perfect_ harmonic intervals with respect to its rootKey.
            // --------------------------------------------------------------------------------------------------------
            // Inverted prime harmonic tunings are constructed using the first 12 odd prime natural harmonics _below_ each root,
            // as if the harmonic is, in fact, the root: The factors are the reciprocals of the corresponding odd prime harmonic
            // factors multiplied by two. The key numbers correspond to the inverted intervals re the root, transposed an
            // octave higher. (See below.)
            //
            //                   --- midiPitches per key (x) per tuning (y) (diagonal tunings) ---
            // Note 1: In the lowest octave, all tunings are actually coerced to be greater than or equal to 0.
            //         In other octaves, _all_ tunings are such that tuning[rootKey][rootMidiKey] equals rootMidiKey + 0.00.
            // Note 2: Internally, MidiPitches are simple floating point values: Here, for convenience, they are rounded
            //         to the nearest cent.
            // Note 3: In accordance with the above definitions, integral midiPitches have standard equal temperament frequencies.
            //
            //                                                   midiKey
            //                    C     C#    D     D#    E     F     F#    G     G#    A     A#     B
            //                    0     1     2     3     4     5     6     7     8     9     10     11
            //                 ---------------------------------------------------------------------------
            //            C   0|  0     0.55  1.7   2.31  3.59  4.98  5.72  6.49  8.14  9.02   9.49  10.95
            //            C#  1| -0.05  1     1.55  2.7   3.31  4.59  5.98  6.72  7.49  9.14  10.02  10.49
            //            D   2| -0.51  0.95  2     2.55  3.7   4.31  5.59  6.98  7.72  8.49  10.14  11.02
            //            D#  3|  0.02  0.49  1.95  3     3.55  4.7   5.31  6.59  7.98  8.72   9.49  11.14
            //   tuning   E   4|  0.14  1.02  1.49  2.95  4     4.55  5.7   6.31  7.59  8.98   9.72  10.49
            // (root key) F   5| -0.51  1.14  2.02  2.49  3.95  5     5.55  6.7   7.31  8.59   9.98  10.72
            //            F#  6| -0.28  0.49  2.14  3.02  3.49  4.95  6     6.55  7.7   8.31   9.59  10.98
            //            G   7| -0.02  0.72  1.49  3.14  4.02  4.49  5.95  7     7.55  8.7    9.31  10.59
            //            G#  8| -0.41  0.98  1.72  2.49  4.14  5.02  5.49  6.95  8     8.55   9.7   10.31
            //            A   9| -0.69  0.59  1.98  2.72  3.49  5.14  6.02  6.49  7.95  9      9.55  10.7
            //            A# 10| -0.3   0.31  1.59  2.98  3.72  4.49  6.14  7.02  7.49  8.95  10     10.55
            //            B  11| -0.45  0.7   1.31  2.59  3.98  4.72  5.49  7.14  8.02  8.49   9.95  11     
            // ------------------------------------------------------------------------------------------------------------------------------------
            //
            //                                 --- pivot keys: keys whose tuning difference is <= 0.05 in tunings x and y. ---
            // Note 1: The key values are mirrored along the "ALL" diagonal. (Either the x or y tuning can be thought of as the target).
            // Note 2: The _key_ values in this table are also _absolute_, i.e.: 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B.
            //
            //                                                                   target tuning
            //                  C         C#        D         D#        E         F         F#        G         G#        A        A#       B
            //                  0         1         2         3         4         5         6         7         8         9        10       11
            //              ----------------------------------------------------------------------------------------------------------------------
            //         C   0|   ALL       0         -         0,4,10    6,9       5         5,11      0         2,5       1,7,9    -        11
            //         C#  1|   0         ALL       1         -         1,5,11    7,10      6         0,6       1         3,6      2,8,10   -
            //         D   2|   -         1         ALL       2         -         0,2,6     8,11      7         1,7       2        4,7      3,9,11
            //         D#  3|   0,4,10    -         2         ALL       3         -         1,3,7     0,9       8         2,8      3        5,8
            //         E   4|   6,9       1,5,11    -         3         ALL       4         -         2,4,8     1,10      9        3,9      4
            // initial F   5|   5         7,10      0,2,6     -         4         ALL       5         -         3,5,9     2,11     10       4,10
            //  tuning F#  6|   5,11      6         8,11      1,3,7     -         5         ALL       6         -         4,6,10   0,3      11
            //         G   7|   0         0,6       7         0,9       2,4,8     -         6         ALL       7         -        5,7,11   1,4
            //         G#  8|   2,5       1         1,7       8         1,10      3,5,9     -         7         ALL       8        -        0,6,8
            //         A   9|   1,7,9     3,6       2         2,8       9         2,11      4,6,10    -         8         ALL      9        -
            //         A# 10|   -         2,8,10    4,7       3         3,9       10        0,3       5,7,11    -         9        ALL      10
            //         B  11|   11        -         3,9,11    5,8       4         4,10      11        1,4       0,6,8     -        10       ALL       
            //
            // =====================================================================================================================================
            ctor: ResSynth.tuningType.INVERTED_PRIME_HARMONIC,
            name: "inverted prime harmonic tunings",
            keyFactorArray:
                [
                    // These factors are the reciprocals of the corresponding prime harmonic factors multiplied by two.
                    // The key numbers correspond to the inverted intervals re the root, transposed an octave higher.
                    [57, 1],       // A                prime: [57, 1],       // A
                    [62, 4 / 3],   // D(5th below A)   prime: [64, 3 / 2],   // E(5th above A)
                    [65, 8 / 5],   // F (3rd below A)  prime: [61, 5 / 4],   // C# (3rd above A)
                    [60, 8 / 7],   // C                prime: [66, 7 / 4],   // F#
                    [64, 16 / 11], // E                prime: [62, 11 / 8],  // D
                    [61, 16 / 13], // C#               prime: [65, 13 / 8],  // F
                    [68, 32 / 17], // G#               prime: [58, 17 / 16], // A#
                    [66, 32 / 19], // F#               prime: [60, 19 / 16], // C
                    [63, 32 / 23], // D#               prime: [63, 23 / 16], // D#
                    [59, 32 / 29], // B                prime: [67, 29 / 16], // G
                    [58, 32 / 31], // A#               prime: [68, 31 / 16], // G#
                    [67, 64 / 37]  // G                prime: [59, 37 / 32]  // B
                ],
            tunings:
                [
                    {
                        name: "C&emsp;|| Perfect Minor Triad F-Ab-C",
                        root: 48 // C key
                    },
                    {
                        name: "C# || Perfect Minor Triad F#-A-C#",
                        root: 49 // C# key
                    },
                    {
                        name: "D&emsp;|| Perfect Minor Triad G-Bb-D",
                        root: 50 // D key
                    },
                    {
                        name: "D# || Perfect Minor Triad G#-B-D#",
                        root: 51 // D# key
                    },
                    {
                        name: "E&emsp;|| Perfect Minor Triad A-C-E",
                        root: 52 // E key
                    },
                    {
                        name: "F&emsp;|| Perfect Minor Triad Bb-Db-F",
                        root: 53 // F key
                    },
                    {
                        name: "F# || Perfect Minor Triad B-D-F#",
                        root: 54 // F# key
                    },
                    {
                        name: "G&emsp;|| Perfect Minor Triad C-Eb-G",
                        root: 55 // G key
                    },
                    {
                        name: "G# || Perfect Minor Triad C#-E-G#",
                        root: 56 // Ab key
                    },
                    {
                        name: "A&emsp;|| Perfect Minor Triad D-F-A",
                        root: 57 // A key
                    },
                    {
                        name: "Bb || Perfect Minor Triad Eb-Gb-Bb",
                        root: 58 // Bb key
                    },
                    {
                        name: "B&emsp;|| Perfect Minor Triad E-G-B",
                        root: 59 // B key
                    }
                ]
        },
        // Baroque collection (Poletti)
        {
            // This tuning group uses the following constructor:
            //   tuning = getBaroqueTuning(tuningOffsets);
            ctor: ResSynth.tuningType.BAROQUE,
            name: "Baroque (Poletti):  Circulating/Rational (A4=414Hz)",
            tunings:
                [
                    {
                        name: 'Sorge 1758 Zuverl\u{E4}ssige Anweisung p.20 "die beste bei einer Chort\u{F6}nigen Orgel"',
                        offsets: [0.0, -3.9, -3.9, -2.0, -5.9, -2.0, -3.9, -2.0, -2.0, -5.9, -2.0, -3.9]
                    },
                    {
                        name: 'Sorge 1744 Anweisung zur Stimmung und Temperatur p.23 #1',
                        offsets: [0.0, -3.9, -3.9, -2.0, -5.9, 0.0, -3.9, -2.0, -3.9, -5.9, 0.0, -3.9]
                    },
                    {
                        name: 'Sorge 1744 Anweisung zur Stimmung und Temperatur p.23 #2',
                        offsets: [0.0, -2.0, -3.9, 2.0, -3.9, 2.0, -2.0, -2.0, 0.0, -3.9, 2.0, -2.0]
                    },
                    {
                        name: 'Sorge 1741 Genealogia allegorica intervallorum p.42',
                        offsets: [0.0, -2.0, -2.0, 2.0, -3.9, 2.0, -2.0, -2.0, 0.0, -2.0, 2.0, -2.0]
                    },
                    {
                        name: 'Neidhardt 1724 "Grosse Stadt"',
                        offsets: [0.0, -3.9, -3.9, -2.0, -5.9, -2.0, -3.9, -2.0, -3.9, -5.9, -2.0, -3.9]
                    },
                    {
                        name: 'Neidhardt 1724 "Kleine Stadt" / 1732 "Grosse Stadt"',
                        offsets: [0.0, -3.9, -3.9, -2.0, -5.9, 0.0, -3.9, -2.0, -3.9, -5.9, 0.0, -3.9]
                    },
                    {
                        name: 'Neidhardt 1724 "Dorf" / 1732 "Kleine Stadt"',
                        offsets: [0.0, -5.9, -3.9, -3.9, -7.8, -2.0, -7.8, -2.0, -3.9, -5.9, -3.9, -7.8]
                    },
                    {
                        name: 'Neidhardt 1732 "Dorf"',
                        offsets: [0.0, -5.9, -2.0, -3.9, -9.8, -2.0, -7.8, 0.0, -5.9, -5.9, -2.0, -7.8]
                    },
                    {
                        name: 'Young\u{B4}s "nearly the same" simplification of his 3/16th S. comma mollified meantone',
                        offsets: [0.0, -9.8, -3.9, -5.9, -7.8, -2.0, -11.7, -2.0, -7.8, -5.9, -3.9, -9.8]
                    }
                ]
        },
        {
            // This tuning group uses the following constructor:
            //   tuning = getBaroqueTuning(tuningOffsets);
            ctor: ResSynth.tuningType.BAROQUE,
            name: "Baroque (Poletti):  Circulating/Pragmatic (A4=414Hz)",
            tunings:
                [
                    {
                        name: 'Werckmeister 1681-I/1691-III Circulating 1/4 Syntonic Comma',
                        offsets: [0.0, -8.1, -6.8, -4.9, -8.3, -1.6, -9.8, -3.4, -6.5, -10.3, -3.3, -6.4]
                    },
                    {
                        name: 'Werckmeister 1681-II/1691-IV Circulating 1/3 Syntonic Comma',
                        offsets: [0.0, -16.2, -3.6, -5.5, -7.3, -1.6, -10.9, -5.2, -14.6, -8.9, 3.6, -12.5]
                    },
                    {
                        name: 'Werckmeister 1691-V Circulating 1/4 Syntonic Comma',
                        offsets: [0.0, -2.4, 3.9, 1.5, -2.9, 3.4, 1.0, 2.0, -5.9, 0.5, 2.4, -1.0]
                    },
                    {
                        name: 'Bendeler III (ca. 1690)',
                        offsets: [0.0, -3.9, -7.8, -5.9, -3.9, -2.0, -5.9, -3.9, -2.0, -5.9, -3.9, -7.8]
                    },
                    {
                        name: 'Bendeler II (ca. 1690)',
                        offsets: [0.0, -9.8, -3.9, -5.9, -7.8, -2.0, -3.9, -5.9, -7.8, -9.8, -3.9, -5.9]
                    },
                    {
                        name: 'Bendeler I (ca. 1690)',
                        offsets: [0.0, -9.8, -11.7, -5.9, -7.8, -2.0, -11.7, -5.9, -7.8, -9.8, -3.9, -5.9]
                    }
                ]
        },
        {
            // This tuning group uses the following constructor:
            //   tuning = getBaroqueTuning(tuningOffsets);
            ctor: ResSynth.tuningType.BAROQUE,
            name: "Baroque (Poletti):  Meantone/Mollified (A4=414Hz)",
            tunings:
                [
                    {
                        name: 'Young (1800) 3/16 meantone base (Young\u{B4}s logic/ monchord lengths)',
                        offsets: [0.0, -6.1, -4.2, -2.2, -8.3, -0.1, -8.1, -2.1, -4.2, -6.2, -0.2, -8.2]
                    },
                    {
                        name: 'Mercadier (1776) Interp. Lindley (Stimmung und Temperatur p. 253)',
                        offsets: [0.0, -6.5, -3.5, -4.3, -7.0, -0.4, -6.6, -1.8, -6.3, -5.3, -2.3, -6.8]
                    },
                    {
                        name: 'Rosseau (1767) Mol. Meantone Interp. Poletti',
                        offsets: [0.0, -18.0, -6.8, -7.7, -13.7, -0.9, -18.5, -3.4, -16.3, -10.3, -1.2, -17.1]
                    },
                    {
                        name: 'D\u{B4}Alembert(1752) Mol.Meantone (1/5 E-G# - Interp.Poletti)',
                        offsets: [0.0, -20.7, -6.8, -17.3, -13.7, -5.8, -18.4, -3.4, -23.1, -10.3, -11.5, -16.0]
                    },
                    {
                        name: 'D\u{B4}Alembert(1752) Mol.Meantone (1/6 E-G# - Interp.Poletti)',
                        offsets: [0.0, -18.6, -6.8, -15.2, -13.7, -5.1, -16.9, -3.4, -20.2, -10.3, -10.1, -15.3]
                    },
                    {
                        name: 'Rameau (1726) Mol. Meantone Intrp. Lindley',
                        offsets: [0.0, -13.2, -6.8, -2.2, -13.7, 3.4, -15.2, -3.4, -11.2, -10.3, 6.8, -17.1]
                    },
                    {
                        name: 'Rameau (1726) Mol. Mean Interp. Poletti',
                        offsets: [0.0, -19.2, -6.8, -6.0, -13.7, 3.4, -18.8, -3.4, -18.9, -10.3, 6.8, -17.1]
                    },
                    {
                        name: 'Rameau/Gallimard (1754) (Lindley Stimmung und Temperatur p.253)',
                        offsets: [0.0, -16.1, -6.8, -3.4, -13.7, 3.4, -18.1, -3.4, -11.2, -10.3, 6.8, -17.1]
                    },
                    {
                        name: 'Werckmeister 1698 "Continuo" Mol. Meantone (1/8th P. - Interp. Poletti)',
                        offsets: [0.0, -6.8, -2.0, -3.9, -3.9, 1.0, -5.9, -1.0, -6.8, -2.9, -1.0, -4.9]
                    },
                    {
                        name: 'Werckmeister 1698 "Continuo" Mol. Meantone (1/7th S. - Interp. Poletti)',
                        offsets: [0.0, -7.8, -2.2, -3.9, -4.5, 1.0, -6.7, -1.1, -6.8, -3.3, -0.9, -5.6]
                    },
                    {
                        name: 'Werckmeister 1698 "Continuo" Mol. Meantone (1/6th S. - Interp. Poletti)',
                        offsets: [0.0, -11.4, -3.3, -5.9, -6.5, 1.6, -9.7, -1.6, -11.4, -4.9, -0.3, -8.1]
                    },
                    {
                        name: 'Werckmeister 1698 "Continuo" Mol. Meantone (8ve/55 - Interp. Poletti)',
                        offsets: [0.0, -12.7, -3.6, -6.0, -7.3, 1.8, -10.9, -1.8, -11.8, -5.5, -0.3, -9.1]
                    },
                    {
                        name: 'Werckmeister 1698 "Continuo" Mol. Meantone (1/5th S. - Interp. Poletti)',
                        offsets: [0.0, -16.4, -4.7, -9.2, -9.4, 2.3, -14.1, -2.3, -15.5, -7.0, -2.9, -11.7]
                    },
                    {
                        name: 'Padua Manuscript (18th c.? - Interp. Poletti)',
                        offsets: [0.0, -7.8, -6.8, 0.5, -13.7, 3.4, -9.8, -3.4, -5.9, -10.3, 6.8, -11.7]
                    },
                    {
                        name: 'Mersenne "Serendipity" Mol. Meantone (1636)',
                        offsets: [0.0, -24.0, -6.8, -11.2, -13.7, 3.4, -20.5, -3.4, -27.4, -10.3, -3.9, -17.1]
                    },
                    {
                        name: 'Schlick 1511 Spiegel der Orgelmacher (interp.Poletti v1)',
                        offsets: [0.0, -10.4, -3.3, 3.9, -6.5, 1.6, -9.3, -1.6, -1.7, -4.9, 2.7, -8.1]
                    },
                    {
                        name: 'Schlick 1511 Spiegel der Orgelmacher (interp.Poletti v2)',
                        offsets: [0.0, -10.3, -4.1, 2.1, -8.2, 2.0, -10.3, -2.0, -1.8, -6.1, 2.1, -10.2]
                    }
                ]
        },
        {
            // This tuning group uses the following constructor:
            //   tuning = getBaroqueTuning(tuningOffsets);
            ctor: ResSynth.tuningType.BAROQUE,
            name: "Baroque (Poletti):  Meantone/Regular (A4=414Hz)",
            tunings:
                [
                    {
                        name: '1/6 Meantone (Silbermann according to Sorge)',
                        offsets: [0.0, -11.4, -3.3, 4.9, -6.5, 1.6, -9.8, -1.6, -13.0, -4.9, 3.3, -8.1]
                    },
                    {
                        name: '8ve/55 comma Meantone (Telemann)',
                        offsets: [0.0, -12.7, -3.6, 5.5, -7.3, 1.8, -10.9, -1.8, -14.5, -5.5, 3.6, -9.1]
                    },
                    {
                        name: '1/5 Meantone',
                        offsets: [0.0, -16.4, -4.7, 7.0, -9.4, 2.3, -14.1, -2.3, -18.8, -7.0, 4.7, -11.7]
                    },
                    {
                        name: '2/9 Meantone',
                        offsets: [0.0, -19.8, -5.6, 8.5, -11.3, 2.8, -16.9, -2.8, -22.6, -8.5, 5.6, -14.1]
                    },
                    {
                        name: '1/4 Meantone',
                        offsets: [0.0, -24.0, -6.8, 10.3, -13.7, 3.4, -20.5, -3.4, -27.4, -10.3, 6.8, -17.1]
                    },
                    {
                        name: '2/7 Meantone',
                        offsets: [0.0, -29.3, -8.4, 12.6, -16.8, 4.2, -25.1, -4.2, -33.5, -12.6, 8.4, -20.9]
                    },
                    {
                        name: '1/3 Meantone',
                        offsets: [0.0, -36.5, -10.4, 15.6, -20.9, 5.2, -31.3, -5.2, -41.7, -15.6, 10.4, -26.1]
                    }
                ]
        }
    ];

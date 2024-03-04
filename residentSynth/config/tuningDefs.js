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
    WARPED_OCTAVES: 4,
    WARPED_GAMUT: 5,
    PARTCH: 6,
    BAROQUE: 7
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
                        name: "keys per octave: 19, factor=2^(1/19)",
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
        // Odd-Harmonic tunings
        {
            // Constructor:   tunings = getHarmonicTunings(tuningGroupDef);  /* also used by Prime-Harmonic tunings (see below).*/
            // The algorithm for both harmonic tuning types is identical, except for the harmonics used:
            // If tuningGroupDef.ctor is ResSynth.tuningType.ODD_HARMONICS, the constructor uses the
            // _odd-numbered_natural_harmonics_ to return 12 128 - note tunings, on 12 different root MidiKeys.
            //
            // The MidiPitches in the tuning at tuning index 0 begin with MidiPitch 0.00 at (root) MidiKey 0 (MIDI C).
            // Each further tuning is constructed by rotating tuning[0] (horizontally in the diagram below) so that its
            // root MidiPitch is at each MidiKey in turn, then transposing it bodily by a few cents so that its root
            // midiPitch is equal to the midiPitch of the root key in tuning[0]. For example, the root MidiPitch in
            // tuning[5] is at MidiKey 5, and has MidiPitch 4.71 (= MidiPitch of tuning[0][5])
            // Each tuning continues to have _perfect_ harmonic intervals with respect to its root.
            // ________________________________________________________________________________________________________
            //
            //                   --- midiPitches per key (x) per tuning (y) (diagonal tunings) ---
            // Note 1: In the lowest octave, all tunings are actually coerced to be greater than or equal to 0.
            //         In other octaves, _all_ tunings are such that tuning[midiKey][rootKey] equals tuning[0][rootKey].
            // Note 2: Internally, MidiPitches are simple floating point values: Here, for convenience, they are rounded
            //         to the nearest cent.
            // Note 3: Each root key is tuned to the pitch it has in the C tuning. For example: in the F# tuning, at y=6

            //
            //                                                   midiKey
            //                     C     C#    D     D#    E     F     F#    G     G#    A     A#     B
            //                     0     1     2     3     4     5     6     7     8     9     10    11
            //                 ---------------------------------------------------------------------------
            //            C   0|   0.00  1.05  2.04  2.98  3.86  4.71  5.51  7.02  7.73  8.41  9.69  10.88
            //            C#  1|  -0.07  1.05  2.10  3.09  4.02  4.91  5.76  6.56  8.07  8.78  9.45  10.74
            //            D   2|  -0.27  0.92  2.04  3.09  4.08  5.01  5.90  6.75  7.55  9.06  9.77  10.44
            //            D#  3|  -0.62  0.66  1.86  2.98  4.02  5.01  5.95  6.84  7.68  8.49  9.99  10.70
            //   tuning   E   4|  -0.41  0.27  1.55  2.75  3.86  4.91  5.90  6.84  7.73  8.57  9.38  10.88
            // (root key) F   5|  -0.27  0.43  1.11  2.40  3.59  4.71  5.76  6.75  7.68  8.57  9.42  10.22
            //            F#  6|  -0.97  0.53  1.24  1.92  3.20  4.40  5.51  6.56  7.55  8.49  9.38  10.22
            //            G   7|  -0.27  0.53  2.04  2.75  3.42  4.71  5.90  7.02  8.07  9.06  9.99  10.88
            //            G#  8|  -0.41  0.43  1.24  2.75  3.45  4.13  5.41  6.61  7.73  8.78  9.77  10.70
            //            A   9|  -0.62  0.27  1.11  1.92  3.42  4.13  4.81  6.09  7.29  8.41  9.45  10.44
            //            A# 10|  -0.27  0.66  1.55  2.40  3.20  4.71  5.41  6.09  7.38  8.57  9.69  10.74
            //            B  11|  -0.07  0.92  1.86  2.75  3.59  4.40  5.90  6.61  7.29  8.57  9.77  10.88
            // _____________________________________________________________________________________________________________________________________
            //
            //                                 --- pivot keys: keys whose tuning difference is <= 0.05 in tunings x and y. ---
            // Note 1: The key values are mirrored along the "ALL" diagonal. (Either the x or y tuning can be thought of as the target).
            // Note 2: The _key_ values in this table are also _absolute_, i.e.: 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B.
            //
            //                                                                   target tuning
            //                  C         C#        D         D#        E         F         F#        G         G#        A        A#        B
            //                  0         1         2         3         4         5         6         7         8         9        10        11
            //              ------------------------------------------------------------------------------------------------------------------------
            //         C   0|   ALL       1         2         3,8       4,8,11    5,8       6         2,5,7,11  8         9         5,10    11
            //         C#  1|   1         ALL       3         4,11      5         6,10      7         8         7,9,11   10        11        0,7
            //         D   2|   2         3         ALL       5,6       6         0,7       8         0,2,6,9  10        11         0        1,6,10
            //         D#  3|   3,8       4,11      5,6       ALL       6,7,8     8         9         6,10      8,11      0         1,11     2,6
            //         E   4|   4,8,11    5         6         6,7,8     ALL       8,9,10   10         3,6,11    0,3,8     1         2,9      3,6,9,11
            // initial F   5|   5,8       6,10      0,7       8         8,9,10    ALL      10,11      0,5       1,8       2,10      0,3,5,9  4,9
            //  tuning F#  6|   6         7         8         9        10        10,11      ALL       1         2,7       3         4        5,7
            //         G   7|   2,5,7,11  8         0,2,6,9   6,10      3,6,11    0,5       1         ALL       3,4       4         0,5      3,6,11
            //         G#  8|   8         7,9,11   10         8,11      0,3,8     1,8       2,7       3,4       ALL       4,5       6,11     3,7,10
            //         A   9|   9        10        11         0         1         2,10      3         4         4,5       ALL       7        8
            //         A# 10|   5,10     11         0         1,11      2,9       0,3,5,9   4         0,5       6,11      7         ALL      9
            //         B  11|   11        0,7       1,6,10    2,6       3,6,9,11  4,9       5,7       3,6,11    3,7,10    8         9        ALL
            //
            // =====================================================================================================================================
            ctor: ResSynth.tuningType.ODD_HARMONIC,
            name: "odd harmonic tunings",
            tunings:
                [
                    {
                        name: "C&emsp;|| Perfect Major Triads: C-E-G, G-B-D, E-G#-B. Perfect Fifth: Bb-F",
                        root: 48 // C key
                    },
                    {
                        name: "Db || Perfect Major Triads:  Db-F-Ab, Ab-C-Eb, F-A-C; Perfect Fifth: B-F#",
                        root: 49 // C# key
                    },
                    {
                        name: "D&emsp;|| Perfect Major Triads: D-F#-A, A-C#-E, F#-A#-C#; Perfect Fifth: C-G",
                        root: 50 // D key
                    },
                    {
                        name: "Eb || Perfect Major Triads: Eb-G-Bb, Bb-D-F, G-B-D; Perfect Fifth: Db-Ab",
                        root: 51 // D# key
                    },
                    {
                        name: "E&emsp;|| Perfect Major Triads: E-G#-B, B-D#-F#, Ab-C-Eb, ; Perfect Fifth: D-A",
                        root: 52 // E key
                    },
                    {
                        name: "F&emsp;|| Perfect Major Triads: F-A-C, C-E-G, A-C#-E; Perfect Fifth: Eb-Bb",
                        root: 53 // F key
                    },
                    {
                        name: "Gb || Perfect Major Triads: Gb-Bb-Db, Db-F-Ab, Bb-D-F; Perfect Fifth: E-B",
                        root: 54 // F# key
                    },
                    {
                        name: "G&emsp;|| Perfect Major Triads: G-B-D, D-F#-A, B-D#-F#; Perfect Fifth: F-C",
                        root: 55 // G key
                    },
                    {
                        name: "Ab || Perfect Major Triads: Ab-C-Eb, Eb-G-Bb, C-E-G; Perfect Fifth: F#-C#",
                        root: 56 // G# key
                    },
                    {
                        name: "A&emsp;|| Perfect Major Triads: A-C#-E, E-G#-B, Db-F-Ab; Perfect Fifth: G-D",
                        root: 57 // A key
                    },
                    {
                        name: "Bb || Perfect Major Triads: Bb-D-F, F-A-C, D-F#-A, ; Perfect Fifth: Ab-Eb",
                        root: 58 // A# key
                    },
                    {
                        name: "B&emsp;|| Perfect Major Triads: B-D#-F#, F#-A#-C#, Eb-G-Bb; Perfect Fifth: A-E",
                        root: 59 // B key
                    }
                ]
        },
        // Prime-Harmonic tunings
        {
            // Constructor:   tunings = getHarmonicTunings(tuningGroupDef); /* also used by Odd-Harmonic tunings (see above).*/
            // The algorithm for both harmonic tuning types is identical, except for the harmonics used:
            // If tuningGroupDef.ctor is ResSynth.tuningType.PRIME_HARMONICS, the constructor uses
            // the first 12 _odd_prime_numbered_natural_harmonics_ to return 12 128-note tunings,
            // on 12 different root MidiKeys. (The primes used are: 1,3,5,7,11,13,17,19,23,29,31,37.)
            //
            // The MidiPitches in the tuning at tuning index 0 begin with MidiPitch 0.00 at (root) MidiKey 0 (MIDI C).
            // Each further tuning is constructed by rotating tuning[0] (horizontally in the diagram below) so that its
            // root MidiPitch is at each MidiKey in turn, then transposing it bodily by a few cents so that its root
            // midiPitch is equal to the midiPitch of the root key in tuning[0]. For example, the root MidiPitch in
            // tuning[5] is at MidiKey 5, and has MidiPitch 4.71 (= MidiPitch of tuning[0][5])
            // Each tuning continues to have _perfect_ harmonic intervals with respect to its root.
            // ________________________________________________________________________________________________________
            //
            //                   --- midiPitches per key (x) per tuning (y) (diagonal tunings) ---
            // Note 1: In the lowest octave, all tunings are actually coerced to be greater than or equal to 0.
            //         In other octaves, _all_ tunings are such that tuning[midiKey][rootKey] equals tuning[0][rootKey].
            // Note 2: Internally, MidiPitches are simple floating point values: Here, for convenience, they are rounded
            //         to the nearest cent.
            // Note 3: Each root key is tuned to the pitch it has in the C tuning. For example: in the F# tuning, at y=6
            //
            //                                                   midiKey
            //                    C     C#    D     D#    E     F     F#    G     G#    A     A#      B
            //                    0     1     2     3     4     5     6     7     8     9     10     11
            //                 ---------------------------------------------------------------------------
            //            C   0|  0.00  1.05  2.51  2.98  3.86  5.51  6.28  7.02  8.41  9.69  10.30  11.45
            //            C#  1|  0.50  1.05  2.10  3.56  4.02  4.91  6.56  7.33  8.07  9.45  10.74  11.35
            //            D   2|  0.81  1.96  2.51  3.56  5.03  5.49  6.38  8.03  8.80  9.53  10.92  12.20
            //            D#  3|  0.66  1.27  2.43  2.98  4.02  5.49  5.95  6.84  8.49  9.26   9.99  11.38
            //   tuning   E   4|  0.27  1.55  2.16  3.31  3.86  4.91  6.38  6.84  7.73  9.38  10.15  10.88
            // (root key) F   5|  0.53  1.92  3.20  3.81  4.96  5.51  6.56  8.03  8.49  9.38  11.03  11.80
            //            F#  6|  0.57  1.30  2.69  3.97  4.58  5.73  6.28  7.33  8.80  9.26  10.15  11.80
            //            G   7|  0.53  1.30  2.04  3.42  4.71  5.32  6.47  7.02  8.07  9.53   9.99  10.88
            //            G#  8|  0.27  1.92  2.69  3.42  4.81  6.09  6.70  7.86  8.41  9.45  10.92  11.38
            //            A   9|  0.66  1.55  3.20  3.97  4.71  6.09  7.38  7.98  9.14  9.69  10.74  12.20
            //            A# 10|  0.81  1.27  2.16  3.81  4.58  5.32  6.70  7.98  8.59  9.75  10.30  11.35
            //            B  11|  0.50  1.96  2.43  3.31  4.96  5.73  6.47  7.86  9.14  9.75  10.90  11.45
            // _____________________________________________________________________________________________________________________________________
            //
            //                                 --- pivot keys: keys whose tuning difference is <= 0.05 in tunings x and y. ---
            // Note 1: The key values are mirrored along the "ALL" diagonal. (Either the x or y tuning can be thought of as the target).
            // Note 2: The _key_ values in this table are also _absolute_, i.e.: 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B.
            //
            //                                                                   target tuning
            //                  C         C#        D         D#        E         F         F#        G         G#        A        A#       B
            //                  0         1         2         3         4         5         6         7         8         9        10       11
            //              -----------------------------------------------------------------------------------------------------------------------
            //         C   0|   ALL       1         2,5       3,5       4         5         6         7         8         9        10       11
            //         C#  1|   1         ALL       3         4,11      5         0,6       7         0,8       9,11      10       11       0
            //         D   2|   2,5       3         ALL       5         6         1,5,7     8         9         1,10      7,11     0,7      1,10
            //         D#  3|   3,5       4,11      5         ALL       7         5,8       1,9       1,10      11        0        1,11     2
            //         E   4|   4         5         6         7         ALL       9         10        11        0         1        2        3
            // initial F   5|   5         0,6       1,5,7     5,8       9         ALL       0,11      0         1         2,7      3,7      0,1,4
            //  tuning F#  6|   6         7         8         1,9       10        0,11      ALL       0,1       2         3        1,4      5
            //         G   7|   7         0,8       9         1,10      11        0         0,1       ALL       3         4        1,5      0,6
            //         G#  8|   8         9,11      1,10      11        0         1         2         3         ALL       5        6,11     1,7,10
            //         A   9|   9         10        7,11      0         1         2,7       3         4         5         ALL      7        8
            //         A# 10|   10        11        0,7       1,11      2         3,7       1,4       1,5       6,11      7        ALL      9
            //         B  11|   11        0         1,10      2         3         0,1,4     5         0,6       1,7,10    8        9        ALL
            //
            // =====================================================================================================================================
            ctor: ResSynth.tuningType.PRIME_HARMONIC,
            name: "prime harmonic tunings",
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
                        name: "Gb || Perfect Major Triad Gb-Bb-Db",
                        root: 54 // F# key
                    },
                    {
                        name: "G&emsp;|| Perfect Major Triad G-B-D",
                        root: 55 // G key
                    },
                    {
                        name: "Ab || Perfect Major Triad Ab-C-Eb",
                        root: 56 // G# key
                    },
                    {
                        name: "A&emsp;|| Perfect Major Triad A-C#-E",
                        root: 57 // A key
                    },
                    {
                        name: "Bb || Perfect Major Triad Bb-D-F",
                        root: 58 // A# key
                    },
                    {
                        name: "B&emsp;|| Perfect Major Triad B-D#-F#",
                        root: 59 // B key
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
        // Partch
        {
            // This tuning group uses the following constructor:
            //   tuning = getPartchTuning(root);
            ctor: ResSynth.tuningType.PARTCH,
            name: "Partch tunings (all with A4=440Hz)",
            tunings:
                [
                    {
                        name: "Partch root C",
                        root: 0
                    },
                    {
                        name: "Partch root C#",
                        root: 1
                    },
                    {
                        name: "Partch root D",
                        root: 2
                    },
                    {
                        name: "Partch root D#",
                        root: 3
                    },
                    {
                        name: "Partch root E",
                        root: 4
                    },
                    {
                        name: "Partch root F",
                        root: 5
                    },
                    {
                        name: "Partch root F#",
                        root: 6
                    },
                    {
                        name: "Partch root G",
                        root: 7
                    },
                    {
                        name: "Partch root G#",
                        root: 8
                    },
                    {
                        name: "Partch root A",
                        root: 9
                    },
                    {
                        name: "Partch root A#",
                        root: 10
                    },
                    {
                        name: "Partch root B",
                        root: 11
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

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
// When the tuning is changed (even across tuning types), one or more midiKeys change pitch by less
// than 0.05 semitones. These midiKeys can be used as pivots in harmonic progressions.

ResSynth.tuningType =
{
	CONSTANT_FACTOR: 0,
	HARMONIC: 1,
	WARPED_OCTAVES: 2,
	WARPED_GAMUT: 3,
	PARTCH: 4,
	BAROQUE: 5
};

// All tunings are initially related to standard A4=440Hz.
ResSynth.tuningDefs =
	[
		// Constant factor tunings
		{
			// This tuning group uses the following constructor:
			//   tuning = getTuningFromConstantFactor(root, factor);
			//
			// The 'factor' argument is the ratio between the frequencies at the top and bottom of a sounding 'fifth'.
			// The algorithm is (approximately) as follows:
			//    1. The 'factor' is first applied recursively to define 11 chromatic intervals from the base 1.
			//    2. Each interval is then transposed into each available octave (128 MIDI pitches)
			//    3. The tuning is transposed so that the pitch at midiKey[root] is root.
			ctor: ResSynth.tuningType.CONSTANT_FACTOR,
			name: "constant factor tunings (A4=440Hz)",
			tunings:
				[
					{
						name: "Equal Temperament, root=0, factor=2^(1/12)",
						root: 0,
						factor: 1.498307 // Math.pow(Math.pow(2, (1.0 / 12)), 7) i.e. 7 equal temperament semitones
					},
					{
						// The 'wolf fifth' is at G#-Eb for root=0 (C).
						name: "Pythagorean, root=0 (C), factor=(3/2)",
						root: 0,
						factor: 1.5
					},
					{
						// According to https://en.xen.wiki/w/1/4_syntonic_comma_meantone
						// The 1/4 comma meantone fifth is 696.578 cents in size, which according to
						// http://www.sengpielaudio.com/calculator-centsratio.htm corresponds to a
						// frequency ratio (=factor) of 1.495348.
						//
						// The 'wolf fifth' is at G#-Eb for root=0.
						name: "1/4 comma meantone, root=0 (C), factor=1.495348",
						root: 0,
						factor: 1.495348 // Math.pow(5, (1.0 / 4))
					},
					{
						// According to https://en.xen.wiki/w/1/3_syntonic_comma_meantone
						// The 1/3 comma meantone fifth is 694.786 cents in size, which according to
						// http://www.sengpielaudio.com/calculator-centsratio.htm corresponds to a
						// frequency ratio (=factor) of 1.493801.
						// The 'wolf fifth' is at G#-Eb
						name: "1/3 comma meantone, root=0 (C), factor=1.493801",
						root: 0,
						factor: 1.493801
					},
					{
						// factor calculated as follows:
						// 10 fifths reach the 7th harmonic (Bb from C) 3 octaves above the base pitch,
						// so 'factor' is the 10th root of (7 * (2^3)).
						// This is very close to the factor for 1/4 comma meantone.
						// The 'wolf fifth' is at G#-Eb
						name: "Perfect 7th harmonic, root=0 (C), factor=1.495612",
						root: 0,
						factor: 1.495612 // Math.pow((7 * 8), 0.1)
					}
				]
		},
		// Harmonic tunings
		{		
		// Constructor:   tunings = getHarmonicTunings();
		// This constructor uses the _odd-numbered_natural_harmonics_ to return 12 128-note tunings,
		// on 12 different root MidiKeys.
		// Each tuning is constructed with its root midiPitch equal to its root key, so that the root key
		// midiPitches are always equal to their standard equal temperament frequencies.
		// (Nevertheless, each tuning contains _perfect_ intervals with respect to its root.)
		// The midiPitches per key(x) per harmonic tuning(y) are as follows:
 		// 		                                          key
		//              C      C#     D      D#     E      F      F#     G      G#     A      A#     B
		//          ---------------------------------------------------------------------------------------
		// 	      0 |  0      1.05   2.04   2.98   3.86   4.71   5.51   7.02   7.73   8.41    9.69  10.88
		//        1 | -0.12   1      2.05   3.04   3.98   4.86   5.71   6.51   8.02   8.73    9.41  10.69
		//        2 | -0.31   0.88   2      3.05   4.04   4.98   5.86   6.71   7.51   9.02    9.73  10.41
		//        3 | -0.59   0.69   1.88   3      4.05   5.04   5.98   6.86   7.71   8.51   10.02  10.73
		//        4 | -0.27   0.41   1.69   2.88   4      5.05   6.04   6.98   7.86   8.71    9.51  11.02
		// tuning 5 |  0.02   0.73   1.41   2.69   3.88   5      6.05   7.04   7.98   8.86    9.71  10.51
		//        6 | -0.49   1.02   1.73   2.41   3.69   4.88   6      7.05   8.04   8.98    9.86  10.71
		//        7 | -0.29   0.51   2.02   2.73   3.41   4.69   5.88   7      8.05   9.04    9.98  10.86
		//        8 | -0.14   0.71   1.51   3.02   3.73   4.41   5.69   6.88   8      9.05   10.04  10.98
		//        9 | -0.02   0.86   1.71   2.51   4.02   4.73   5.41   6.69   7.88   9      10.05  11.04
		//       10 |  0.04   0.98   1.86   2.71   3.51   5.02   5.73   6.41   7.69   8.88   10     11.05
		//       11 |  0.05   1.04   1.98   2.86   3.71   4.51   6.02   6.73   7.41   8.69    9.88  11
		//
		// N.B.In the lowest octave, all tunings are actually coerced to be greater than or equal to 0.
		// In other octaves, the midiPitches are _all_ equal to their midiKey + these decimal values.
		ctor: ResSynth.tuningType.HARMONIC,
		name: "harmonic tunings",
		tunings:
			[
				{
					name: "C&emsp;|| 5ths C-G, G-D, E-B, A#-F; 3rds C-E, G-B, E-G#",
					root: 48 // C key
				},
				{
					name: "C# || 5ths C#-G#, G#-D#, F-C, B-F#; 3rds C#-F, G#-C, F-A",
					root: 49 // C# key
				},
				{
					name: "D&emsp;|| 5ths D-A, A-E, F#-C#, C-G; 3rds D-F#, A-C#, F#-A#",
					root: 50 // D key
				},
				{
					name: "D# || 5ths D#-A#, A#-F, G-D, C#-G#; 3rds D#-G, A#-D, G-B",
					root: 51 // D# key
				},
				{
					name: "E&emsp;|| 5ths E-B, B-F#, G#-D#, D-A; 3rds E-G#, B-D#, G#-C",
					root: 52 // E key
				},
				{
					name: "F&emsp;|| 5ths F-C, C-G, A-E, D#-A#; 3rds F-A, C-E, A-C#",
					root: 53 // F key
				},
				{
					name: "F# || 5ths F#-C#, C#-G#, A#-F, E-B; 3rds F#-A#, C#-F, A#-D",
					root: 54 // F# key
				},
				{
					name: "G&emsp;|| 5ths G-D, D-A, B-F#, F-C; 3rds G-B, D-F#, B-D#",
					root: 55 // G key
				},
				{
					name: "G# || 5ths G#-D#, D#-A#, C-G, F#-C#; 3rds G#-C, D#-G, C-E",
					root: 56 // G# key
				},
				{
					name: "A&emsp;|| 5ths A-E, E-B, C#-G#, G-D; 3rds A-C#, E-G#, C#-F",
					root: 57 // A key
				},
				{
					name: "A# || 5ths A#-F, F-C, D-A, G#-D#; 3rds A#-D, F-A, D-F#",
					root: 58 // A# key
				},
				{
					name: "B&emsp;|| 5ths B-F#, F#-C#, D#-A#, A-E; 3rds B-D#, F#-A#, D#-G",
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
			name: "Partch tunings  (A4=440Hz)",
			tunings:
				[
					{
						name: "Partch C, root=0",
						root: 0
					},
					{
						name: "Partch C#, root=1",
						root: 1
					},
					{
						name: "Partch D, root=2",
						root: 2
					},
					{
						name: "Partch D#, root=3",
						root: 3
					},
					{
						name: "Partch E, root=4",
						root: 4
					},
					{
						name: "Partch F, root=5",
						root: 5
					},
					{
						name: "Partch F#, root=6",
						root: 6
					},
					{
						name: "Partch G, root=7",
						root: 7
					},
					{
						name: "Partch G#, root=8",
						root: 8
					},
					{
						name: "Partch A, root=9",
						root: 9
					},
					{
						name: "Partch A#, root=10",
						root: 10
					},
					{
						name: "Partch B, root=11",
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

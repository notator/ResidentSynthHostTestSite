console.log('load tuningDefs.js');

// This file can be omitted by applications that do not define special tunings.
// (12-tone Equal Temperament tuning is always defined by default.)

// ResSynth.namespace('tuningDefs');

ResSynth.tuningConstructors =
{
	FUNCTION_GET_TUNING_FROM_CONSTANT_FACTOR: 0,
	FUNCTION_GET_PARTCH_TUNING: 1,
	FUNCTION_GET_WARPED_OCTAVES_TUNING: 2,
	FUNCTION_GET_WARPED_GAMUT_TUNING: 3,
	FUNCTION_GET_BAROQUE_TUNING: 4
};

// All tunings are initially related to standard equal temperament A4=440Hz.
// They can be transposed later using the function:
//    transposeTuningToA4Frequency(tuning, A4Frequency).
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
			ctor: ResSynth.tuningConstructors.FUNCTION_GET_TUNING_FROM_CONSTANT_FACTOR,
			name: "constant factor tunings",
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
		// Partch
		{
			// This tuning group uses the following constructor:
			//   tuning = getPartchTuning(root);
			ctor: ResSynth.tuningConstructors.FUNCTION_GET_PARTCH_TUNING,
			name: "Partch tunings",
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
		// Warped octave tunings
		{
			// This tuning group uses the following constructor:
			//   tuning = tuningsFactory.getWarpedTuning(keyValuesArray, "octaves");
			ctor: ResSynth.tuningConstructors.FUNCTION_GET_WARPED_OCTAVES_TUNING,
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
			ctor: ResSynth.tuningConstructors.FUNCTION_GET_WARPED_GAMUT_TUNING,
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
		// Baroque collection (Poletti)
		{
			// This tuning group uses the following constructor:
			//   tuning = getBaroqueTuning(tuningOffsets);
			ctor: ResSynth.tuningConstructors.FUNCTION_GET_BAROQUE_TUNING,
			name: "Baroque (Poletti):  Circulating/Rational",
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
			ctor: ResSynth.tuningConstructors.FUNCTION_GET_BAROQUE_TUNING,
			name: "Baroque (Poletti):  Circulating/Pragmatic",
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
			ctor: ResSynth.tuningConstructors.FUNCTION_GET_BAROQUE_TUNING,
			name: "Baroque (Poletti):  Meantone/Mollified",
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
			ctor: ResSynth.tuningConstructors.FUNCTION_GET_BAROQUE_TUNING,
			name: "Baroque (Poletti):  Meantone/Regular",
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

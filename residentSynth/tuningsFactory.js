/* Copyright 2020 James Ingram
 * https://james-ingram-act-two.de
 * 
 * All the code in this project is covered by an MIT license.
 * https://github.com/surikov/webaudiofont/blob/master/LICENSE.md
 * https://github.com/notator/WebMIDISynthHost/blob/master/License.md
 */

var ResSynth = ResSynth || {};

ResSynth.tuningsFactory = (function()
{
    "use strict";
    let
        // All (public) constructors should call this function before returning.
        // The argument is an array of 128 floating point numbers representing the number of
        // (floating point) semitones above MIDI C0 for each MIDI key (=index).
        // An exception is thrown if the argument's length is not 128, or it contains anything other than numbers.
        // This function coerces the values in the array to 0.0 <= value < 128.0.
        // Note that the values in the tuning will usually be in ascending order, but that this is not absolutely necessary.
        finalizeTuning = function(tuning)
        {
            function check(tuning)
            {
                console.assert(tuning.length === 128);
                for(let i = 0; i < 128; i++)
                {
                    let value = tuning[i];
                    console.assert(!Number.isNaN(value));
                }
            }

            function coerce(tuning)
            {
                for(let i = 0; i < 128; i++)
                {
                    let value = tuning[i];

                    value = Math.round(value * 10000) / 10000; // round to 4 decimal places (for the cents) -- i.e. to 1/100 cent
                    value = (value < 0) ? 0 : value;
                    value = (value >= 128) ? 127.9999 : value;

                    tuning[i] = value;
                }
            }

            check(tuning);
            coerce(tuning);
        },

        // Transpose the tuning so that the 'anchor' key has the same pitch as in 12-tone equal temperament.
        transposeTuningForAnchor = function(tuning, anchor)
        {
            console.assert(Number.isInteger(anchor) && 0 <= anchor && anchor < 128);

            let diff = anchor - tuning[anchor]; // tuning[69] is A4
            for(let i = 0; i < 128; i++)
            {
                tuning[i] += diff; // will be coerced to 0..<128 in finalizeTuning() later
            }
        },

        // Sets the pitches in the tuning so that the keys at scaleIndex, scaleIndex + scaleInterval,
        // scaleIndex + (2 * scaleInterval), etc. are a perfect fifth above the key 7 keys below.
        setSubScaleToPerfectFifthTransposition = function (tuning, scaleOriginKey, scaleInterval)
        {
            for(let i = scaleOriginKey; i < 128; i += scaleInterval) 
            {
                if(i > 6)
                {
                    let frequency = getFrequency(tuning[i - 7]),
                        quint = frequency * (3 / 2), // the perfect fifth above the current key
                        semitoneSize = sizeIn12TETSemitones(quint, frequency); // the number of 12TET semitones between the two frequencies

                    tuning[i] = tuning[i - 7] + semitoneSize;
                }
            }
        },

        // Returns the (floating point) number of Equal Temperament semitones
        // between the two frequencies.
        // The result will be positive if frequency1 >= frequency2,
        // and negative if frequency1 < frequency2.
        sizeIn12TETSemitones = function(frequency1, frequency2)
        {
            let frequencyRatio = frequency1 / frequency2,
                equalTemperamentSemitones = Math.round(120000000 * Math.log2(frequencyRatio)) / 10000000; // log base 2, rounded to 7 decimal places

            return equalTemperamentSemitones;
        },

        getFrequency = function(midiPitch)
        {
            let pow = (midiPitch - 69) / 12,
                frequency = Math.pow(2, pow) * 440;

            return frequency;
        },

        // Transpose the tuning so that A4 (midi key 69) has midiPitch 69.0.
        transposeTuningForA4Frequency = function(tuning, a4Frequency)
        {
            let currentA4Frequency = getFrequency(tuning[69]),
                semitonesDiff = sizeIn12TETSemitones(currentA4Frequency, a4Frequency);

            for(let i = 0; i < 128; i++)
            {
                tuning[i] = tuning[i] - semitonesDiff; // will be coerced to 0..<128 later
            }
        },

        // Returns a 128-note tuning (containing octave tunings) defined by cent offsets from equal temperament.
        // (For example, the tunings defined on the Quick Reference sheet at https://polettipiano.com/wordpress/?page_id=706)
        // The 'tuningOffsets' argument contains an array of 12 cent offsets from equal temperament, in order of pitch C to B.
        // The offset for the tuning's rootKey should be 0 here. Any other offset values may be 0, positive or negative.
        getTuningFromETOffsets = function(tuningOffsets)
        {
            let tuning = [],
                offsetIndex = 0;

            console.assert(tuningOffsets.length === 12);

            for(let i = 0; i < 128; i++)
            {
                // Any out-of-range values will be silently corrected by finalizeTuning(tuning) below.
                tuning.push(i + (tuningOffsets[offsetIndex++] / 100.0));
                offsetIndex = (offsetIndex === 12) ? 0 : offsetIndex;
            }

            return tuning;
        },

        TuningsFactory = function()
        {
            if(!(this instanceof TuningsFactory))
            {
                return new TuningsFactory();
            }
        },

        API =
        {
            TuningsFactory: TuningsFactory // constructor
        };

    // end let

    // Returns a 128-note tuning containing values equal to the index.
    TuningsFactory.prototype.getEqualTemperamentTuning = function()
    {
        let tuning = [];

        for(let i = 0; i < 128; i++)
        {
            tuning.push(i);
        }

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns a 128-note tuning containing octave tunings with A4 tuned to 440Hz.
    // Argument restrictions:
    //     rootKey must be an integer >= 0 and < 12.
    //     factorBase is a floating point number > 1 and !== a power of 2.
    //     wideOctaves is a boolean that determines whether the tuning will have wide octaves.
    // The rootKey frequency is allocated to the rootKey.
    // Keys are numbered, according to the MIDI convention:
    //     C = 0, C# = 1, D = 2, D# = 3, E = 4, F = 5, F# = 6, G = 7, G# = 8, A = 9, A# = 10, B = 11.
    // with their respective octave transpositions:
    //     C0 = 12, C1 = 24, C2 = 36, C3 = 48, C4 = 60, C5 = 72, C6 = 84, C7 = 96, C8 = 108, C9 = 120
    //
    // This function is used for Pythagorean and other mean-tone tunings.
    // The "wolf fifth", if it exists, is placed in the interval G#-Eb when the root is C.
    TuningsFactory.prototype.getTuningFromConstantFifthFactor = function(rootKey, factorBase)
    {
        function getTuningOffsets(rootKey, factorBase)
        {
            let factors = [];

            for(let i = 0; i < 9; i++)
            {
                let factor = Math.pow(factorBase, i);
                while(!(factor < 2))
                {
                    factor /= 2;
                }
                factors.push(factor);
            }

            for(let i = 1; i < 4; i++)
            {
                let factor = 1 / factors[i];
                factors.push(factor);
            }

            factors.sort();

            // rotate the factors until factor[0] is 1
            while(factors[0] < 1)
            {
                let fac = factors[0] * 2;
                factors.splice(0, 1);
                factors.push(fac);
            }

            factors.sort(); // factors[0] is the factor (=1.0) for C0

            let tuningOffsets = [];
            for(let i = 0; i < factors.length; i++)
            {
                let centsOffset = (sizeIn12TETSemitones(factors[i], 1) - i) * 100;
                tuningOffsets.push(centsOffset);
            }

            // rotate the tuningOffsets until tuningOffsets[0] (=0) is at newTuningOffsets[rootKey].
            let rotatedTuningOffsets = [];
            for(let i = 0; i < 12; i++)
            {
                let newIndex = (i + rootKey) % 12;
                rotatedTuningOffsets[newIndex] = tuningOffsets[i];
            }

            return rotatedTuningOffsets;
        }

        let tuning = [],
            c0tuningOffsets;

        while(!(factorBase < 2))
        {
            factorBase /= 2;
        }
        console.assert(factorBase > 1);
        console.assert(Number.isInteger(rootKey) && 0 <= rootKey && rootKey < 12);

        c0tuningOffsets = getTuningOffsets(rootKey, factorBase);

        tuning = getTuningFromETOffsets(c0tuningOffsets);

        transposeTuningForA4Frequency(tuning, 440);

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns a 128-note tuning having equidistant intervals between neighbouring keys,
    // and in which the 'anchor' key has the same pitch as in 12-tone equal temperament.
    TuningsFactory.prototype.getTuningFromSemitoneFactor = function(anchor, semitoneFactor)
    {
        function getGamutETTuningIgnoringOctaves(semitoneFactor)
        {
            let tuning = [],
                semitoneSize = sizeIn12TETSemitones(semitoneFactor, 1), // number of 12TET semitones between neighbouring keys
                pitch = 0;

            for(let i = 0; i < 128; i++)
            {
                tuning.push(pitch);
                pitch += semitoneSize;
            }

            return tuning;
        }

        function transposeTuningForAnchor(tuning, anchor)
        {
            console.assert(Number.isInteger(anchor) && 0 <= anchor && anchor < 128);

            let diff = anchor - tuning[anchor]; // tuning[69] is A4
            for(let i = 0; i < 128; i++)
            {
                tuning[i] += diff; // will be coerced to 0..<128 later
            }
        }

        let tuning = getGamutETTuningIgnoringOctaves(semitoneFactor);

        transposeTuningForAnchor(tuning, anchor);

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns an array ordered according to the size of the absolute difference between standard 12-tone equal temperament and
    // the AdjacentKeyFrequencyRatios defined for the CONSTANT_SEMITONE_FACTOR tunings.
    // This function was used while ordering the tunings in the tuningDefs.js file. Its return value is ignored at runtime.
    TuningsFactory.prototype.orderOfConsonanceForPerfectKeyIntervals = function()
    {
        function getAllIndices(arr, val)
        {
            var indexes = [], i;
            for(i = 0; i < arr.length; i++)
                if(arr[i] === val)
                    indexes.push(i);
            return indexes;
        }

        const octaveSemitone = Math.pow(2, (1.0 / 12)),
            adjacentKeyRatios = [
                [Math.pow(17 / 16, 1), "1", "17/16", "(17/16)^1"], 
                [Math.pow(9 / 8, (1.0 / 2)), "2", "9/8", "(9/8)^(1/2)"],
                [Math.pow(19 / 16, (1.0 / 3)), "3", "19/16", "(19/16)^(1/3)"],
                [Math.pow(5 / 4, (1.0 / 4)), "4", "5/4", "(5/4)^(1/4)"],
                [Math.pow(21 / 16, (1.0 / 5)), "5", "21/16", "(21/16)^(1/5)"],
                [Math.pow(11 / 8, (1.0 / 6)), "6", "11/8", "(11/8)^(1/6)"],
                [Math.pow(3 / 2, (1.0 / 7)), "7", "3/2", "(3/2)^(1/7)"],
                [Math.pow(25 / 16, (1.0 / 8)), "8", "25/16", "(25/16)^(1/8)"],
                [Math.pow(13 / 8, (1.0 / 9)), "9", "13/8", "(13/8)^(1/9)"],    
                [Math.pow(7 / 4, (1.0 / 10)), "10", "7/4", "(7/4)^(1/10)"],
                [Math.pow(15 / 8, (1.0 / 11)), "11", "15/8", "(15/8)^(1/11)"],
                [octaveSemitone, "12", "2", "(2)^(1/12)"],
                [Math.pow(17 / 8, (1.0 / 13)), "13", "17/8", "(17/8)^(1/13)"],
                [Math.pow(9 / 4, (1.0 / 14)), "14", "9/4", "(9/4)^(1/14)"],
                [Math.pow(19 / 8, (1.0 / 15)), "15", "19/8", "(19/8)^(1/15)"],
                [Math.pow(5 / 2, (1.0 / 16)), "16", "5/2", "(5/2)^(1/16)"],
                [Math.pow(21 / 8, (1.0 / 17)), "17", "21/8", "(21/8)^(1/17)"],
                [Math.pow(11 / 4, (1.0 / 18)), "18", "11/4", "(11/4)^(1/18)"],
                [Math.pow(3, (1.0 / 19)), "19", "3", "(3)^(1/19)"],
                [Math.pow(25 / 8, (1.0 / 20)), "20", "25/8", "(25/8)^(1/20)"],
                [Math.pow(13 / 4, (1.0 / 21)), "21", "13/4", "(13/4)^(1/21)"],
                [Math.pow(7 / 2, (1.0 / 22)), "22", "7/2", "(7/2)^(1/22)"],
                [Math.pow(15 / 4, (1.0 / 23)), "23", "15/4", "(15/4)^(1/23)"]
            ],
            localSemitones = [
                Math.pow(17 / 16, 1),
                Math.pow(9 / 8, (1.0 / 2)),
                Math.pow(19 / 16, (1.0 / 3)),
                Math.pow(5 / 4, (1.0 / 4)),
                Math.pow(21 / 16, (1.0 / 5)),
                Math.pow(11 / 8, (1.0 / 6)),
                Math.pow(3 / 2, (1.0 / 7)),
                Math.pow(25 / 16, (1.0 / 8)),
                Math.pow(13 / 8, (1.0 / 9)),
                Math.pow(7 / 4, (1.0 / 10)),
                Math.pow(15 / 8, (1.0 / 11)),
                octaveSemitone,
                Math.pow(17 / 8, (1.0 / 13)),
                Math.pow(9 / 4, (1.0 / 14)),
                Math.pow(19 / 8, (1.0 / 15)),
                Math.pow(5 / 2, (1.0 / 16)),
                Math.pow(21 / 8, (1.0 / 17)),
                Math.pow(11 / 4, (1.0 / 18)),
                Math.pow(3, (1.0 / 19)),
                Math.pow(25 / 8, (1.0 / 20)),
                Math.pow(13 / 4, (1.0 / 21)),
                Math.pow(7 / 2, (1.0 / 22)),
                Math.pow(15 / 4, (1.0 / 23))
            ];

        let diffs = [];
        for(let i = 0; i < localSemitones.length; i++)
        {
            const localSemitone = localSemitones[i],
                diff = Math.abs(octaveSemitone - localSemitone);

            diffs.push(diff);
        }
        let orderedDiffs = [...diffs];
        orderedDiffs.sort((a, b) => a - b);
        let oldIndices = [];
        for(let i = 0; i < orderedDiffs.length; i++)
        {
            const diff = orderedDiffs[i],
                indices = getAllIndices(diffs, diff);

            if(oldIndices.indexOf(indices[0]) === -1)
            {
                for(let i = 0; i < indices.length; ++i)
                {
                    oldIndices.push(indices[i]);
                }
            }
        }

        let orderedTunings = [],
            prevAdjacentKeyRatio0 = 0;
        for(let i = 0; i < diffs.length; i++)
        {
            let adjacentKeyRatio = adjacentKeyRatios[oldIndices[i]],
                qOctave = Math.pow(adjacentKeyRatio[0], 12), // the effective octave ratio
                centsDiff = sizeIn12TETSemitones(qOctave, 2) * 100, // the cents difference from the pure octave
                msg = "";

            centsDiff = Math.round(centsDiff * 100) / 100; // round to 2 decimal places

            msg = msg + `consonance: ${adjacentKeyRatio[2]}`;
            msg = msg.padEnd(20, " ");
            msg = msg + `keyDiff=${adjacentKeyRatio[1]}, `;
            msg = msg + `semitoneFactor=${adjacentKeyRatio[3]}`;
            msg = msg.padEnd(65, " ");
            msg = msg + `octaveDiff: ${centsDiff} cents`;
            if(i > 0 && adjacentKeyRatio[0] === prevAdjacentKeyRatio0)
                msg = msg + " -- same";

            prevAdjacentKeyRatio0 = adjacentKeyRatio[0];        

            console.log(msg);

            orderedTunings.push(adjacentKeyRatio);
        }

        return orderedTunings;
    };

    // Returns a 128-note tuning in which the 'anchor' key has the same pitch as in 12-tone equal temperament
    // and the pitch interval between adjacent keys is constant.
    TuningsFactory.prototype.getTuningFromSemitoneSize = function(anchor, semitoneSizeInCents)
    {
        function getGamutETTuningIgnoringOctaves(semitoneSizeInCents)
        {
            let tuning = [],
                midiCentSize = semitoneSizeInCents / 100, // number of 12TET semitones between neighbouring keys
                pitch = 0;

            for(let i = 0; i < 128; i++)
            {
                tuning.push(pitch);
                pitch += midiCentSize;
            }

            return tuning;
        }

        let tuning = getGamutETTuningIgnoringOctaves(semitoneSizeInCents);

        transposeTuningForAnchor(tuning, anchor);

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns a 128-note tuning in which
    // 1. The 'anchor' key has the same pitch as in 12-tone equal temperament
    // 2. There are two interlocking wholetone scales separated by a perfect fifth.
    // 3. The wholetone size is set by the wholetoneSizeInCents argument.
    TuningsFactory.prototype.getInterlockingWholetoneScalesTuning = function(anchor, wholetoneSizeInCents)
    {
        function getIinterockingWTTuning(wholetoneSizeInCents)
        {
            let tuning = [],
                midiCentSize = (wholetoneSizeInCents / 2) / 100, // number of 12TET semitones between neighbouring keys
                pitch = 0;

            for(let i = 0; i < 128; i++)
            {
                tuning.push(pitch);
                pitch += midiCentSize;
            }

            setSubScaleToPerfectFifthTransposition(tuning, 1, 2); // the wholetone scale on C#

            return tuning;
        }

        let tuning = getIinterockingWTTuning(wholetoneSizeInCents);

        transposeTuningForAnchor(tuning, anchor);

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns a 128-note tuning in which
    // 1. The 'anchor' key has the same pitch as in 12-tone equal temperament
    // 2. There will be three interlocking minor thirds "scales", starting on C, C# and D respectively.
    //    The C# scale will be transposed so that its G is tuned a perfect fifth above C,
    //    The D scale will be transposed so that its D is a perfect fifth above G.
    //    This leads to there being 8 perfect fifths in the tuning.
    // 3. The size of a "minor third"" is set by the minorThirdsSizeInCents argument.
    TuningsFactory.prototype.getInterlockingMinorThirdsTuning = function(anchor, minorThirdsSizeInCents)
    {
        function getMinorThirdsTuning(minorThirdsSizeInCents)
        {
            let tuning = [],
                midiCentSize = (minorThirdsSizeInCents / 3) / 100, // number of 12TET semitones between neighbouring keys
                pitch = 0;

            for(let i = 0; i < 128; i++)
            {
                tuning.push(pitch);
                pitch += midiCentSize;
            }

            setSubScaleToPerfectFifthTransposition(tuning, 1, 3); // the minor thirds scale on C#
            setSubScaleToPerfectFifthTransposition(tuning, 2, 3); // the minor thirds scale on D

            return tuning;
        }

        let tuning = getMinorThirdsTuning(minorThirdsSizeInCents);

        transposeTuningForAnchor(tuning, anchor);

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns a 128-note tuning in which
    // The 'anchor' argument is the key whose frequency is the same as in standard 12-tone equal temperament (which has A4=440Hz).
    // The 'majorThirdSize' argument is the size of the interval between keys separated by 4 places on the keyboard.
    //
    // These tunings consist of four interlocked "major third scales": C-E-G#, D#-G-B, D-F#-A#, C#-F-A.
    // The 'anchor' key defines the pitch level of the first scale.
    // The second scale is transposed so that it always contains the pitch exactly a perfect fifth above the anchor
    // (i.e. if the anchor is C, then C-G and E-B are perfect fifths).
    // The third scale is transposed so that it always contains the pitch exactly a perfect fifth above the second scale.
    // (i.e. if the anchor is C, then G-D and B-F# are perfect fifths).
    // The fourth scale is transposed so that it always contains the pitch exactly a perfect fifth above the third scale.
    // (i.e. if the anchor is C, then F#-C# and A#-F are perfect fifths).
    // So tunings in this tuning group always contain 6 perfect fifths per octave.
    // The "wolf fifths" are C#-G#, D-A, D#-A#, F-C, G#-C# and A-E.
    // 3. The size of a "minor third"" is set by the minorThirdsSizeInCents argument.
    TuningsFactory.prototype.getInterlockingMajorThirdsTuning = function(anchor, majorThirdsSizeInCents)
    {
        function getMajorThirdsTuning(majorThirdsSizeInCents)
        {
            let tuning = [],
                midiCentSize = (majorThirdsSizeInCents / 4) / 100, // number of 12TET semitones between neighbouring keys
                pitch = 0;

            for(let i = 0; i < 128; i++)
            {
                tuning.push(pitch);
                pitch += midiCentSize;
            }

            setSubScaleToPerfectFifthTransposition(tuning, 3, 4); // the majorThirds scale on D#
            setSubScaleToPerfectFifthTransposition(tuning, 2, 4); // the majorThirds scale on D
            setSubScaleToPerfectFifthTransposition(tuning, 1, 4); // the majorThirds scale on C#

            return tuning;
        }

        let tuning = getMajorThirdsTuning(majorThirdsSizeInCents);

        transposeTuningForAnchor(tuning, anchor);

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns a 128-note tuning in which the size of the interval between adjacent keys varies linearly across the keyboard
    // and the size of the interval between adjacent keys is closest to 100cents near the 'origin' key.
    TuningsFactory.prototype.getSlidingSemitoneSizeTuning = function(anchor, origin, pureRatio, pureKey)
    {
        function getSlidingTuning(origin, pureRatio, pureKey)
        {
            function getNDeltas(pureKey)
            {
                let nDeltas = 0;
                for(let i = 1; i <= pureKey; i++)
                {
                    nDeltas += i;
                }
                return nDeltas;
            }

            console.assert(Number.isInteger(origin) && 0 <= origin && origin < 128);

            let tuning = [],
                ratioSemitones = sizeIn12TETSemitones(pureRatio, 1),
                nDeltas = getNDeltas(pureKey),
                semitonesDeltaConst = (ratioSemitones - pureKey) / nDeltas,
                runningSemitonesDelta = semitonesDeltaConst;

            for(let i = 0; i < 128; i++)
            {
                tuning[i] = i;
            }

            for(let i = origin + 1; i < 128; i++)
            {
                tuning[i] = tuning[i-1] + 1 + runningSemitonesDelta;
                runningSemitonesDelta += semitonesDeltaConst;
            }
            runningSemitonesDelta = semitonesDeltaConst;
            for(let i = origin - 1; i >= 0; i--)
            {
                tuning[i] = tuning[i+1] - 1 - runningSemitonesDelta;
                runningSemitonesDelta += semitonesDeltaConst;
            }
            return tuning;
        }

        let tuning = getSlidingTuning(origin, pureRatio, pureKey);

        transposeTuningForAnchor(tuning, anchor);

        finalizeTuning(tuning);

        return tuning;

    };

    // Returns a 128-note tuning having A4 (key 69) tuned to 440Hz, and equidistant intervals between neighboring keys.
    // Keys that are keysPerOctave apart, sound an octave apart. 
    // Argument restrictions:
    //     keysPerOctave is an integer that determines the number of keyboard keys in a sounding octave.
    TuningsFactory.prototype.getTuningFromKeysPerOctave = function(keysPerOctave)
    {
        function getTuningForA4(keysPerOctave)
        {
            let factor = Math.pow(2, (1.0 / keysPerOctave)),
                midiA4 = 69,
                frequencies = [];

            frequencies[midiA4] = 440; // A4 = 440Hz

            for(let i = 1; i < keysPerOctave; i++)
            {
                let midiKey = midiA4 + i;
                frequencies[midiKey] = frequencies[midiKey - 1] * factor;
            }

            let upper = midiA4 + keysPerOctave;
            while(upper < 128)
            {
                frequencies[upper] = frequencies[upper - keysPerOctave] * 2;
                upper++;
            }
            let lower = midiA4 - 1;
            while(lower >= 0)
            {
                frequencies[lower] = frequencies[lower + keysPerOctave] / 2;
                lower--;
            }

            let tuning = [];
            for(let i = 0; i < frequencies.length; i++)
            {
                tuning.push(midiA4 + sizeIn12TETSemitones(frequencies[i], 440));
            }

            return tuning;
        }

        console.assert(keysPerOctave > 1);

        let tuning = getTuningForA4(keysPerOctave);

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns a new 128-note tuning containing octave tunings. (A4 can be tuned to any value.)
    // The keyValuesArray is an array of arrays, each of which contains a [key, value] pair.
    // There must be more than 1 [key, value] array in the keyValuesArray.
    // Both the keys and the values must be strictly in ascending order in the keyValuesArray.
    // The keys must be integers.
    // The values are floating point (Midi.Cent above C0).
    // Both key and value values must:
    //     1. have a span that is less than an octave
    //     2. be unique
    //     3. be in ascending order.
    // Key-values below the lowest defined key (=keyValuesArray[0][0]) are set to keyValuesArray[0][1].
    // Key-value pairs for the lowest octave of the tuning are created by interpolation.
    // Higher octaves are created by adding octave transpositions.
    TuningsFactory.prototype.getWarpedTuning = function(keyValuesArray, octavesOrGamutStr)
    {
        function checkArrayParameters(keyValuesArray)
        {
            console.assert(Array.isArray(keyValuesArray) && keyValuesArray.length > 1);
            for(let i = 0; i < keyValuesArray.length; i++)
            {
                let keyValuePair = keyValuesArray[i];
                console.assert(Array.isArray(keyValuePair));
                console.assert(keyValuePair.length === 2);
                console.assert(Number.isInteger(keyValuePair[0]) && (!Number.isNaN(keyValuePair[1])));
            }
        }

        function checkRepeatingOctavesKeyValueArray(keyValuesArray)
        {
            checkArrayParameters(keyValuesArray); // keyValuesArray.length > 1

            let lowKey = keyValuesArray[0][0],
                highKeyLimit = lowKey + 12,
                lowValue = keyValuesArray[0][1],
                highValueLimit = lowValue + 12;

            console.assert((0 <= lowKey && lowKey < 12) && (0.0 <= lowValue && lowValue < 12.0));

            let previousKey = keyValuesArray[0][0],
                previousValue = keyValuesArray[0][1];
            for(let i = 1; i < keyValuesArray.length; i++)
            {
                let key = keyValuesArray[i][0],
                    value = keyValuesArray[i][1];

                console.assert(Number.isInteger(key) && (!(Number.isNaN(value))));
                console.assert((previousKey < key && key < highKeyLimit) && (previousValue < value && value < highValueLimit));
                previousKey = key;
                previousValue = value;
            }
        }

        // The argument array contains only the significant key-value pairs for the returned tuning. 
        function getTuningFromGamutKeyValuesArray(gamutKeyValuesArray)
        {
            function checkGamutKeyValuesArray(gamutKeyValuesArray)
            {
                checkArrayParameters(gamutKeyValuesArray); // keyValuesArray.length > 1

                console.assert((0 <= gamutKeyValuesArray[0][0] && gamutKeyValuesArray[0][0] < 128) && (0.0 <= gamutKeyValuesArray[0][1] && gamutKeyValuesArray[0][1] < 128.0));

                let previousKey = gamutKeyValuesArray[0][0],
                    previousValue = gamutKeyValuesArray[0][1];
                for(let i = 1; i < gamutKeyValuesArray.length; i++)
                {
                    let key = gamutKeyValuesArray[i][0],
                        value = gamutKeyValuesArray[i][1];

                    console.assert(Number.isInteger(key) && (!(Number.isNaN(value))));
                    console.assert((0 <= key && key < 128) && (0.0 <= value && value < 128.0));
                    console.assert(previousKey >= 0 && key > previousKey);
                    console.assert(previousValue >= 0.0 && value > previousValue);
                    previousKey = key;
                    previousValue = value;
                }
            }

            // Returns a tuningSegment, calculated from the keyValuesArray, having a .rootKey attribute that determines the key for the first value.
            // A tuningSegment is a contiguous array of increasing MidiPitch values, one per key in range.
            // The keyValuesArray is an array containing only the [key,pitch] arrays that define fixed points in the (warped) tuningSegment.
            // The returned values do not exceed the range of the values in the keyValuesArray argument.
            // The returned values have been interpolated (per key) between those in the keyValuesArray argument.
            function getTuningSegment(keyValuesArray)
            {
                checkGamutKeyValuesArray(keyValuesArray);

                let tuningSegment = [];

                tuningSegment.rootKey = keyValuesArray[0][0];

                tuningSegment.push(keyValuesArray[0][1]);
                for(let j = 1; j < keyValuesArray.length; j++)
                {
                    let prevValue = keyValuesArray[j - 1][1],
                        nKeys = keyValuesArray[j][0] - keyValuesArray[j - 1][0],
                        vIncr = ((keyValuesArray[j][1] - keyValuesArray[j - 1][1]) / nKeys);
                    for(let k = 0; k < nKeys; k++)
                    {
                        let value = prevValue + vIncr;
                        tuningSegment.push(value);
                        prevValue = value;
                    }
                }

                return tuningSegment;

            }

            checkGamutKeyValuesArray(gamutKeyValuesArray);

            let tuning = [];

            for(let i = 0; i < gamutKeyValuesArray[0][0]; i++)
            {
                tuning.push(gamutKeyValuesArray[0][1]);
            }
            let tuningSegment = getTuningSegment(gamutKeyValuesArray);
            for(let i = 0; i < tuningSegment.length; i++)
            {
                tuning.push(tuningSegment[i]);
            }
            while(tuning.length < 128)
            {
                tuning.push(gamutKeyValuesArray[gamutKeyValuesArray.length - 1][1]);
            }

            return tuning;
        }

        let gamutKeyValuesArray = [];
        if(octavesOrGamutStr.localeCompare("octaves") === 0)
        {
            checkRepeatingOctavesKeyValueArray(keyValuesArray);

            let complete = false;
            for(let octaveIncr = 0; octaveIncr < 127; octaveIncr += 12)
            {
                for(let i = 0; i < keyValuesArray.length; i++)
                {
                    let key = keyValuesArray[i][0] + octaveIncr,
                        value = keyValuesArray[i][1] + octaveIncr;

                    if(key <= 127 && value < 128)
                    {
                        gamutKeyValuesArray.push([key, value]);
                    }
                    else
                    {
                        complete = true;
                        break;
                    }
                }
                if(complete)
                {
                    break;
                }
            }
        }
        else if(octavesOrGamutStr.localeCompare("gamut") === 0)
        {
            gamutKeyValuesArray = keyValuesArray;
        }

        let tuning = getTuningFromGamutKeyValuesArray(gamutKeyValuesArray);

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns a 128-note tuning (containing octave tunings), having C as its rootKey, tuned to A4=414Hz.
    TuningsFactory.prototype.getBaroqueTuning = function(c0TuningOffsets)
    {
        console.assert(c0TuningOffsets[0] === 0);

        let tuning = getTuningFromETOffsets(c0TuningOffsets);

        transposeTuningForA4Frequency(tuning, 414);

        finalizeTuning(tuning);

        return tuning;
    };

    // See comment on Harmonic Tunings in tuningDefs.js
    TuningsFactory.prototype.getHarmonicTunings = function(tuningGroupDef)
    {
        // Returns the centDelta values in ascending order from the root key.
        // The keyFactorArray contains arrays of the form [key, fraction] in which:
        //   1. the divisors are such that the resulting fraction will be
        //      in the range 1 <= value < 2, so that all frequencies will be in one octave.
        //   2. The keys are arranged so that the frequencies will sort into ascending order.
        function getRootCentsDeltasForHarmonicTuning(keyFactorArray)
        {
            let rootKey = keyFactorArray[0][0],
                keyCentsDeltas = [];

            for(let i = 0; i < keyFactorArray.length; i++)
            {
                let keyFactor = keyFactorArray[i],
                    key = keyFactor[0],
                    factor = keyFactor[1],
                    semitonesAboveRoot = sizeIn12TETSemitones(factor, 1),
                    floorSemitonesAboveRoot = Math.floor(semitonesAboveRoot),
                    centsDelta = semitonesAboveRoot - floorSemitonesAboveRoot;

                if(floorSemitonesAboveRoot < (key - rootKey))
                {
                    centsDelta -= 1;
                }

                keyCentsDeltas.push({key, centsDelta});
            }

            keyCentsDeltas = keyCentsDeltas.sort((a, b) => a.key - b.key);

            let rootCentsDeltas = [];
            for(let i = 0; i < keyCentsDeltas.length; i++)
            {
                rootCentsDeltas.push(keyCentsDeltas[i].centsDelta);
            }

            return rootCentsDeltas;
        }

        // Returns tunings in which the midiPitch at tuning[midiKey][midiKey] is equal to midiKey.
        function getRootTunings(tuningDefs, rootCentsDeltas)
        {
            function getRootTuning(rootCentsDeltas, tuningDef)
            {
                let rootKey = tuningDef.root % 12,
                    tuning = [];

                console.assert(rootCentsDeltas.length === 12);

                tuning.name = tuningDef.name;

                // set tuning pattern at root
                let deltaIndex = 12 - rootKey;
                for(let i = 0; i < 128; i++)
                {
                    tuning.push(i + rootCentsDeltas[deltaIndex++ % 12]);
                }

                finalizeTuning(tuning);

                return tuning;
            }

            let rootTunings = [];
            for(let i = 0; i < tuningDefs.length; i++)
            {
                let rootTuning = getRootTuning(rootCentsDeltas, tuningDefs[i]);

                rootTunings.push(rootTuning);
            }

            return rootTunings;
        }

        //function logHarmonicTuningsInfos(harmonicTunings, tuningGroupName)
        //{
        //    // returns a 12x12 array
        //    function getRootXYArray(harmonicTunings)
        //    {
        //        let rootXYArray = [];

        //        for(let y = 0; y < 12; y++)
        //        {
        //            let tuningsRow = harmonicTunings[y],
        //                row = [];
        //            for(let x = 12; x < 24; x++)
        //            {
        //                row.push(tuningsRow[x] - 12);
        //            }
        //            rootXYArray.push(row);
        //        }
        //        return rootXYArray;
        //    }

        //    // returns a string of length width,
        //    // padded with spaces on the right.
        //    function padRight(n, width)
        //    {
        //        let rval = n.toString();

        //        while(rval.length < width)
        //        {
        //            rval = rval + " ";
        //        }

        //        return rval;
        //    }

        //    // returns a string of length width,
        //    // padded with spaces on the left.
        //    function padLeft(n, width)
        //    {
        //        let rval = n.toString();

        //        while(rval.length < width)
        //        {
        //            rval = " " + rval;
        //        }

        //        return rval;
        //    }

        //    function logTopNumbers(xLength, columnWidth)
        //    {
        //        let str = padRight("", columnWidth + 3);
        //        for(let z = 0; z < xLength; z++)
        //        {
        //            str = str.concat(`${padRight(z, columnWidth)}`);
        //        }
        //        console.log(str + "\n");
        //        let underline = padRight("", columnWidth);
        //        while(underline.length < str.length)
        //        {
        //            underline = underline + "-";
        //        }
        //        console.log(underline + "\n");
        //    }

        //    function logRootXYArray(rootXYArray, columnWidth)
        //    {
        //        function logRowY(y, xArray, columnWidth)
        //        {
        //            let str = `${padLeft(y.toString() + "|  ", columnWidth + 3)}`;
        //            for(let x = 0; x < xArray.length; x++)
        //            {
        //                let value = Math.round(xArray[x] * 100) / 100;
        //                str = str.concat(`${padRight(value, columnWidth)}`);
        //            }
        //            console.log(str + "\n");
        //        }

        //        let ySize = rootXYArray.length,
        //            xSize = rootXYArray[0].length;

        //        logTopNumbers(xSize, columnWidth);

        //        for(let y = 0; y < ySize; y++)
        //        {
        //            logRowY(y, rootXYArray[y], columnWidth);
        //        }
        //    }

        //    function logAllPivotKeysArrays(allPivotKeysArrays, columnWidth)
        //    {
        //        function getKeysString(pivotKeysArray)
        //        {
        //            let rval = "";
        //            if(pivotKeysArray.length === 12)
        //            {
        //                rval = "ALL";
        //            }
        //            else if(pivotKeysArray.length === 0)
        //            {
        //                rval = "-";
        //            }
        //            else
        //            {
        //                for(let i = 0; i < pivotKeysArray.length; i++)
        //                {
        //                    rval += `${pivotKeysArray[i]},`;
        //                }
        //                rval = rval.slice(0, -1);
        //            }
        //            return rval;
        //        }

        //        logTopNumbers(12, columnWidth); // target tuning indexes

        //        for(let initialTuningIndex = 0; initialTuningIndex < allPivotKeysArrays.length; initialTuningIndex++)
        //        {
        //            let xString = "",
        //                pivotKeysArrays = allPivotKeysArrays[initialTuningIndex];

        //            for(let targetTuningIndex = 0; targetTuningIndex < 12; targetTuningIndex++)
        //            {
        //                let pivotKeysArray = pivotKeysArrays[targetTuningIndex],
        //                    keysStr = getKeysString(pivotKeysArray);

        //                xString = `${xString}${padRight(keysStr, columnWidth)}`;
        //            }
        //            console.log(`${padLeft(initialTuningIndex, columnWidth)}|  ${xString}`);
        //        }
        //    }

        //    function getAllPivotKeysArrays(rootXYArray)
        //    {
        //        // The indexth element in the returned array is an array containing the keyIndexes
        //        // that pivot from the initialTuning to the indexth tuning.
        //        function getPivotKeysFromInitialTuning(initialTuningIndex, rootXYArray)
        //        {
        //            let pivotKeyArrays = [[], [], [], [], [], [], [], [], [], [], [], []],
        //                initialTuning = rootXYArray[initialTuningIndex];

        //            for(let targetTuningIndex = 0; targetTuningIndex < rootXYArray.length; targetTuningIndex++)
        //            {
        //                let targetTuning = rootXYArray[targetTuningIndex];

        //                for(let keyIndex = 0; keyIndex < rootXYArray[0].length; keyIndex++)
        //                {
        //                    let diff = targetTuning[keyIndex] - initialTuning[keyIndex];

        //                    if((Math.abs(diff) <= 0.05))
        //                    {
        //                        pivotKeyArrays[targetTuningIndex].push(keyIndex);
        //                    }
        //                }
        //            }

        //            return pivotKeyArrays;
        //        }

        //        let allPivotKeysArrays = [];
        //        for(let initialTuningIndex = 0; initialTuningIndex < rootXYArray.length; initialTuningIndex++)
        //        {
        //            let pivotKeys = getPivotKeysFromInitialTuning(initialTuningIndex, rootXYArray);

        //            allPivotKeysArrays.push(pivotKeys);
        //        }
        //        return allPivotKeysArrays;
        //    }

        //    let rootXYArray = getRootXYArray(harmonicTunings); // rootXYArray is a 12x12 array

        //    console.log(`\n*** ${tuningGroupName}: tunings per key (x) and tuning (y) ***`);
        //    logRootXYArray(rootXYArray, 7);

        //    let allPivotKeysArrays = getAllPivotKeysArrays(rootXYArray);
        //    console.log(`\n*** ${tuningGroupName}: keys having similar pitches in x and y tunings  ***`);
        //    logAllPivotKeysArrays(allPivotKeysArrays, 10);
        //}

        let tuningDefs = tuningGroupDef.tunings,
            rootCentsDeltas = getRootCentsDeltasForHarmonicTuning(tuningGroupDef.keyFactorArray),
            harmonicTunings = getRootTunings(tuningDefs, rootCentsDeltas);

        // logHarmonicTuningsInfos(harmonicTunings, tuningGroupDef.name);

        return harmonicTunings;
    };

    return API;

}());

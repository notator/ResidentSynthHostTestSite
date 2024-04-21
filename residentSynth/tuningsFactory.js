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

                    value = (value < 0) ? 0 : value;
                    value = (value >= 128) ? 127.9999 : value;

                    tuning[i] = value;
                }
            }

            check(tuning);
            coerce(tuning);
        },

        // Returns the (floating point) number of Equal Temperament semitones
        // between the two frequencies.
        // The result will be positive if frequency1 >= frequency2,
        // and negative if frequency1 < frequency2.
        getSemitones = function(frequency1, frequency2)
        {
            let frequencyRatio = frequency1 / frequency2,
                equalTemperamentSemitones = 12 * Math.log2(frequencyRatio); // log base 2

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
                semitonesDiff = getSemitones(currentA4Frequency, a4Frequency);
 
            for(let i = 0; i < 128; i++)
            {
                tuning[i] = tuning[i] + semitonesDiff; // will be coerced to 0..<128 later
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
    // The rootKey frequency is allocated to the rootKey.
    // Keys are numbered, according to the MIDI convention:
    //     C = 0, C# = 1, D = 2, D# = 3, E = 4, F = 5, F# = 6, G = 7, G# = 8, A = 9, A# = 10, B = 11.
    // with their respective octave transpositions:
    //     C0 = 12, C1 = 24, C2 = 36, C3 = 48, C4 = 60, C5 = 72, C6 = 84, C7 = 96, C8 = 108, C9 = 120
    //
    // This function is used for Pythagorean and other mean-tone tunings.
    // The "wolf fifth" is placed in the interval G#-Eb when the root is C.
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
                let centsOffset = (getSemitones(factors[i], 1) - i) * 100;
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

        while(!(factorBase < 2))
        {
            factorBase /= 2;
        }
        console.assert(factorBase > 1);
        console.assert(Number.isInteger(rootKey) && 0 <= rootKey && rootKey < 12);

        let c0tuningOffsets = getTuningOffsets(rootKey, factorBase),
            tuning = getTuningFromETOffsets(c0tuningOffsets);

        transposeTuningForA4Frequency(tuning, 440);

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
                tuning.push(midiA4 + getSemitones(frequencies[i], 440));
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
                    semitonesAboveRoot = getSemitones(factor, 1),
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

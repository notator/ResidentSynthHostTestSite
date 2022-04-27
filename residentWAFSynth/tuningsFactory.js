/* Copyright 2020 James Ingram
 * https://james-ingram-act-two.de
 * 
 * All the code in this project is covered by an MIT license.
 * https://github.com/surikov/webaudiofont/blob/master/LICENSE.md
 * https://github.com/notator/WebMIDISynthHost/blob/master/License.md
 */

/* WebMIDI.tuningsFactory namespace containing a TuningsFactory constructor. */

WebMIDI.namespace('tuningsFactory');

WebMIDI.tuningsFactory = (function()
{
    "use strict";
    let
        // All (public) constructors should call this function before returning.
        // The argument is an array of 128 floating point numbers representing the number of
        // (floating point) semitones above MIDI C0 for each MIDI key (=index).
        // An exception is thrown if the argument's length is not 128, or it contains anything other than numbers.
        // This function justifies the values in the array by coercing them to 0.0 <= value < 128.0 and rounding
        // them to a maximum of four decimal places. 
        // Note that the values in the tuning will usually be in ascending order, but that this is not absolutely necessary.
        finalizeTuning = function(tuning)
        {
            function check(tuning)
            {
                console.assert(tuning.length === 128);
                for(var i = 0; i < 128; i++)
                {
                    let value = tuning[i];
                    console.assert(!Number.isNaN(value));
                }
            }
            function coerce(tuning)
            {
                for(let i = 0; i < 128; i++)
                {
                    let value = Math.round(tuning[i] * 10000) / 10000;

                    value = (value < 0) ? 0 : value;
                    value = (value >= 128) ? 127.9999 : value;

                    tuning[i] = value;
                }
            }

            check(tuning);
            coerce(tuning);

        //    let freq = getFrequency(tuning[69]);
        //    console.log("tuning[69]=" + tuning[69].toString() + " - A4Frequency=" + freq.toString() + "Hz");
        },

        // Returns the number of cents equivalent to the frequencyRatio
        getCents = function(frequencyRatio)
        {
            return 1200 * Math.log2(frequencyRatio);
        },

        getFrequency = function(midiCents)
        {
            let pow = (midiCents - 69) / 12,
                frequency = Math.pow(2, pow) * 440;

            return frequency;
        },

        // Transpose the tuning so that A4 (midi key 69) has a midiCent value equivalent to A4Frequency
        // The A4 midiCents value is rounded to a maximum of 4 decimal places.
        transposeTuningForA4Frequency = function(tuning, A4Frequency)
        {
            let currentA4Frequency = getFrequency(tuning[69]),
                semitonesDiff = getCents(A4Frequency / currentA4Frequency) / 100;

            for(var i = 0; i < 128; i++)
            {
                let value = Math.round((tuning[i] + semitonesDiff) * 10000) / 10000;
                tuning[i] = value;
            }
        },

        //// Converts a frequency in Hertz to a MidiCent value (semitones above MIDI C0)
        //getMidiCents = function(frequency)
        //{
        //    return this.getCents(frequency / WebMIDI.constants.MIDI_0_FREQUENCY) / 100.0;
        //},

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

        for(var i = 0; i < 128; i++)
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
    // The "wolf fifth" is placed in the interval A#-Eb when the root is C.
    TuningsFactory.prototype.getTuningFromConstantFactor = function(rootKey, factorBase)
    {
        function getTuningOffsets(rootKey, factorBase)
        {
            let factors = [];

            for(var i = 0; i < 9; i++)
            {
                let factor = Math.pow(factorBase, i);
                while(!(factor < 2))
                {
                    factor /= 2;
                }
                factors.push(factor);
            }

            for(var i = 1; i < 4; i++)
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
            for(var i = 0; i < factors.length; i++)
            {
                let centsOffset = getCents(factors[i]) - (i * 100);
                tuningOffsets.push(centsOffset);
            }

            // rotate the tuningOffsets until tuningOffsets[0] (=0) is at newTuningOffsets[rootKey].
            let rotatedTuningOffsets = [];
            for(var i = 0; i < 12; i++)
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

    // Returns a 128-note tuning (containing octave tunings) tuned according to Harry Partch's scale with A4 tuned to 440Hz.
    // The rootKey (which is allocated a pitch of rootKey MidiCents above C0) is an integer in range [0..11].
    // Keys below the rootKey are allocated the same MidiCent value as the rootKey.
    TuningsFactory.prototype.getPartchTuning = function(rootKey)
    {
        function getPartchETTuningOffsets(rootKey)
        {
            const partchFundamentals = [
                1.0 / 1,
                16.0 / 15,
                9.0 / 8,
                6.0 / 5,
                5.0 / 4,
                4.0 / 3,
                7.0 / 5,
                3.0 / 2,
                8.0 / 5,
                5.0 / 3,
                16.0 / 9,
                15.0 / 8
            ];

            let tuningOffsets = [];
            for(var i = 0; i < partchFundamentals.length; ++i)
            {
                let centsOffset = getCents(partchFundamentals[i]) - (i * 100);
                tuningOffsets.push(centsOffset);
            }

            // rotate the tuningOffsets until tuningOffsets[0] (=0) is at newTuningOffsets[rootKey].
            let rotatedTuningOffsets = [];
            for(var i = 0; i < 12; i++)
            {
                let newIndex = (i + rootKey) % 12;
                rotatedTuningOffsets[newIndex] = tuningOffsets[i];
            }

            return rotatedTuningOffsets;
        }

        console.assert(Number.isInteger(rootKey) && rootKey >= 0 && rootKey < 12);

        let C0_TuningOffsets = getPartchETTuningOffsets(rootKey),
            tuning = getTuningFromETOffsets(C0_TuningOffsets);

        transposeTuningForA4Frequency(tuning, 440);

        finalizeTuning(tuning);

        return tuning;
    };

    // Returns a new 128-note tuning containing octave tunings. (A4 can be tuned to any value.)
    // The keyValuesArray is an array of arrays, each of which contains a [key, value] pair.
    // There must be more than 1 [key, value] array in the keyValuesArray.
    // Both the keys and tha values must be strictly in ascending order in the keyValuesArray.
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
            for(var i = 0; i < keyValuesArray.length; i++)
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
            for(var i = 1; i < keyValuesArray.length; i++)
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
                for(var i = 1; i < gamutKeyValuesArray.length; i++)
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
            // A tuningSegment is a contiguous array of increasing MidiCent values, one per key in range.
            // The keyValuesArray is an array containing only the [key,pitch] arrays that define fixed points in the (warped) midiCentsArraySegment.
            // The returned values do not exceed the range of the values in the keyValuesArray argument.
            // The returned values have been interpolated (per key) between those in the keyValuesArray argument.
            function getTuningSegment(keyValuesArray)
            {
                checkGamutKeyValuesArray(keyValuesArray);

                let midiCentsArraySegment = [];

                midiCentsArraySegment.rootKey = keyValuesArray[0][0];

                midiCentsArraySegment.push(keyValuesArray[0][1]);
                for(var j = 1; j < keyValuesArray.length; j++)
                {
                    let prevValue = keyValuesArray[j - 1][1],
                        nKeys = keyValuesArray[j][0] - keyValuesArray[j - 1][0],
                        vIncr = ((keyValuesArray[j][1] - keyValuesArray[j - 1][1]) / nKeys);
                    for(var k = 0; k < nKeys; k++)
                    {
                        let value = prevValue + vIncr;
                        midiCentsArraySegment.push(value);
                        prevValue = value;
                    }
                }

                return midiCentsArraySegment;

            }

            checkGamutKeyValuesArray(gamutKeyValuesArray);

            let tuning = [];

            for(let i = 0; i < gamutKeyValuesArray[0][0]; i++)
            {
                tuning.push(gamutKeyValuesArray[0][1]);
            }
            let midiCentsArraySegment = getTuningSegment(gamutKeyValuesArray);
            for(let i = 0; i < midiCentsArraySegment.length; i++)
            {
                tuning.push(midiCentsArraySegment[i]);
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
            for(var octaveIncr = 0; octaveIncr < 127; octaveIncr += 12)
            {
                for(var i = 0; i < keyValuesArray.length; i++)
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

    // Returns a new tuning that is the originalTuning transposed by semitoneTransposition.
    // (A4 can be tuned to any value.)
    // If semitoneTransposition is negative, the tuning is transposed downwards.
    TuningsFactory.prototype.getTransposedTuning = function(tuning, semitoneTransposition)
    {
        let transposedTuning = [];
        for(var i = 0; i < tuning.length; i++)
        {
            let midiCents = tuning[i] + semitoneTransposition;

            transposedTuning.push(midiCents);
        }

        finalizeTuning(transposedTuning);

        return transposedTuning;
    };

    // Returns the number of cents equivalent to the frequencyRatio
    TuningsFactory.prototype.getCents = function(frequencyRatio)
    {
        return getCents(frequencyRatio);
    },

    // Coerces the values in the tuning to 0.0 <= value < 128.0
    // and rounds them to a maximum of four decimal places.
    // This function should be called on every tuning that has been changed.
    TuningsFactory.prototype.finalizeTuning = function(tuning)
    {
        return finalizeTuning(tuning);
    },

    TuningsFactory.prototype.getSysExTuningChangeMsg = function(channel, tuning)
    {
        // Returns an array of the same length as the 'tuning' argument (which is an array of 128 midiCent values),
        // but containing objects having the following fields:
        // .midiCents : the original tuning value (not actually needed for the sysEx message)
        // .basePitch : the portion of the midiCents value before the decimal point
        // .data1 and data2 : the portion of the midiCents value after the decimal point, encoded as a 14bit composite value.
        // In compliance with the official MIDI tuning standard, the .basePitch, .data1 and .data2 will be sent to the synth
        // using a sysex command, and recomposed to the.midiCents value by code in the synth. 
        function getValuesForSysExMessage(tuning)
        {
            let sysExValues = [];

            for(var i = 0; i < tuning.length; i++)
            {
                let midiCents = Math.round(tuning[i] * 100) / 100,
                    basePitch = Math.floor(midiCents),
                    cents = midiCents - basePitch,
                    centsMult = cents * 16384,
                    sysExVal = {};

                sysExVal.midiCents = midiCents; // actually not needed for sysEx message
                sysExVal.basePitch = basePitch;
                sysExVal.data1 = (centsMult >> 7) & 0x7f;
                sysExVal.data2 = centsMult & 0x7f;

                sysExValues.push(sysExVal);
            }

            return sysExValues;
        }

        let constants = WebMIDI.constants,
            CMD = constants.COMMAND,
            SYSEX = constants.SYSEX,
            sysExValues = getValuesForSysExMessage(tuning),
            msgLength = 9 + (4 * sysExValues.length),
            sysExMsg = new Uint8Array(msgLength),
            i = 0;

        sysExMsg[i++] = CMD.SYSEX;
        sysExMsg[i++] = SYSEX.NON_REAL_TIME;
        sysExMsg[i++] = SYSEX.RESEARCH_DEVICE_ID;
        sysExMsg[i++] = SYSEX.MIDI_TUNING;
        sysExMsg[i++] = SYSEX.MIDI_TUNING_NOTE_CHANGES_NON_REAL_TIME_BANK;
        sysExMsg[i++] = 0; // unused tuning bank (there is currently only one tuning per channel)
        sysExMsg[i++] = channel; // each channel has its own tuning
        sysExMsg[i++] = sysExValues.length;
        for(let j = 0; j < sysExValues.length; ++j)
        {
            sysExMsg[i++] = j;
            sysExMsg[i++] = sysExValues[j].basePitch;
            sysExMsg[i++] = sysExValues[j].data1;
            sysExMsg[i++] = sysExValues[j].data2;
        }
        sysExMsg[msgLength - 1] = SYSEX.END_OF_MESSAGE;

        console.assert(i === msgLength - 1);

        return sysExMsg;
    };

	return API;

}());

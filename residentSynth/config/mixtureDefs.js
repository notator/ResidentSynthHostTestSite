console.log('load mixtureDefs.js');

WebMIDI.namespace('mixtureDefs');

// This file can be omitted by applications that dont want to define mixtures.
// The mixtureDefs array is an array of mixture definitions.
// Each mixture definition is an array of [keyInterval, relativeVelocity] arrays.
// Each mixture definition can have any length greater than 0.
// Each [keyInterval, relativeVelocity] array defines a noteOn that will be sent
// with the original noteOn message that has (originalKey, originalvelocity):
// The new noteOn has (originalKey + keyInterval, originalvelocity * relativeVelocity)).
// keyInterval must be integers in range -127..+127 inclusive.
// relativeVelocity are usually floats > 0 and < 1, but can be <= 100.0.
// (originalKey + keyInterval) will be silently coerced to the range 0..127 inclusive.
// (originalvelocity * relativeVelocity) will be silently coerced to the range 1..127 inclusive.
WebMIDI.mixtureDefs =
    [
        [
            [4, 0.75], [7, 0.5], [12, 0.4], [24, 0.2]
        ],
        [
            [4, 0.75], [8, 0.5], [13, 0.4]
        ],
        [
            [19, 0.2]
        ],
        [
            [6, 0.75], [12, 0.4], [24, 0.2], [37, 0.1]
        ],
        [
            [9, 0.4], [13, 0.3], [12, 0.2], [24, 0.1]
        ]
    ];


//// Each basePresetIndex is the General MIDI preset index, that has
//// been saved in each preset's presetIndex attribute in the synth's webAudioFonts.
//WebMIDI.presetMixtureDefs =
//    [
//        {
//            webAudioFontIndex: 0,
//            basePresetBankIndex: 0,
//            basePresetIndex: 16, // organ
//            mixtureIndex: 0
//        },
//        {
//            webAudioFontIndex: 0,
//            basePresetBankIndex: 0,
//            basePresetIndex: 58, // tuba
//            mixtureIndex: 1
//        },
//        {
//            webAudioFontIndex: 0,
//            basePresetBankIndex: 0,
//            basePresetIndex: 58, // tuba
//            mixtureIndex: 2
//        },
//        {
//            webAudioFontIndex: 0,
//            basePresetBankIndex: 0,
//            basePresetIndex: 8, // celesta
//            mixtureIndex: 3
//        },
//        {
//            webAudioFontIndex: 0,
//            basePresetBankIndex: 0,
//            basePresetIndex: 46, // harp
//            mixtureIndex: 4
//        }
//    ];






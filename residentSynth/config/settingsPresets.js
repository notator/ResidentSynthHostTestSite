console.log('load settingsPresets.js');

// Each preset definition has a name, and defines a set of values for all the controls in a channel in the host.
// The full set of preset attributes is as follows:
//		.name // string
// selects: // The values are the indexes in the select.
//		.bankIndex // integer
//		.presetIndex // integer
//      .mixtureIndex // integer
//		.tuningGroupIndex // integer
//		.tuningIndex // integer
// integerInputs: // The values are the numbers in the input elements.
//      .semitonesOffset // -36..+36
//      .centsOffset // -50..+50
//		.triggerKey // 0..127 (Not used by the ResidentSynth)
// sliders:
//      .pitchWheel // 0..127 (default 64) (The value is used for both MSB and LSB)
//		.modWheel // 0..127
//		.volume // 0..127
//		.pan // 0..127
//		.reverberation// 0..127
//		.pitchWheelSensitivity// 0..127
// floatInputs:
//      .velocityPitchSensitivity // 0.0..1.0
// string:
//      .keyOrnamentsString // e.g "64:0 43:1 78:0" (Not used by the ResidentSynth)
//
// An ALL_CONTROLLERS_OFF message is sent before applying any settingsPreset.

ResSynth.settingsPresets =
    [
        {
            "name": "settings 0: (=defaults)", // this settings contains the default settings
            "bankIndex": 0,
            "presetIndex": 0,
            "mixtureIndex": 0,
            "tuningGroupIndex": 0,
            "tuningIndex": 0,
            "semitonesOffset": 0,
            "centsOffset": 0,
            "pitchWheel": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 64,
            "reverberation": 0,
            "pitchWheelSensitivity": 2,
            "triggerKey": 36,
            "velocityPitchSensitivity": 0,
            "keyOrnamentsString": ""
        },
        {
            "name": "settings 1: font=Study 2,  semitonesOffset=-1.9",
            "bankIndex": 3,
            "presetIndex": 0,
            "mixtureIndex": 0,
            "tuningGroupIndex": 3,
            "tuningIndex": 0,
            "semitonesOffset": -2,
            "centsOffset": 10,
            "pitchWheel": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 64,
            "reverberation": 0,
            "pitchWheelSensitivity": 2,
            "triggerKey": 36,
            "velocityPitchSensitivity": 0,
            "keyOrnamentsString": "64:0"
        },
        {
            "name": "settings 2: Harp (Fluid), semitonesOffset=0.5",
            "bankIndex": 1,
            "presetIndex": 0,
            "mixtureIndex": 0,
            "tuningGroupIndex": 0,
            "tuningIndex": 2,
            "semitonesOffset": 0,
            "centsOffset": 50,
            "pitchWheel": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 64,
            "reverberation": 0,
            "pitchWheelSensitivity": 2,
            "triggerKey": 36,
            "velocityPitchSensitivity": 0,
            "keyOrnamentsString": "64:0; 66:1"
        },
        {
            "name": "settings 3: Vibraphone, semitonesOffset=-0.5, pan=20",
            "bankIndex": 3,
            "presetIndex": 3,
            "mixtureIndex": 0,
            "tuningGroupIndex": 0,
            "tuningIndex": 0,
            "semitonesOffset": 0,
            "centsOffset": -50,
            "pitchWheel": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 20,
            "reverberation": 0,
            "pitchWheelSensitivity": 2,
            "triggerKey": 36,
            "velocityPitchSensitivity": 0,
            "keyOrnamentsString": "64:0; 66:1; 68:2"
        }
        // etc. more settings definitions can be added here.
    ];
console.log('load synthSettings.js');

// Each synthSetting, in the synthSettings array defined here, defines settings that override the default settings in the synth's 16 channels.
// The channel index for each override is its index in the channelSettingsArray.
// The default channelSettings, which apply if this file is missing or empty, are:
// {
//     "name": "default channel setting",
//     "bankIndex": 0,
//     "presetIndex": 0,
//     "mixtureIndex": 0,
//     "tuningGroupIndex": 0,
//     "tuningIndex": 0,
//     "semitonesOffset": 0,
//     "centsOffset": 0,
//     "pitchWheel": 64,
//     "modWheel": 0,
//     "volume": 100,
//     "pan": 64,
//     "reverberation": 0,
//     "pitchWheelSensitivity": 2,
//     "triggerKey": 36,
//     "velocityPitchSensitivity": 0,
//     "keyboardSplitIndex": 0,
//     "keyboardOrnamentsArrayIndex": 0
// }
//
// In detail, the full set of channelSetting attributes is as follows:
//		.name // string
// selects: // The values are the indexes in the ResidentSynthHost's corresponding select.
//		.bankIndex // integer 0..n-1, where n is the number of banks defined in webAudioFontDef.js
//		.presetIndex // integer 0..n-1, where n is the number of presets defined in the bank defined in webAudioFontDef.js
//      .mixtureIndex // integer 0..n-1, where n is the number of mixtures defined in mixtureDefs.js
//		.tuningGroupIndex // integer 0..n-1, where n is the number of tuningGroups defined in tuningDefs.js
//		.tuningIndex // integer 0..n, where n-1 is the number of tunings in the group defined in tuningDefs.js
//      .keyboardSplitIndex // integer 0..n-1, where n is the number of keyboardSplitDefs defined in keyboardSplitDefs.js
//      .keyboardOrnamentsArrayIndex // integer 0..n-1, where n is the number of ornamentPerKeysStrings defined in ornamentDefs.js
// integerInputs: // The values are numbers in input elements or selectedIndex values.
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
//      .velocityPitchSensitivity // 0.0..127
//
// An ALL_CONTROLLERS_OFF message is sent before applying any settingsPreset.

ResSynth.synthSettings =
[
    // Internally, the synth creates a default synthSetting (named "settings 0 (default)"),
    // containing the default channelSetting in each channel, at index 0 of its list of alternate synthSettings.
    // The first synthSetting to be defined here will therefore be at index 1.
    {
        // N.B. The .keyboardSplitIndex will be copied to each channel's settings internally.
        // It IS ALWAYS the same in all channelSettings in a synthSetting!
        // Any keyboardSplitIndex set here in the individual channelSettings will be ignored.
        "name": "settings 1 (keyboardSplitIndex 0)",
        "keyboardSplitIndex": 0,  // this is the default setting when this file does not exist or is empty.
        "channelSettings":
            [
                {
                    "name": "channel 0: (=defaults)", // this channelSetting is the default
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
                    "keyboardOrnamentsArrayIndex": 0
                },
                {
                    "name": "channel 1: font=Study 2,  semitonesOffset=-1.9",
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
                    "keyboardOrnamentsArrayIndex": 1
                },
                {
                    "name": "channel 2: Harp (Fluid), semitonesOffset=0.5",
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
                    "keyboardOrnamentsArrayIndex": 2
                },
                {
                    "name": "channel 3: Vibraphone, semitonesOffset=-0.5, pan=20",
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
                    "keyboardOrnamentsArrayIndex": 3
                }// add a comma here if there are more channel settings
            ]
    }, // add a comma here if there are more synth settings
    {
        "name": "settings 2 (keyboardSplitIndex 3)", // simply interchanges the settings for channels 0 and 1
        "keyboardSplitIndex": 3,
        "channelSettings":
            [
                {
                    "name": "channel 0: font=Study 2,  semitonesOffset=-1.9",
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
                    "keyboardOrnamentsArrayIndex": 1
                },
                {
                    "name": "channel 1: (=defaults)", // this settings contains the default settings
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
                    "keyboardOrnamentsArrayIndex": 0
                },
                {
                    "name": "channel 2: Harp (Fluid), semitonesOffset=0.5",
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
                    "keyboardOrnamentsArrayIndex": 2
                },
                {
                    "name": "channel 3: Vibraphone, semitonesOffset=-0.5, pan=20",
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
                    "keyboardOrnamentsArrayIndex": 3
                } // add a comma here if there are more channel settings
            ]
    } // add a comma here if there are more synth settings
];
console.log('load settingsPresets.js');

// Each preset definition has a name, and defines a set of values for all the controls in the host.
// The full set of preset attributes is as follows:
//		.name // string
// selects: // The values are the strings that appear in the control.
//		.channel // string
//		.font // string
//		.preset // string
//      .mixture // string
//		.tuningGroup // string
//		.tuning // string
//      .a4 // string
//		.triggerKey // string
// sliders:
//		.pitchWheel // 0..127
//		.modWheel // 0..127
//		.volume // 0..127
//		.pan // 0..127
//		.reverberation// 0..127
//		.pitchWheelSensitivity// 0..127
//
// Before setting the above values, the setChannelStateMessage automatically
//     1. sets ALL_CONTROLLERS_OFF(the synth automatically sets ALL_SOUND_OFF)

ResSynth.settingsPresets =
    [
        {
            "name": "settings 0: (=defaults)",
            "channel": 0,
            "fontIndex": 0,
            "presetIndex": 0,
            "mixtureIndex": 0,
            "tuningGroupIndex": 0,
            "tuningIndex": 0,
            "centsOffset": 0,
            "pitchWheelData1": 64,
            "pitchWheelData2": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 64,
            "reverberation": 0,
            "pitchWheelSensitivity": 2,
            "triggerKey": 36

        },
        {
            "name": "settings 1: channel=5, font=Study 2, tuning=420",
            "channel": 5,
            "fontIndex": 3,
            "presetIndex": 0,
            "mixtureIndex": 0,
            "tuningGroupIndex": 3,
            "tuningIndex": 0,
            "centsOffset": 81,
            "pitchWheelData1": 64,
            "pitchWheelData2": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 64,
            "reverberation": 0,
            "pitchWheelSensitivity": 2,
            "triggerKey": 36

        },
        {
            "name": "settings 2: Harp (Fluid)",
            "channel": 0,
            "fontIndex": 1,
            "presetIndex": 0,
            "mixtureIndex": 0,
            "tuningGroupIndex": 0,
            "tuningIndex": 2,
            "centsOffset": 0,
            "pitchWheelData1": 64,
            "pitchWheelData2": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 64,
            "reverberation": 0,
            "pitchWheelSensitivity": 2,
            "triggerKey": 36

        },
        {
            "name": "settings 3: Vibraphone, a4Frequency=420, pan=20",
            "channel": 0,
            "fontIndex": 3,
            "presetIndex": 3,
            "mixtureIndex": 0,
            "tuningGroupIndex": 0,
            "tuningIndex": 0,
            "centsOffset": 81,
            "pitchWheelData1": 64,
            "pitchWheelData2": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 20,
            "reverberation": 0,
            "pitchWheelSensitivity": 2,
            "triggerKey": 36

        }
        // etc. more settings definitions can be added here.
    ];
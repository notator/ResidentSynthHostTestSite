console.log('load actionDefs.js');

WebMIDI.namespace('actionDefs');

// Each preset definition has a name, and defines a set of values for all the controls in the host.
// The full set of preset attributes is as follows:
//		.name // string
// selects: // The values are the strings that appear in the control.
//		.channel // string
//		.font // string
//		.instrument // string
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
WebMIDI.presets =
    [
        {
            "name": "preset 0: channel=5, font=Study 2, tuning=420",
            "channel": "5",
            "font": "Study 2",
            "instrument": "000:008 - Celesta (FluidR3)",
            "mixture": "none",
            "tuningGroup": "constant factor tunings",
            "tuning": "Equal Temperament, root=0, factor=2^(1/12)",
            "a4Frequency": "420",
            "triggerKey": "36",
            "pitchWheel": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 64,
            "reverberation": 0,
            "pitchWheelSensitivity": 2
        },
        {
            "name": "preset 1: (=defaults)",
            "channel": "0",
            "font": "Test Font",
            "instrument": "000:016 - Drawbar Organ (FluidR3)",
            "mixture": "none",
            "tuningGroup": "constant factor tunings",
            "tuning": "Equal Temperament, root=0, factor=2^(1/12)",
            "a4Frequency": "440",
            "triggerKey": "36",
            "pitchWheel": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 64,
            "reverberation": 0,
            "pitchWheelSensitivity": 2
        },
        {
            "name": "preset 2: Harp (Fluid)",
            "channel": "0",
            "font": "interesting Fluid presets",
            "instrument": "000:046 - Orchestral Harp (FluidR3)",
            "mixture": "none",
            "tuningGroup": "constant factor tunings",
            "tuning": "1/4 comma meantone, root=0 (C), factor=1.495348",
            "a4Frequency": "440",
            "triggerKey": "36",
            "pitchWheel": 64,
            "modWheel": 0,
            "volume": 100,
            "pan": 64,
            "reverberation": 0,
            "pitchWheelSensitivity": 2
    },
    {
        "name": "preset 3: Vibraphone, a4Frequency=420, pan=20",
        "channel": "5",
        "font": "Study 2",
        "instrument": "000:011 - Vibraphone (FluidR3)",
        "mixture": "none",
        "tuningGroup": "constant factor tunings",
        "tuning": "Equal Temperament, root=0, factor=2^(1/12)",
        "a4Frequency": "420",
        "triggerKey": "36",
        "pitchWheel": 64,
        "modWheel": 0,
        "volume": 100,
        "pan": 20,
        "reverberation": 0,
        "pitchWheelSensitivity": 2
    }
        // etc. more preset definitions can be added here.
    ];
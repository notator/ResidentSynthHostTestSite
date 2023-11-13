console.log('load synthSettingsDefs.js');

// This file can be omitted by applications that don't use custom settings.
// It defines the `ResSynth.synthSettingsDefs` array, containing the definitions of settings
// for the _ResidentSynth_ that can be used to override the default channel settings which are
// otherwise set in the synth's 16 channels. Each channelSetting only contains the attributes
// that change the current settings in the channel.
//
// On loading, the host stores the synthSettingsDefs, in order, as options in its settingsSelect
// control. If index 0 is selected in this control, all attributes in all channels are first set to
// their default values, before applying synthSettingsDefs[0].
// If the settingSelect control is set manually, the list of changes from index=0 (including setting
// all defaults) up to the selectedIndex is applied in order.
// If the settingsSelect control is incremented by a trigger, only the settings at the new
// selectedIndex are updated. (Triggers begin again at selectedIndex 0 when the end of the list is reached.)
//
// The *synthSettings* attributes are as follows:
//   `name` -- an arbitrary, descriptive string(default: "default synth settings")
//   `keyboardSplitIndex` -- the index(default: 0) in the synth's internal array of alternative
//       keyboard splits(see keyboardSplitDefs).This `keyboardSplitIndex` value always
//       overrides the corresponding value in the individual channel settings.
//       The `keyboardSplitIndex` is an integer 0..n (default: 0), where n is the number of keyboardSplitDefs
//         defined in keyboardSplitDefs.js
//   `triggerKey` // 0..127 (default: 0) -- used by the host, not by the _ResidentSynth_.
//   `channelSettings` -- an array of up to 16 channelSettings objects that alter the current state.
//
// The *channelSettings* attributes are as follows:
//     `channel` // the channel index to which the changes will be made.
// * selects: // The index values of the _ResidentSynthHost_'s select controls.
//     `bankIndex` // integer 0..n-1 (default: 0), where n is the number of banks defined in
//         webAudioFontDef.js
//     `presetIndex` // integer 0..n-1 (default: 0), where n is the number of presets defined
//         in the bank defined in webAudioFontDef.js
//     `mixtureIndex` // integer 0..n (default: 0), where n is the number of mixtures defined in
//         mixtureDefs.js
//     `tuningGroupIndex` // integer 0..n (default: 0), where n is the number of tuningGroups
//         defined in tuningDefs.js
//     `tuningIndex` // integer 0..n (default: 0), where n is the number of tunings in the group
//         defined in tuningDefs.js
//     `keyboardOrnamentsArrayIndex` // integer 0..n (default: 0), where n is the number of
//         ornamentPerKeysStrings defined in ornamentDefs.js
// * integerInputs: // The values of the _ResidentSynthHost_'s numerical input controls.
//     `semitonesOffset` // -64..+63 (default: 0)
//     `centsOffset` // -50..+50 (default: 0)
// * sliders: // The values of the _ResidentSynthHost_'s command and control sliders.
//     `pitchWheel` // 0..127 (default 64) (The value is used for both MSB and LSB)
//     `modWheel` // 0..127 (default: 0)
//     `volume` // 0..127 (default: 100)
//     `pan` // 0..127 (default: 64)
//     `reverberation` // 0..127 (default: 0)
//     `pitchWheelSensitivity` // 0..127 (default: 2)
//     `velocityPitchSensitivity` // 0.0..127 (default: 0)

var ResSynth = ResSynth || {};

ResSynth.synthSettingsDefs =
    [
        {
            // settingsSelect.option 0
            name: "settings 0 (default settings in all channels)",
            //keyboardSplitIndex: 0, // currently default (= 0)
            triggerKey: 36, // default is 0
            channelSettings: []
        },
        {
            // settingsSelect.option 1
            name: "settings 1 (ch0 font, ch1 fontTuningOrnaments, ch2 fontTuningOrnaments, ch3 font tuning)",
            //keyboardSplitIndex: 0, // this is the default setting when this file does not exist or is empty.
            //triggerKey is currently 36, // default is 0
            channelSettings:
                [
                    {
                        channel: 0,
                        bankIndex: 1 // default 0
                        // no change in other attributes (these are the defaults)
                        //presetIndex: 0,
                        //mixtureIndex: 0,
                        //tuningGroupIndex: 0,
                        //tuningIndex: 0,
                        //semitonesOffset: 0,
                        //centsOffset: 0,
                        //pitchWheel: 64,
                        //modWheel: 0,
                        //volume: 100,
                        //pan: 64,
                        //reverberation: 0,
                        //pitchWheelSensitivity: 2,
                        //velocityPitchSensitivity: 0,
                        //keyboardOrnamentsArrayIndex: 0
                    },
                    {
                        channel: 1,
                        bankIndex: 3,
                        //presetIndex: 0,
                        //mixtureIndex: 0,
                        tuningGroupIndex: 3,
                        //tuningIndex: 0,
                        semitonesOffset: -2,
                        centsOffset: 10,
                        //pitchWheel: 64,
                        //modWheel: 0,
                        //volume: 100,
                        //pan: 64,
                        //reverberation: 0,
                        //pitchWheelSensitivity: 2,
                        //velocityPitchSensitivity: 0,
                        keyboardOrnamentsArrayIndex: 1
                    },
                    {
                        channel: 2,
                        bankIndex: 1,
                        //presetIndex: 0,
                        //mixtureIndex: 0,
                        //tuningGroupIndex: 0,
                        tuningIndex: 2,
                        //semitonesOffset: 0,
                        centsOffset: 50,
                        //pitchWheel: 64,
                        //modWheel: 0,
                        //volume: 100,
                        //pan: 64,
                        //reverberation: 0,
                        //pitchWheelSensitivity: 2,
                        //velocityPitchSensitivity: 0,
                        keyboardOrnamentsArrayIndex: 2
                    },
                    {
                        channel: 3,
                        bankIndex: 3,
                        presetIndex: 3,
                        //mixtureIndex: 0,
                        //tuningGroupIndex: 0,
                        //tuningIndex: 0,
                        //semitonesOffset: 0,
                        centsOffset: -50,
                        //pitchWheel: 64,
                        //modWheel: 0,
                        //volume: 100,
                        pan: 20,
                        //reverberation: 0,
                        //pitchWheelSensitivity: 2,
                        //velocityPitchSensitivity: 0,
                        keyboardOrnamentsArrayIndex: 3
                    }// add a comma here if there are more channel settings
                ]
        },
        {
            // settingsSelect.option 2
            name: "settings 2 (ch0 and ch1 changes -- ch1->defaults)", // simply interchanges the settings for channels 0 and 1 in settings 1
            keyboardSplitIndex: 3,
            //triggerKey is currently 36, // default is 0
            channelSettings:
                [
                    {
                        channel: 0,
                        bankIndex: 3, // currently 1
                        //presetIndex: 0, // currently 0 (set by bankIndex)
                        //mixtureIndex: 0, // currently 0,
                        tuningGroupIndex: 3, // currently 0,
                        //tuningIndex: 0, // currently 0 (set by tuningGroupIndex),
                        semitonesOffset: -2,// currently 0,
                        centsOffset: 10, // currently 0,
                        //pitchWheel: 64, // currently 64,
                        //modWheel: 0, // currently 0,
                        //volume: 100, // currently 100,
                        //pan: 64, // currently 64,
                        //reverberation: 0, // currently 0,
                        //pitchWheelSensitivity: 2, // currently 2,
                        //velocityPitchSensitivity: 0, // currently 0,
                        keyboardOrnamentsArrayIndex: 1// currently 0
                    },
                    {
                        channel: 1,
                        bankIndex: 0, // currently 3,
                        //presetIndex: 0, //currently 0 (is set by bank),
                        //mixtureIndex: 0, //currently 0 (is set by bank),
                        tuningGroupIndex: 0,// currently 3,
                        tuningIndex: 0, //currently 0 (is set by tuningGroupIndex),
                        semitonesOffset: 0, //currently -2,
                        centsOffset: 0, // currently 10,
                        //pitchWheel: 64, // currently 64,
                        //modWheel: 0, // currently  0,
                        //volume: 100, // currently  100,
                        //pan: 64, // currently  64,
                        //reverberation: 0, // currently  0,
                        //pitchWheelSensitivity: 2, // currently  2,
                        //velocityPitchSensitivity: 0, // currently 0,
                        keyboardOrnamentsArrayIndex: 0 // currently  1
                    }
                    //{ No change in channel 2, so this entry is omitted altogether
                    //    channel: 2,
                    //    bankIndex: 1, // currently 1,
                    //    presetIndex: 0, // currently 0,
                    //    mixtureIndex: 0, // currently 0,
                    //    tuningGroupIndex: 0, // currently 0,
                    //    tuningIndex: 2, // currently 2,
                    //    semitonesOffset: 0, // currently  0,
                    //    centsOffset: 50,// currently  50,
                    //    pitchWheel: 64,// currently 64,
                    //    modWheel: 0,// currently  0,
                    //    volume: 100,// currently  100,
                    //    pan: 64,// currently  64,
                    //    reverberation: 0, // currently  0,
                    //    pitchWheelSensitivity: 2, // currently  2,
                    //    velocityPitchSensitivity: 0, // currently  0,
                    //    keyboardOrnamentsArrayIndex: 2 // currently  2
                    //},
                    //{ No change in channel 3, so this entry is omitted altogether
                    //{
                    //    bankIndex: 3, // currently 3,
                    //    presetIndex: 3, // currently 3,
                    //    mixtureIndex: 0,               // currently 0,
                    //    tuningGroupIndex: 0,           // currently 0,
                    //    tuningIndex: 0,                // currently 0,
                    //    semitonesOffset: 0,            // currently 0,
                    //    centsOffset: -50,              // currently -50,
                    //    pitchWheel: 64,                // currently 64,
                    //    modWheel: 0,                   // currently 0,
                    //    volume: 100,                   // currently 100,
                    //    pan: 20,                       // currently 20,
                    //    reverberation: 0,              // currently 0,
                    //    pitchWheelSensitivity: 2,      // currently 2,
                    //    velocityPitchSensitivity: 0,   // currently 0,
                    //    keyboardOrnamentsArrayIndex: 3 // currently 3
                    //} // add a comma here if there are more channel settings
                ]
        } // add a comma here if there are more synth settings
    ];
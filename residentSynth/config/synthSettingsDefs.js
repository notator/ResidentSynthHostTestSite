console.log('load synthSettingsDefs.js');

// This file can be omitted by applications that don't use custom settings.
// It defines the `ResSynth.synthSettingsDefs` array, containing the definitions of settings
// for the _ResidentSynth_ that can be used to override the default channel settings which are
// otherwise set in the synth's 16 channels.
// On loading, the _ResidentSynth_ creates an internal list of alternative settings.
// The first alternative(at index 0) always contains the channel default settings in all 16 channels.
// Subsequent alternatives are defined in the`ResSynth.synthSettingsDefs` array.
// The first setting to be defined in the`ResSynth.synthSettingsDefs` array is therefore at index 1
// in the internal list.
//
// The(non-standard MIDI) SET_SYNTH_SETTINGS message sets all 16 channels in the _ResidentSynth_
// by sending the index of the synthSettings in the internal list.
//
// The *synthSettings* attributes are as follows: 
//   `name` -- an arbitrary, descriptive string(default: "default synth settings")
//   `keyboardSplitIndex` -- the index(default: 0) in the synth's internal array of alternative 
//       keyboard splits(see keyboardSplitDefs).This `keyboardSplitIndex` value always
//       overrides the corresponding value in the individual channel settings. 
//   `channelSettings` -- an array of up to 16 channelSettings objects.These are allocated, 
//       in order, to the _ResidentSynth_'s channels, beginning at channel 0. 
//       Channels that don't exist in a *synthSettings* definition are given the default channel
//       settings. 
//
// The *channelSettings* attributes are as follows: 
//     `name` // an arbitrary descriptive string (default is "default channel settings")
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
//     `keyboardSplitIndex` // integer 0..n (default: 0), where n is the number of keyboardSplitDefs 
//         defined in keyboardSplitDefs.js
//     `keyboardOrnamentsArrayIndex` // integer 0..n (default: 0), where n is the number of 
//         ornamentPerKeysStrings defined in ornamentDefs.js
// * integerInputs: // The values of the _ResidentSynthHost_'s numerical input controls. 
//     `semitonesOffset` // -64..+63 (default: 0) 
//     `centsOffset` // -50..+50 (default: 0) 
//     `triggerKey` // 0..127 (default: 36) -- not used by the _ResidentSynth_. 
// * sliders: // The values of the _ResidentSynthHost_'s command and control sliders. 
//     `pitchWheel` // 0..127 (default 64) (The value is used for both MSB and LSB) 
//     `modWheel` // 0..127 (default: 0) 
//     `volume` // 0..127 (default: 100) 
//     `pan` // 0..127 (default: 64) 
//     `reverberation` // 0..127 (default: 0) 
//     `pitchWheelSensitivity` // 0..127 (default: 2) 
//     `velocityPitchSensitivity` // 0.0..127 (default: 0) 
ResSynth.synthSettingsDefs =
[
     { // index 1 in SET_SYNTH_SETTINGS message
         // N.B. The .keyboardSplitIndex will be copied to each channel's channelSettings internally.
         // It IS ALWAYS the same in all channelSettings in a synthSetting!
         // Any keyboardSplitIndex set here in the individual channelSettings will be ignored.
         "name": "settings 1 (keyboardSplitIndex 0)",
         "keyboardSplitIndex": 0, // this is the default setting when this file does not exist or is empty.
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
                 "name": "channel 1: font=Study 2, semitonesOffset=-1.9",
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
     },
     {
         // index 2 in SET_SYNTH_SETTINGS message
         "name": "settings 2 (keyboardSplitIndex 3)", // simply interchanges the settings for channels 0 and 1 in settings 1
         "keyboardSplitIndex": 3,
         "channelSettings":
         [
             {
                 "name": "channel 0: font=Study 2, semitonesOffset=-1.9",
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
                 "name": "channel 1: (=defaults)", // this channelSettings contains the default channelSettings
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
console.log('load synthSettingsDefs.js');

// This file can be omitted by applications that don't use custom settings.
// It defines the `ResSynth.synthSettingsDefs` array, containing the definitions of settings
// for the _ResidentSynth_ that can be used to override the default channel settings which are
// otherwise set in the synth's 16 channels.
// Channels that never change their default settings are omitted in these definitions, but set
// to their default settings in/by the host (which always provides 16 well-defined channels).
//
// On loading, the residentSynth converts the information in this file into its (externally visible)
// synthSettingsArray. This contains only the _changes_ of attributes described in this file, in
// the order they will appear in the host's settingsSelect control.
//
// (The host stores the residentSynth.synthSettingsArray in its settingsSelect control, and manages
// the messages needing to be sent to the synth, depending on whether the control is set manually or
// by using the currently defined trigger key.)
//
// In this file, the following synthSettingsDefs attributes are arrays containing values in the order
// they will be set in the host's settingsSelect control (each array entry provides a value for
// one option in the settingsSelect control):
//   `names` // arbitrary, descriptive strings (default: "default synth settings")
//   `keyboardSplitIndexes` // values in range 0..n, default 0, where n is the number of keyboardSplitDefs defined in keyboardSplitDefs.js
//   `triggerKeys` // values in range 0..127, default 0 -- used by the host, not by the _ResidentSynth_.
//
// The `channelSettingsArray` is an array of up to 16 channelSettings, in order of channel.
// Channels that never change their (default) state are omitted.
// (The host sets  all 16 channels to their default values, before applying these channelSettings.)
//
// Each object in the channelSettingsArray contains attributes that are arrays containing values in the order they will be
//  set in/by the host's settingsSelect control (each array entry provides an attribute value for one option in the settingsSelect control):
//
// The arrays are all of the same length (the length of the above `names` array), and contain integer values as follows:
//     `bankIndex`        // 0..n-1, default 0, where n is the number of banks defined in webAudioFontDef.js
//     `presetIndex`      // 0..n-1, default 0, where n is the number of presets defined in the bank defined in webAudioFontDef.js
//     `mixtureIndex`     // 0..n, default 0, where n is the number of mixtures defined in mixtureDefs.js
//     `tuningGroupIndex` // 0..n, default 0, where n is the number of tuningGroups defined in tuningDefs.js
//     `tuningIndex`      // 0..n, default 0, where n is the number of tunings in the group defined in tuningDefs.js
//     `semitonesOffset`  // -64..+63, default 0
//     `centsOffset`      // -50..+50, default 0
//     `pitchWheel`       // 0..127, default 64 (The value is used for both MSB and LSB)
//     `modWheel`         // 0..127, default 0
//     `volume`           // 0..127, default 100
//     `pan`              // 0..127, default 64
//     `reverberation`    // 0..127, default 0
//     `pitchWheelSensitivity`    // 0..127, default 2
//     `velocityPitchSensitivity` // 0..127, default 0
//     `keyboardOrnamentsArrayIndex` // 0..n, default 0, where n is the number of ornamentPerKeysStrings defined in ornamentDefs.js
//
// The residentSynth checks all the given values for plausibility while converting the information to its externally visible synthSettingsArray.
// If there is an error, the synth alerts the user with a meaningful error message (and throws an exception). 

var ResSynth = ResSynth || {};

ResSynth.synthSettingsDefs =
{
    names:
        [
            "settings 0 (default settings in all channels)",
            "settings 1 (ch0 font, ch1 fontTuningOrnaments, ch2 fontTuningOrnaments, ch3 font tuning)",
            "settings 2 (ch0 and ch1 changes)"
        ],
    keyboardSplitIndexes: [0, 0, 3], // 0..(keyboardSplitDefs.length - 1), default 0
    triggerKeys: [36, 36, 36],       // 0..127, default 0
    channelSettingsArray:
        [
            {    // channel 0
                bankIndex: [0, 1, 3],                  // 0..(webAudioFontDef.length - 1), default 0
                presetIndex: [0, 0, 0],                // 0..(nPresets in Bank - 1), default 0
                mixtureIndex: [0, 0, 0],               // 0..(mixtureDefs.length - 1), default 0
                tuningGroupIndex: [0, 0, 3],           // 0..(tuningDefs.length - 1), default 0
                tuningIndex: [0, 0, 0],                // 0..(nTunings in TuningsGroup - 1), default 0
                semitonesOffset: [0, 0, -2],           // -64..+63, default: 0
                centsOffset: [0, 0, 10],               // -50..+50, default: 0
                pitchWheel: [64, 64, 64],              // 0..127, default 64
                modWheel: [0, 0, 0],                   // 0..127, default 0
                volume: [100, 100, 100],               // 0..127, default 100
                pan: [64, 64, 64],                     // 0..127, default 64
                reverberation: [0, 0, 0],              // 0..127, default 0
                pitchWheelSensitivity: [2, 2, 2],      // 0..127, default 2
                velocityPitchSensitivity: [0, 0, 0],   // 0..127, default 0
                keyboardOrnamentsArrayIndex: [0, 0, 1] // 0..(ornamentDefs.length - 1), default 0
     
            },
            {    // channel 1
                bankIndex: [0, 3, 0],                  // 0..(webAudioFontDef.length - 1), default 0
                presetIndex: [0, 0, 0],                // 0..(nPresets in Bank - 1), default 0
                mixtureIndex: [0, 0, 0],               // 0..(mixtureDefs.length - 1), default 0
                tuningGroupIndex: [0, 3, 0],           // 0..(tuningDefs.length - 1), default 0
                tuningIndex: [0, 0, 0],                // 0..(nTunings in TuningsGroup - 1), default 0
                semitonesOffset: [0, -2, 0],           // -64..+63, default 0
                centsOffset: [0, 10, 0],               // -50..+50, default 0
                pitchWheel: [64, 64, 64],              // 0..127, default 64
                modWheel: [0, 0, 0],                   // 0..127, default 0
                volume: [100, 100, 100],               // 0..127, default 100
                pan: [64, 64, 64],                     // 0..127, default 64
                reverberation: [0, 0, 0],              // 0..127, default 0
                pitchWheelSensitivity: [2, 2, 2],      // 0..127, default 2
                velocityPitchSensitivity: [0, 0, 0],   // 0..127, default 0
                keyboardOrnamentsArrayIndex: [0, 1, 0] // 0..(ornamentDefs.length - 1), default 0
            },
            {   // channel 2 (no change between settings 1 and 2)
                bankIndex: [0, 1, 1],                  // 0..(webAudioFontDef.length - 1), default 0
                presetIndex: [0, 0, 0],                // 0..(nPresets in Bank - 1), default 0
                mixtureIndex: [0, 0, 0],               // 0..(mixtureDefs.length - 1), default 0
                tuningGroupIndex: [0, 0, 0],           // 0..(tuningDefs.length - 1), default 0
                tuningIndex: [0, 2, 2],                // 0..(nTunings in TuningsGroup - 1), default 0
                semitonesOffset: [0, 0, 0],            // -64..+63, default 0
                centsOffset: [0, 50, 50],              // -50..+50, default 0
                pitchWheel: [64, 64, 64],              // 0..127, default 64
                modWheel: [0, 0, 0],                   // 0..127, default 0
                volume: [100, 100, 100],               // 0..127, default 100
                pan: [64, 64, 64],                     // 0..127, default 64
                reverberation: [0, 0, 0],              // 0..127, default 0
                pitchWheelSensitivity: [2, 2, 2],      // 0..127, default 2
                velocityPitchSensitivity: [0, 0, 0],   // 0..127, default 0
                keyboardOrnamentsArrayIndex: [0, 2, 2] // 0..(ornamentDefs.length - 1), default 0   
            },
            {   // channel 3  (no change between settings 1 and 2)
                bankIndex: [0, 3, 3],                  // 0..(webAudioFontDef.length - 1), default 0
                presetIndex: [0, 3, 3],                // 0..(nPresets in Bank - 1), default 0
                mixtureIndex: [0, 0, 0],               // 0..(mixtureDefs.length - 1), default 0
                tuningGroupIndex: [0, 0, 0],           // 0..(tuningDefs.length - 1), default 0
                tuningIndex: [0, 0, 0],                // 0..(nTunings in TuningsGroup - 1), default 0
                semitonesOffset: [0, 0, 0],            // -64..+63, default 0
                centsOffset: [0, -50, -50],            // -50..+50, default 0
                pitchWheel: [64, 64, 64],              // 0..127, default 64
                modWheel: [0, 0, 0],                   // 0..127, default 0
                volume: [100, 100, 100],               // 0..127, default 100
                pan: [64, 20, 20],                     // 0..127, default 64
                reverberation: [0, 0, 0],              // 0..127, default 0
                pitchWheelSensitivity: [2, 2, 2],      // 0..127, default 2
                velocityPitchSensitivity: [0, 0, 0],   // 0..127, default 0
                keyboardOrnamentsArrayIndex: [0, 3, 3] // 0..(ornamentDefs.length - 1), default 0 
            }
            // add a comma here if there are more channel settings
        ]
};
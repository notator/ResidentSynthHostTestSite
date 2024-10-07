console.log('load synthSettingsDefs.js');

// The `ResSynth.synthSettingsDefs` array, defines preset settings for the residentSynth, that
// will be used in the host's settingsSelect control.
//
// _comment attributes at the top and bottom levels in this file are completely ignored when
// it is loaded into the host, so they can be freely added, removed and edited.
// Similar _comment attributes are created automatically in exported settings when the host's
// exportSettingsButtonInput is clicked.
//
// The lowest level arrays in this synthSettingsDefs definition contain one value per preset
// setting, in the order the preset settings will appear in the settingsSelect control.
// On loading, the host converts the information into a _synthSettingsArray_, containing
// the preset settings in the order they will appear in the host's settingsSelect control.
// The _synthSettingsArray_ contains only the _changes_ of attributes necessary when the
// settingsSelect's options are selected in sequence, starting from the default state.
//
// The settingsSelect implements both sequential selection, using the <space> key on the
// QUERTY keyboard, and random selection using either keys on the QUERTY keyboard or the
// settingsSelect control itself:
//   <space> increments/rotates the settingsSelect.selectedIndex, 
//   The '0'..'9' keys select settingIndex (key-1) respectively, (key '1' selects the first setting, 
//       incrementing / rotating if out of range).
//   The 'a'..'z' keys select settingIndex 10..35 respectively(incrementing / rotating if out of range).
//
// The following top-level synthSettingsDefs attributes are arrays containing one value
// per preset setting:
//   `name` // an arbitrary, descriptive string that will be used in the settingSelect GUI.
//   `keyboardSplitIndex` // the index of the keyboardSplitDef. In range 0..n, default 0,
//        where n is the number of keyboardSplitDefs defined in keyboardSplitDefs.js
//
// The `channelSettingsArray` is an array of up to 16 objects, one object per channel, in order
// of channel. Channels that never change their (default) state are omitted here, but set to
// their default settings by the host (which always provides 16 well-defined channels).
//
// Each object in the `channelSettingsArray` contains attributes that are arrays containing one
// value per presetSetting. These values are checked for plausibility using the residentSynth's
// configuration files webAudioFontDef.js, mixtureDefs.js, tuningDefs.js and ornamentDefs.js.
// These files are located in residentSynth/config.
// If plausibility checking fails, the user is alerted with a meaningful error message (and an
// exception is thrown).
// The (non-_comment) array attributes in the channel objects contain values as follows (all integers):
//     `bankIndex`        // 0..n-1, default 0, where n is the number of banks defined in webAudioFontDef.js
//     `presetIndex`      // 0..n-1, default 0, where n is the number of presets defined in the current bank
//     `mixtureIndex`     // 0..n, default 0, where n is the number of mixtures defined in mixtureDefs.js
//     `tuningGroupIndex` // 0..n, default 0, where n is the number of tuningGroups defined in tuningDefs.js
//     `tuningIndex`      // 0..n, default 0, where n is the number of tunings in the current tuningGroup
//     `semitonesOffset`  // -64..+63, default 0
//     `centsOffset`      // -50..+50, default 0
//     `pitchWheel`       // 0..127, default 64 (The value is used for both MSB and LSB)
//     `modWheel`         // 0..127, default 0
//     `volume`           // 0..127, default 100
//     `expression`       // 0..127, default 100
//     `pan`              // 0..127, default 64
//     `reverberation`    // 0..127, default 0
//     `pitchWheelSensitivity`    // 0..127, default 2
//     `velocityPitchSensitivity` // 0..127, default 0
//     `keyboardOrnamentsArrayIndex` // 0..n-1, default 0, where n is the number of ornamentPerKeysStrings defined in ornamentDefs.js

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
    _comment: "Channels 4..15 are always set to the default settings.",
    channelSettingsArray:
        [
            {
                _comment : "channel 0",
                bankIndex: [0, 1, 3],                  // 0..(webAudioFontDef.length - 1), default 0
                presetIndex: [0, 0, 0],                // 0..(nPresets in bank - 1), default 0
                mixtureIndex: [0, 0, 0],               // 0..(mixtureDefs.length - 1), default 0
                tuningGroupIndex: [0, 0, 3],           // 0..(tuningDefs.length - 1), default 0
                tuningIndex: [0, 0, 0],                // 0..(nTunings in tuningGroup - 1), default 0
                semitonesOffset: [0, 0, -2],           // -64..+63, default: 0
                centsOffset: [0, 0, 10],               // -50..+50, default: 0
                pitchWheel: [64, 64, 64],              // 0..127, default 64
                modWheel: [0, 0, 0],                   // 0..127, default 0
                volume: [100, 100, 100],               // 0..127, default 100
                expression: [100, 100, 100],           // 0..127, default 100
                pan: [64, 64, 64],                     // 0..127, default 64
                reverberation: [0, 0, 0],              // 0..127, default 0
                pitchWheelSensitivity: [2, 2, 2],      // 0..127, default 2
                velocityPitchSensitivity: [0, 0, 0],   // 0..127, default 0
                keyboardOrnamentsArrayIndex: [0, 0, 1] // 0..(ornamentDefs.length - 1), default 0
     
            },
            {
                _comment: "channel 1",
                bankIndex: [0, 3, 0],                  // 0..(webAudioFontDef.length - 1), default 0
                presetIndex: [0, 0, 0],                // 0..(nPresets in bank - 1), default 0
                mixtureIndex: [0, 0, 0],               // 0..(mixtureDefs.length - 1), default 0
                tuningGroupIndex: [0, 3, 0],           // 0..(tuningDefs.length - 1), default 0
                tuningIndex: [0, 0, 0],                // 0..(nTunings in tuningGroup - 1), default 0
                semitonesOffset: [0, -2, 0],           // -64..+63, default 0
                centsOffset: [0, 10, 0],               // -50..+50, default 0
                pitchWheel: [64, 64, 64],              // 0..127, default 64
                modWheel: [0, 0, 0],                   // 0..127, default 0
                volume: [100, 100, 100],               // 0..127, default 100
                expression: [100, 100, 100],           // 0..127, default 100
                pan: [64, 64, 64],                     // 0..127, default 64
                reverberation: [0, 0, 0],              // 0..127, default 0
                pitchWheelSensitivity: [2, 2, 2],      // 0..127, default 2
                velocityPitchSensitivity: [0, 0, 0],   // 0..127, default 0
                keyboardOrnamentsArrayIndex: [0, 1, 0] // 0..(ornamentDefs.length - 1), default 0
            },
            {
                _comment: "channel 2 (no change between settings 1 and 2)",
                bankIndex: [0, 1, 1],                  // 0..(webAudioFontDef.length - 1), default 0
                presetIndex: [0, 0, 0],                // 0..(nPresets in bank - 1), default 0
                mixtureIndex: [0, 0, 0],               // 0..(mixtureDefs.length - 1), default 0
                tuningGroupIndex: [0, 0, 0],           // 0..(tuningDefs.length - 1), default 0
                tuningIndex: [0, 2, 2],                // 0..(nTunings in tuningGroup - 1), default 0
                semitonesOffset: [0, 0, 0],            // -64..+63, default 0
                centsOffset: [0, 50, 50],              // -50..+50, default 0
                pitchWheel: [64, 64, 64],              // 0..127, default 64
                modWheel: [0, 0, 0],                   // 0..127, default 0
                volume: [100, 100, 100],               // 0..127, default 100
                expression: [100, 100, 100],           // 0..127, default 100
                pan: [64, 64, 64],                     // 0..127, default 64
                reverberation: [0, 0, 0],              // 0..127, default 0
                pitchWheelSensitivity: [2, 2, 2],      // 0..127, default 2
                velocityPitchSensitivity: [0, 0, 0],   // 0..127, default 0
                keyboardOrnamentsArrayIndex: [0, 2, 2] // 0..(ornamentDefs.length - 1), default 0   
            },
            {     
                _comment: "channel 3 (no change between settings 1 and 2)",
                bankIndex: [0, 3, 3],                  // 0..(webAudioFontDef.length - 1), default 0
                presetIndex: [0, 3, 3],                // 0..(nPresets in bank - 1), default 0
                mixtureIndex: [0, 0, 0],               // 0..(mixtureDefs.length - 1), default 0
                tuningGroupIndex: [0, 0, 0],           // 0..(tuningDefs.length - 1), default 0
                tuningIndex: [0, 0, 0],                // 0..(nTunings in tuningGroup - 1), default 0
                semitonesOffset: [0, 0, 0],            // -64..+63, default 0
                centsOffset: [0, -50, -50],            // -50..+50, default 0
                pitchWheel: [64, 64, 64],              // 0..127, default 64
                modWheel: [0, 0, 0],                   // 0..127, default 0
                volume: [100, 100, 100],               // 0..127, default 100
                expression: [100, 100, 100],           // 0..127, default 100
                pan: [64, 20, 20],                     // 0..127, default 64
                reverberation: [0, 0, 0],              // 0..127, default 0
                pitchWheelSensitivity: [2, 2, 2],      // 0..127, default 2
                velocityPitchSensitivity: [0, 0, 0],   // 0..127, default 0
                keyboardOrnamentsArrayIndex: [0, 3, 3] // 0..(ornamentDefs.length - 1), default 0 
            }
            // add a comma here if there are more channel settings
        ]
};
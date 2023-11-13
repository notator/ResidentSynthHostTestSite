console.log('load webAudioFontDef.js');

// This webAudioFontDef contains an array of banks containing the instrument presets.
// Each bank should be given a descriptive name.
// Presets are given names automatically, using their source and General MIDI name.
// (The sources used here are either FluidR3 or GeneralUserGS. The GeneralMIDI name is found
// using the original presetIndex -- the number part of Surikov's file name.)
// The MIDI BANK control message sets the current bank using its index in this array.
// The MIDI PRESET command message will set the preset using the index in the bank's presets array.

var ResSynth = ResSynth || {};

ResSynth.webAudioFontDef =
    [
        {
            name: "Ensemble 1 (FluidR3 selection)",
            presets:
                [
                    "_tone_0160_FluidR3_GM_sf2_file",     // instr: 0, drawbarOrgan -- old presetIndex:16
                    "_tone_0580_FluidR3_GM_sf2_file",     // instr: 1, tuba         -- old presetIndex:58
                    "_tone_0080_FluidR3_GM_sf2_file",     // instr: 2, celesta      -- old presetIndex:8 
                    "_tone_0460_FluidR3_GM_sf2_file",     // instr: 3, harp         -- old presetIndex:46
                    "_tone_0130_FluidR3_GM_sf2_file",     // instr: 4, xylophone    -- old presetIndex:13
                    "_tone_0730_FluidR3_GM_sf2_file",     // instr: 5, flute        -- old presetIndex:73
                    "percussion (FluidR3 metal and wood)" // instr: 6, percussion preset defined below -- old presetIndex:126,
                ]
        },
        {
            name: "Ensemble 2 (FluidR3 selection)",
            presets:
                [
                    "_tone_0460_FluidR3_GM_sf2_file", // instr: 0, harp    -- old presetIndex:46, 
                    "_tone_0530_FluidR3_GM_sf2_file", // instr: 1, oohs    -- old presetIndex:53, 
                    "_tone_0580_FluidR3_GM_sf2_file", // instr: 2, tuba    -- old presetIndex:58, 
                    "_tone_0790_FluidR3_GM_sf2_file", // instr: 3, ocarina -- old presetIndex:79, 
                    "_tone_0890_FluidR3_GM_sf2_file", // instr: 4, pad 2   -- old presetIndex:89, 
                    "_tone_0920_FluidR3_GM_sf2_file", // instr: 5, pad 5   -- old presetIndex:92, 
                    "_tone_0930_FluidR3_GM_sf2_file", // instr: 6, pad 6   -- old presetIndex:93, 
                    "_tone_0950_FluidR3_GM_sf2_file"  // instr: 7, pad 8   -- old presetIndex:95, 
                ]
        },
        {
            name: "Wind instruments (FluidR3)",
            presets:
                [
                    "_tone_0600_FluidR3_GM_sf2_file", // instr: 0, horn      -- old presetIndex:60, 
                    "_tone_0660_FluidR3_GM_sf2_file", // instr: 1, tenor sax -- old presetIndex:66, 
                    "_tone_0680_FluidR3_GM_sf2_file", // instr: 2, oboe      -- old presetIndex:68, 
                    "_tone_0700_FluidR3_GM_sf2_file", // instr: 3, bassoon   -- old presetIndex:70, 
                    "_tone_0710_FluidR3_GM_sf2_file", // instr: 4, clarinet  -- old presetIndex:71, 
                    "_tone_0730_FluidR3_GM_sf2_file"  // instr: 5, flute     -- old presetIndex:73, 
                ]
        },
        {
            name: "Study 2 (FluidR3)",
            presets:
                [
                    "_tone_0080_FluidR3_GM_sf2_file", // instr: 0,  celesta      -- old presetIndex:8,  
                    "_tone_0090_FluidR3_GM_sf2_file", // instr: 1,  glockenspiel -- old presetIndex:9,  
                    "_tone_0100_FluidR3_GM_sf2_file", // instr: 2,  musicBox     -- old presetIndex:10, 
                    "_tone_0110_FluidR3_GM_sf2_file", // instr: 3,  vibraphone   -- old presetIndex:11, 
                    "_tone_0120_FluidR3_GM_sf2_file", // instr: 4,  marimba      -- old presetIndex:12, 
                    "_tone_0130_FluidR3_GM_sf2_file", // instr: 5,  xylophone    -- old presetIndex:13, 
                    "_tone_0140_FluidR3_GM_sf2_file", // instr: 6,  tubularBells -- old presetIndex:14, 
                    "_tone_0150_FluidR3_GM_sf2_file", // instr: 7,  dulcimer     -- old presetIndex:15, 
                    "_tone_0240_FluidR3_GM_sf2_file", // instr: 8,  nylonGuitar  -- old presetIndex:24, 
                    "_tone_0250_FluidR3_GM_sf2_file", // instr: 9,  steelGuitar  -- old presetIndex:25, 
                    "_tone_0260_FluidR3_GM_sf2_file", // instr: 10, electricGuitarJazz  -- old presetIndex:26, 
                    "_tone_0270_FluidR3_GM_sf2_file"  // instr: 11, electricGuitarClean -- old presetIndex:27, 
                ]
        },
        {
            name: "ensemble (FluidR3 and GeneralUserGS)",
            presets:
                [
                    "_tone_0080_FluidR3_GM_sf2_file",     // instr: 0,  celesta      -- old presetIndex:8,  
                    "_tone_0090_FluidR3_GM_sf2_file",     // instr: 1,  glockenspiel -- old presetIndex:9,  
                    "_tone_0100_FluidR3_GM_sf2_file",     // instr: 2,  musicBox     -- old presetIndex:10, 
                    "_tone_0110_FluidR3_GM_sf2_file",     // instr: 3,  vibraphone   -- old presetIndex:11, 
                    "_tone_0120_FluidR3_GM_sf2_file",     // instr: 4,  marimba      -- old presetIndex:12, 
                    "_tone_0130_FluidR3_GM_sf2_file",     // instr: 5,  xylophone    -- old presetIndex:13, 
                    "_tone_0140_FluidR3_GM_sf2_file",     // instr: 6,  tubularBells -- old presetIndex:14, 
                    "_tone_0150_FluidR3_GM_sf2_file",     // instr: 7,  dulcimer     -- old presetIndex:15, 
                    "_tone_0160_FluidR3_GM_sf2_file",     // instr: 8,  drawbarOrgan -- old presetIndex:16, 
                    "_tone_0240_FluidR3_GM_sf2_file",     // instr: 9,  nylonGuitar  -- old presetIndex:24, 
                    "_tone_0250_FluidR3_GM_sf2_file",     // instr: 10, steelGuitar  -- old presetIndex:25, 
                    "_tone_0260_FluidR3_GM_sf2_file",     // instr: 11, electricGuitarJazz  -- old presetIndex:26, 
                    "_tone_0270_FluidR3_GM_sf2_file",     // instr: 12, electricGuitarClean -- old presetIndex:27, 
                    "_tone_0460_FluidR3_GM_sf2_file",     // instr: 13, harp         -- old presetIndex:46, 
                    "percussion (FluidR3 metal and wood)",// instr: 14, percussion preset defined below -- old presetIndex:126,
                    "percussion (FluidR3 drums)",	      // instr: 15, percussion preset defined below -- old presetIndex:127,
                    "_tone_0080_GeneralUserGS_sf2_file",  // instr: 16, celesta      -- old presetIndex:8,  
                    "_tone_0090_GeneralUserGS_sf2_file",  // instr: 17, glockenspiel -- old presetIndex:9,  
                    "_tone_0100_GeneralUserGS_sf2_file",  // instr: 18, musicBox     -- old presetIndex:10, 
                    "_tone_0110_GeneralUserGS_sf2_file",  // instr: 19, vibraphone   -- old presetIndex:11, 
                    "_tone_0120_GeneralUserGS_sf2_file",  // instr: 20, marimba      -- old presetIndex:12, 
                    "_tone_0130_GeneralUserGS_sf2_file",  // instr: 21, xylophone    -- old presetIndex:13, 
                    "_tone_0140_GeneralUserGS_sf2_file",  // instr: 22, tubularBells -- old presetIndex:14, 
                    "_tone_0160_GeneralUserGS_sf2_file",  // instr: 23, drawbarOrgan -- old presetIndex:16, 
                    "percussion (FluidR3 drums)"		  // instr: 24, percussion preset defined below -- old presetIndex:127,
                ]
        },
        {
            name: "keyboards (FluidR3 and GeneralUserGS)",
            presets:
                [
                    "_tone_0000_FluidR3_GM_sf2_file",    // instr: 0, piano        -- old presetIndex:0, 
                    "_tone_0060_FluidR3_GM_sf2_file",    // instr: 1, harpsichord  -- old presetIndex:6, 
                    "_tone_0080_FluidR3_GM_sf2_file",    // instr: 2, celesta      -- old presetIndex:8, 
                    "_tone_0160_FluidR3_GM_sf2_file",    // instr: 3, drawbarOrgan -- old presetIndex:16,
                    "_tone_0000_GeneralUserGS_sf2_file", // instr: 4, piano        -- old presetIndex:0, 
                    "_tone_0060_GeneralUserGS_sf2_file", // instr: 5, harpsichord  -- old presetIndex:6, 
                    "_tone_0080_GeneralUserGS_sf2_file", // instr: 6, celesta      -- old presetIndex:8, 
                    "_tone_0160_GeneralUserGS_sf2_file"  // instr: 7, drawbarOrgan -- old presetIndex:16,
                ]
        },
        {
            name: "Grand Pianos (FluidR3 and GeneralUserGS)",
            presets:
                [
                    "_tone_0000_FluidR3_GM_sf2_file",	// instr: 0, piano -- old presetIndex:0 
                    "_tone_0000_GeneralUserGS_sf2_file" // instr: 1, piano -- old presetIndex:0 
                ]
        },
        {
            name: "Grand Piano (FluidR3)",
            presets:
                [
                    "_tone_0000_FluidR3_GM_sf2_file"	// instr: 0, piano -- old presetIndex:0
                ]
        }
    ];

// ResSynth.percussionPresets should only be defined if percussion presets are used in the above definitions.
//
// These percussion preset definitions are just examples. A General MIDI compatible implementation might have one
// definition containing all the presets from a particular source, with the preset assigned to channelIndex 9.
// Each percussionPreset is created after these files have been adjusted (=unpacked).
// The preset is given its defined .presetIndex attribute, and each zone's .midi attribute is set to the same value.
// It is an error for two sounds to be assigned to the same key in the same preset. Not all keys have to be assigned (as here).
ResSynth.percussionPresets =
    [
        {
            name: "percussion (FluidR3 metal and wood)",
            presetIndex: 126, // any index that is not otherwise used in the same bank
            keys:
                [
                    "_drum_56_0_FluidR3_GM_sf2_file", // keyIndex:56 Cowbell
                    "_drum_59_0_FluidR3_GM_sf2_file", // keyIndex:59 Ride Cymbal 2    
                    "_drum_70_0_FluidR3_GM_sf2_file", // keyIndex:70 Maracas 
                    "_drum_73_0_FluidR3_GM_sf2_file", // keyIndex:73 Short Guiro 
                    "_drum_74_0_FluidR3_GM_sf2_file", // keyIndex:74 Long Guiro
                    "_drum_75_0_FluidR3_GM_sf2_file", // keyIndex:75 Claves
                    "_drum_76_0_FluidR3_GM_sf2_file", // keyIndex:76 Hi Wood Block 
                    "_drum_77_0_FluidR3_GM_sf2_file", // keyIndex:77 Low Wood Block 
                    "_drum_81_0_FluidR3_GM_sf2_file"  // keyIndex:81 Open Triangle
                ]
        },
        {
            name: "percussion (FluidR3 drums)",
            presetIndex: 127, // any index that is not otherwise used in the same bank
            keys:
                [
                    "_drum_41_0_FluidR3_GM_sf2_file", // keyIndex:41 Low Floor Tom
                    "_drum_45_0_FluidR3_GM_sf2_file", // keyIndex:45 Low Tom
                    "_drum_48_0_FluidR3_GM_sf2_file", // keyIndex:48 Hi-Mid Tom
                    "_drum_60_0_FluidR3_GM_sf2_file", // keyIndex:60 Hi Bongo    
                    "_drum_61_0_FluidR3_GM_sf2_file", // keyIndex:61 Low Bongo   
                    "_drum_62_0_FluidR3_GM_sf2_file", // keyIndex:62 Mute Hi Conga
                    "_drum_63_0_FluidR3_GM_sf2_file"  // keyIndex:63 Open Hi Conga 
                ]
        }
    ];






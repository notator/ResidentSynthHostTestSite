/* Copyright 2020 James Ingram, Sergey Surikov
 * https://james-ingram-act-two.de/
 * https://github.com/surikov
 *  
 * This code has been developed from the code for my original ResidentSf2Synth:
 * https://github.com/notator/WebMIDISynthHost/residentSf2Synth/residentSf2Synth.js.
 * It uses both javascript preset files, cloned from
 * https://surikov.github.io/webaudiofontdata/sound/, and
 * other code that originated in the following repository:
 * https://github.com/surikov/webaudiofont
 * 
 * All the code in this project is covered by an MIT license.
 * https://github.com/surikov/webaudiofont/blob/master/LICENSE.md
 * https://github.com/notator/WebMIDISynthHost/blob/master/License.md
 */

ResSynth.residentSynth = (function(window)
{
    "use strict";
    let
        audioContext,
        channelPresets = [], // set in updateBankIndex
        channelAudioNodes = [], // initialized in synth.open
        channelControls = [], // initialized in synth.open
        mixtures = [], // initialized by getMixtures()
        channelPerKeyArrays = [], // initialized by setPrivateChannelPerKeyArrays(). This array has elements in range 0..15. Its length can be either 0 or 128.
        inKeyOrnamentDefsArrays = [], // initialized by setPrivateOrnamentPerKeyArrays(). This array may have undefined elements, and its length may be anything in range 0..128.
        tuningGroups = [],
        settingsPresets = [],

        // see: https://developer.chrome.com/blog/audiocontext-setsinkid/
        setAudioOutputDevice = async function(deviceId)
        {
            await audioContext.setSinkId(deviceId);
        },

        // Called by the constructor, which sets this.webAudioFont to the return value of this function.
        // Creates the WebAudioFont defined in "config/webAudioFontDef.js",
        // adjusting (=decoding) all the required WebAudioFontPresets.
        getWebAudioFont = function(audioContext)
        {
            function adjustAllPresetVariables()
            {
                // Adapted from code in Sergey Surikov's WebAudioFontLoader
                function decodeAfterLoading(audioContext, variableName)
                {
                    // ji: This function just waits until window[variableName] exists,
                    // i.e. until the variable has loaded.
                    function waitUntilLoaded(variableName, onLoaded)
                    {
                        if(window[variableName])
                        {
                            onLoaded();
                        }
                        else
                        {
                            setTimeout(function()
                            {
                                waitUntilLoaded(variableName, onLoaded);
                            }, 111);
                        }
                    }

                    // The presetName parameter has only been added for use in console.log when the preset adjustment is complete.
                    function adjustPreset(audioContext, preset, presetName)
                    {
                        // 13.01.2020, ji: Added presetName and isLastZone arguments for console.log code
                        function adjustZone(audioContext, zone, presetName, isLastZone)
                        {
                            function numValue(aValue, defValue)
                            {
                                if(typeof aValue === "number")
                                {
                                    return aValue;
                                } else
                                {
                                    return defValue;
                                }
                            }

                            // 13.01.2020 -- ji
                            // The original preset files used by the ResidentSynth all have a zone.file attribute
                            // but neither zone.buffer nor zone.sample attributes. I have therefore deleted the
                            // original (Surikov) code for coping with those cases.
                            // (This code creates and sets the zone.buffer attribute.)
                            if(zone.file)
                            {
                                // 27.02.2020 -- ji
                                // Added this nested condition since this code can now be revisited afer creating zone.buffer.
                                if(zone.buffer === undefined)
                                {
                                    // this code sets zone.buffer
                                    var datalen = zone.file.length;
                                    var arraybuffer = new ArrayBuffer(datalen);
                                    var view = new Uint8Array(arraybuffer);
                                    var decoded = atob(zone.file);
                                    var b;
                                    for(let i = 0; i < decoded.length; i++)
                                    {
                                        b = decoded.charCodeAt(i);
                                        view[i] = b;
                                    }
                                    // 12.01.2020, ji: Changed to Promise syntax.
                                    audioContext.decodeAudioData(arraybuffer).then(function(audioBuffer)
                                    {
                                        zone.buffer = audioBuffer;
                                        // 13.01.2020, ji: Added console.log code
                                        // 07.06.2023, ji: commented out
                                        //if(isLastZone === true)
                                        //{
                                        //	console.log("adjusted " + presetName);
                                        //}
                                    });
                                }
                            }
                            else // 13.01.2020 -- ji
                            {
                                throw "zone.file not found.";
                            }
                            // The value of zone.delay never changes in Surikov's code (as far as I can see).
                            // It is the duration between calling bufferNode.start(...) and the time at which the attack phase begins.
                            // For simplicity, it could be deleted.
                            zone.delay = 0;
                            zone.loopStart = numValue(zone.loopStart, 0);
                            zone.loopEnd = numValue(zone.loopEnd, 0);
                            zone.coarseTune = numValue(zone.coarseTune, 0);
                            zone.fineTune = numValue(zone.fineTune, 0);
                            zone.originalPitch = numValue(zone.originalPitch, 6000);
                            zone.sampleRate = numValue(zone.sampleRate, 44100);
                            // The zone.sustain attribute is defined but never used by Surikov (as far as I can see).
                            // zone.sustain = numValue(zone.originalPitch, 0);
                        }

                        for(let zoneIndex = 0; zoneIndex < preset.zones.length; zoneIndex++)
                        {
                            let isLastZone = (zoneIndex === (preset.zones.length - 1));
                            adjustZone(audioContext, preset.zones[zoneIndex], presetName, isLastZone);
                        }
                    }

                    waitUntilLoaded(variableName, function()
                    {
                        adjustPreset(audioContext, window[variableName], variableName);
                    });
                }

                let webAudioFontDef = ResSynth.webAudioFontDef;
                for(let i = 0; i < webAudioFontDef.length; i++)
                {
                    let presets = webAudioFontDef[i].presets;

                    for(var presetIndex = 0; presetIndex < presets.length; presetIndex++)
                    {
                        let name = presets[presetIndex];
                        if(name.includes("_tone_")) // "percussion" presets are decoded below.
                        {
                            decodeAfterLoading(audioContext, name);
                        }
                    }
                }

                if(ResSynth.percussionPresets !== undefined)
                {
                    let percussionPresets = ResSynth.percussionPresets;
                    for(let i = 0; i < percussionPresets.length; i++)
                    {
                        let presetKeys = percussionPresets[i].keys;
                        for(let j = 0; j < presetKeys.length; j++)
                        {
                            let variable = presetKeys[j];
                            decodeAfterLoading(audioContext, variable);
                        }
                    }
                }
            }

            // sets window[<percussionFontName>].zones
            //      each zone.midi to presetIndex
            function getPercussionPresets()
            {
                if(ResSynth.percussionPresets === undefined)
                {
                    return undefined;
                }
                else
                {
                    let percussionPresets = [];

                    for(var i = 0; i < ResSynth.percussionPresets.length; i++)
                    {
                        let zones = [];
                        let presetDef = ResSynth.percussionPresets[i];
                        for(var j = 0; j < presetDef.keys.length; j++)
                        {
                            let keyVariable = presetDef.keys[j],
                                keyZone = window[keyVariable].zones[0];

                            keyZone.midi = presetDef.presetIndex;
                            zones.push(keyZone);
                        }
                        percussionPresets.push({name: presetDef.name, zones: zones});
                    }
                    return percussionPresets;
                }
            }

            function getFinalizedPresets(fontPresetNames, percussionPresets)
            {
                function getPresetOptionName(presetName, originalPresetIndex, isPercussion)
                {
                    function getIndex(str, substr, ind)
                    {
                        let len = str.length, i = -1;
                        while(ind-- && i++ < len)
                        {
                            i = str.indexOf(substr, i);
                            if(i < 0) break;
                        }
                        return i;
                    }

                    let presetOptionName = "error: illegal presetVariable";

                    if(isPercussion === true)
                    {
                        presetOptionName = presetName;
                    }
                    else
                    {
                        let truncStart = getIndex(presetName, "_", 3) + 1,
                            truncEnd = getIndex(presetName, "_", 4);

                        if(truncStart > 0 && truncEnd > 0 && truncEnd > truncStart)
                        {
                            let soundFontSourceName = presetName.slice(truncStart, truncEnd),
                                gmName = ResSynth.constants.generalMIDIPresetName(originalPresetIndex);

                            presetOptionName = gmName + " (" + soundFontSourceName + ")";
                        }

                    }

                    return presetOptionName;
                }

                let fontPresets = [];

                for(var presetIndex = 0; presetIndex < fontPresetNames.length; presetIndex++)
                {
                    let isPercussion = false,
                        presetName = fontPresetNames[presetIndex],
                        zones;

                    if(window[presetName] === undefined)
                    {
                        if(percussionPresets !== undefined)
                        {
                            let percussionPreset = percussionPresets.find(element => element.name.localeCompare(presetName) === 0);
                            zones = percussionPreset.zones;
                            isPercussion = true;
                        }
                    }
                    else
                    {
                        zones = window[presetName].zones;
                    }
                    let originalPresetIndex = zones[0].midi,
                        presetOptionName = getPresetOptionName(presetName, originalPresetIndex, isPercussion);

                    fontPresets.push({name: presetOptionName, originalPresetIndex: originalPresetIndex, zones: zones, isPercussion: isPercussion});
                }

                return fontPresets;
            }

            function adjustForResidentSynth(webAudioFont)
            {
                function setZonesToMaximumRange(presetName, originalPresetIndex, zones)
                {
                    let bottomZone = zones[0],
                        topZone = zones[zones.length - 1],
                        expanded = false;

                    if(bottomZone.keyRangeLow !== 0)
                    {
                        bottomZone.keyRangeLow = 0;
                        expanded = true;
                    }
                    if(topZone.keyRangeHigh !== 127)
                    {
                        topZone.keyRangeHigh = 127;
                        expanded = true;
                    }

                    if(expanded)
                    {
                        let gmName = ResSynth.constants.generalMIDIPresetName(originalPresetIndex);
                        // console.warn("WAFSynth: extended the pitch range of preset " + presetName + " (" + gmName + ").");
                    }
                }

                function deleteZoneAHDSRs(zones)
                {
                    for(var i = 0; i < zones.length; i++)
                    {
                        if(! delete zones[i].ahdsr)
                        {
                            console.warn("Failed to delete preset.ahdsr.");
                        }
                    }
                }

                function setZoneVEnvData(presetName, originalPresetIndex, zones)
                {
                    // envTypes:
                    // 0: short envelope (e.g. drum, xylophone, percussion)
                    // 1: long envelope (e.g. piano)
                    // 2: unending envelope (e.g. wind preset, organ)
                    const PRESET_ENVTYPE = {SHORT: 0, LONG: 1, UNENDING: 2},
                        MAX_DURATION = 300000, // five minutes should be long enough...
                        DEFAULT_NOTEOFF_RELEASE_DURATION = 0.2;

                    function presetEnvType(isPercussion, originalPresetIndex)
                    {
                        const shortEnvs =
                            [13,
                                45, 47,
                                55,
                                112, 113, 114, 115, 116, 117, 118, 119,
                                120, 123, 127
                            ],
                            longEnvs = [
                                0, 1, 2, 3, 4, 5, 6, 7,
                                8, 9, 10, 11, 12, 14, 15,
                                24, 25, 26, 27, 28, 29, 30, 31,
                                46,
                                32, 33, 34, 35, 36, 37, 38, 39,
                                104, 105, 106, 107, 108, 109, 110, 111
                            ],
                            unendingEnvs = [
                                16, 17, 18, 19, 20, 21, 22, 23,
                                40, 41, 42, 43, 44,
                                48, 49, 50, 51, 52, 53, 54,
                                56, 57, 58, 59, 60, 61, 62, 63,
                                64, 65, 66, 67, 68, 69, 70, 71,
                                72, 73, 74, 75, 76, 77, 78, 79,
                                80, 81, 82, 83, 84, 85, 86, 87,
                                88, 89, 90, 91, 92, 93, 94, 95,
                                96, 97, 98, 99, 100, 101, 102, 103,
                                121, 122, 124, 125, 126
                            ];

                        if(isPercussion)
                        {
                            return PRESET_ENVTYPE.SHORT;
                        }
                        else if(shortEnvs.indexOf(originalPresetIndex) >= 0)
                        {
                            return PRESET_ENVTYPE.SHORT;
                        }
                        else if(longEnvs.indexOf(originalPresetIndex) >= 0)
                        {
                            return PRESET_ENVTYPE.LONG;
                        }
                        else if(unendingEnvs.indexOf(originalPresetIndex) >= 0)
                        {
                            return PRESET_ENVTYPE.UNENDING;
                        }
                        else
                        {
                            throw "presetIndex not found.";
                        }
                    }

                    function checkDurations(envData)
                    {
                        // The following restrictions apply because setTimeout(..) uses a millisecond delay parameter:
                        // ((envData.envelopeDuration * 1000) <= Number.MAX_VALUE), and
                        // ((envData.noteOffReleaseDuration * 1000) + 1000) < Number.MAX_VALUE) -- see noteOff().
                        // These should in practice never be a problem, but just in case...
                        if(!((envData.envelopeDuration * 1000) <= Number.MAX_VALUE)) // see noteOn() 
                        {
                            throw "illegal envelopeDuration";
                        }

                        if(!(((envData.noteOffReleaseDuration * 1000) + 1000) < Number.MAX_VALUE)) // see noteOff()
                        {
                            throw "illegal noteOffReleaseDuration";
                        }
                    }

                    function setSHORT_vEnvData(zones)
                    {
                        // Sets attack, hold, decay and release durations for each zone.
                        for(var i = 0; i < zones.length; i++)
                        {
                            let vEnvData = {attack: 0, hold: 0.5, decay: 4.5, release: DEFAULT_NOTEOFF_RELEASE_DURATION}; // Surikov envelope
                            vEnvData.envelopeDuration = 5; // zoneVEnvData.attack + zoneVEnvData.hold + zoneVEnvData.decay;
                            vEnvData.noteOffReleaseDuration = DEFAULT_NOTEOFF_RELEASE_DURATION; // zoneVEnvData.release;
                            zones[i].vEnvData = vEnvData;
                        }
                        checkDurations(zones[0].vEnvData);
                    }

                    function setLONG_vEnvData(presetName, originalPresetIndex, zones)
                    {
                        // Sets attack, hold, decay and release durations for each zone.
                        // The duration values are set to increase logarithmically per pitchIndex
                        // from the ..Low value at pitchIndex 0 to the ..High value at pitchIndex 127.
                        // The values per zone are then related to the pitchIndex of zone.keyRangeLow,
                        function setCustomLONGEnvData(zones, aLow, aHigh, hLow, hHigh, dLow, dHigh, rLow, rHigh)
                        {
                            let aFactor = (aHigh === 0 || aLow === 0) ? 1 : Math.pow(aHigh / aLow, 1 / 127),
                                hFactor = (hHigh === 0 || hLow === 0) ? 1 : Math.pow(hHigh / hLow, 1 / 127),
                                dFactor = (dHigh === 0 || dLow === 0) ? 1 : Math.pow(dHigh / dLow, 1 / 127),
                                rFactor = (rHigh === 0 || rLow === 0) ? 1 : Math.pow(rHigh / rLow, 1 / 127);

                            for(var i = 0; i < zones.length; i++)
                            {
                                let zone = zones[i],
                                    keyLow = zone.keyRangeLow,
                                    a = aLow * Math.pow(aFactor, keyLow),
                                    h = hLow * Math.pow(hFactor, keyLow),
                                    d = dLow * Math.pow(dFactor, keyLow),
                                    r = rLow * Math.pow(rFactor, keyLow);

                                let vEnvData = {attack: a, hold: h, decay: d, release: r};
                                vEnvData.envelopeDuration = a + h + d; // zoneVEnvData.attack + zoneVEnvData.hold + zoneVEnvData.decay;
                                vEnvData.noteOffReleaseDuration = r; // zoneVEnvData.release;
                                checkDurations(vEnvData);
                                zone.vEnvData = vEnvData;
                            }
                        }

                        // The following presetIndices have LONG envelopes:
                        // 0, 1, 2, 3, 4, 5, 6, 7,
                        // 8, 9, 10, 11, 12, 14, 15,
                        // 24, 25, 26, 27, 28, 29, 30, 31,
                        // 32, 33, 34, 35, 36, 37, 38, 39,
                        // 46 (Harp)
                        // 104, 105, 106, 107, 108, 109, 110, 111
                        //
                        // 02.2020: Except for Harpsichord, the following presetIndices
                        // are all those used by the AssistantPerformer(GrandPiano + Study2)
                        switch(originalPresetIndex)
                        {
                            case 0: // Grand Piano						
                                setCustomLONGEnvData(zones, 0, 0, 0, 0, 25, 5, 1, 0.5);
                                break;
                            case 6: // Harpsichord -- not used by AssistantPerformer 02.2020
                                setCustomLONGEnvData(zones, 0, 0, 0, 0, 15, 1, 0.5, 0.1);
                                break;
                            case 8: // Celesta
                                setCustomLONGEnvData(zones, 0, 0, 0, 0, 8, 4, 0.5, 0.1);
                                break;
                            case 9: // Glockenspiel
                                setCustomLONGEnvData(zones, 0, 0, 0.002, 0.002, 6, 1.5, 0.4, 0.1);
                                break;
                            case 10: // MusicBox
                                setCustomLONGEnvData(zones, 0, 0, 0, 0, 8, 0.5, 0.5, 0.1);
                                break;
                            case 11: // Vibraphone
                                setCustomLONGEnvData(zones, 0, 0, 0.4, 0.4, 10, 3, 0.5, 0.1);
                                break;
                            case 12: // Marimba
                                setCustomLONGEnvData(zones, 0, 0, 0, 0, 9.5, 0.6, 0.5, 0.1);
                                break;
                            //case 13: // Xylophone -- used by AssistantPerformer, but does not have a LONG envelope.
                            //	break;
                            case 14: // Tubular Bells
                                setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 20, 5, 0.5, 0.1);
                                break;
                            case 15: // Dulcimer
                                setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 10, 0.4, 0.4, 0.04);
                                break;
                            case 24: // NylonGuitar
                                setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 7, 0.3, 0.3, 0.05);
                                break;
                            case 25: // AcousticGuitar (steel)
                                setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 7, 0.3, 0.3, 0.05);
                                break;
                            case 26: // ElectricGuitar (Jazz)
                                setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 7, 0.3, 0.3, 0.05);
                                break;
                            case 27: // ElectricGuitar (clean)
                                setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 7, 0.3, 0.3, 0.05);
                                break;
                            case 46: // Harp
                                setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 10, 0.4, 0.4, 0.04);
                                break;
                            default:
                                console.warn("Volume envelope data has not been defined for preset " + originalPresetIndex.toString() + " (" + presetName + ").");
                        }
                    }

                    function setUNENDING_vEnvData(zones)
                    {
                        // Sets attack, hold, decay and release durations for each zone.
                        for(var i = 0; i < zones.length; i++)
                        {
                            let vEnvData = {attack: 0, hold: MAX_DURATION, decay: 0, release: DEFAULT_NOTEOFF_RELEASE_DURATION}; // Surikov envelope
                            vEnvData.envelopeDuration = MAX_DURATION; // zoneVEnvData.attack + zoneVEnvData.hold + zoneVEnvData.decay;
                            vEnvData.noteOffReleaseDuration = DEFAULT_NOTEOFF_RELEASE_DURATION; // zoneVEnvData.release;
                            zones[i].vEnvData = vEnvData;
                        }
                        checkDurations(zones[0].vEnvData);
                    }

                    let isPercussion = presetName.includes("percussion"),
                        envType = presetEnvType(isPercussion, zones[0].midi);

                    // envTypes:
                    // 0: short envelope (e.g. drum, xylophone, percussion)
                    // 1: long envelope (e.g. piano)
                    // 2: unending envelope (e.g. wind preset, organ)
                    switch(envType)
                    {
                        case PRESET_ENVTYPE.SHORT:
                            setSHORT_vEnvData(zones);
                            break;
                        case PRESET_ENVTYPE.LONG:
                            setLONG_vEnvData(presetName, originalPresetIndex, zones);
                            break;
                        case PRESET_ENVTYPE.UNENDING:
                            setUNENDING_vEnvData(zones);
                            break;
                    }
                }

                let presets = webAudioFont.presets;

                for(var presetIndex = 0; presetIndex < presets.length; presetIndex++)
                {
                    let preset = presets[presetIndex],
                        presetName = preset.name,
                        originalPresetIndex = preset.originalPresetIndex,
                        zones = preset.zones;

                    setZonesToMaximumRange(presetName, originalPresetIndex, zones);
                    // The residentSynth is going to use the zone.vEnvData attributes
                    //(which are set below) instead of the original zone.ahdsr attributes.
                    // The zone.ahdsr attributes are deleted here to avoid confusion.
                    deleteZoneAHDSRs(zones);
                    setZoneVEnvData(presetName, originalPresetIndex, zones);

                    // the originalPresetIndex and isPercussion attributes
                    // are not part of the ResidentSynth's API,
                    // so should be deleted before it is exposed.
                    delete preset.originalPresetIndex;
                    delete preset.isPercussion;
                }
                return webAudioFont;
            }

            // See: https://stackoverflow.com/questions/758688/sleep-in-javascript-delay-between-actions
            function sleepUntilAllBanksAreReady(webAudioFonts)
            {
                function sleep(ms)
                {
                    return new Promise(res => setTimeout(res, ms));
                }

                async function waitUntilWebAudioFontIsReady(webAudioFont)
                {
                    while(!webAudioFont.isReady())
                    {
                        //console.log('Sleeping');
                        await sleep(100);
                        //console.log('Done sleeping');
                    }
                }

                for(var i = 0; i < webAudioFonts.length; i++)
                {
                    let webAudioFont = webAudioFonts[i];
                    if(webAudioFont.isReady() === false)
                    {
                        waitUntilWebAudioFontIsReady(webAudioFont);
                    }
                }
            }

            let webAudioFontDef = ResSynth.webAudioFontDef, // defined in webAudioFontDef.js
                banks = [],
                percussionPresets = getPercussionPresets(); // undefined if there are no percussion presets

            adjustAllPresetVariables();

            for(let bankIndex = 0; bankIndex < webAudioFontDef.length; ++bankIndex)
            {
                let bankDef = webAudioFontDef[bankIndex],
                    name = bankDef.name,
                    presets = getFinalizedPresets(bankDef.presets, percussionPresets),
                    bank = new ResSynth.bank.Bank(name, presets);

                // The bank's zone.file attributes need not have been completely adjusted (=unpacked) when
                // this function is called since neither the zone.file nor the binary zone.buffer attributes are accessed.
                let adjustedBank = adjustForResidentSynth(bank);

                banks.push(adjustedBank);
            }

            sleepUntilAllBanksAreReady(banks);

            return banks;
        },

        getMixtures = function()
        {
            // see comment in mixtureDefs.js
            function checkMixturesInputFile(mixtures)
            {
                for(let i = 0; i < mixtures.length; i++) 
                {
                    let mixture = mixtures[i],
                        mixtureName = mixture.name,
                        extraNotes = mixture.extraNotes,
                        except = mixture.except;

                    console.assert(mixtureName !== undefined);
                    console.assert(extraNotes !== undefined && Array.isArray(extraNotes));
                    console.assert(except !== undefined && Array.isArray(except));

                    if(extraNotes.length > 0)
                    {
                        for(let k = 0; k < extraNotes.length; k++)
                        {
                            let extraNote = extraNotes[k],
                                dataLength = extraNote.length,
                                noteIncr, // extraNote[0]
                                velFac; // extraNote[1]

                            if(dataLength > 0)
                            {
                                console.assert(dataLength === 2);
                                noteIncr = extraNote[0]
                                velFac = extraNote[1]
                                console.assert(Number.isInteger(noteIncr) && noteIncr >= -127 && noteIncr <= 127);
                                console.assert(velFac > 0 && velFac <= 100.0);
                            }
                        }
                    }

                    if(except.length > 0)
                    {
                        for(let m = 0; m < except.length; m++)
                        {
                            let noteMixtureIndex = except[m];
                            console.assert(noteMixtureIndex.length === 2);
                            let note = noteMixtureIndex[0],
                                mixtureIndex = noteMixtureIndex[1];

                            console.assert(Number.isInteger(note) && note >= 0 && note <= 127);
                            console.assert(Number.isInteger(mixtureIndex) && mixtureIndex >= 0 && mixtureIndex < mixtures.length);
                        }
                    }
                }
            }

            if(ResSynth.mixtureDefs !== undefined)
            {
                mixtures = ResSynth.mixtureDefs;
                checkMixturesInputFile(mixtures);
            }

            return mixtures;
        },
        // See comments in keyboardSplitDefs.js and ornamentDefs.js.
        // Further checking is done in setPrivateChannelPerKeyArrays() and setPrivateOrnamentPerKeyArrays().
        // Throws an exception if an error is found in the keyboardSplitDefs.
        checkKeyValuesStrings = function(keyValuesStringsArray)
        {
            // A RegExp for checking that a string contains zero or more "intVal1:intVal2;" strings separated by whitespace.
            // Both intVal1 and intVal2 must be in range 0..127. The final ";" is optional.
            const longInputStringRegex = new RegExp('^((\\d{1,2}|(1[0-1]\\d|12[0-7])):(\\d{1,2}|(1[0-1]\\d|12[0-7])); ?)*((\\d{1,2}|(1[0-1]\\d|12[0-7])):(\\d{1,2}|(1[0-1]\\d|12[0-7]));? ?)?$');

            if(keyValuesStringsArray.length > 128)
            {
                throw `keyboardSplitDefs.js: There may not be more than 128 keyboardSplit definition strings in the array.`;
            }
            else
            {
                for(let i = 0; i < keyValuesStringsArray.length; i++) 
                {
                    let keyValuesString = keyValuesStringsArray[i];

                    if(longInputStringRegex.test(keyValuesString) === false)
                    {
                        throw `Illegal keyboardSplitString: ${keyValuesString}\nDefinition index: ${i}`;
                    }
                }
            }
        },

        setPrivateChannelPerKeyArrays = function()
        {
            // If keyboardSplitDefs[defIndex].length > 0, returns an array of 128 channel indices, one per key index.
            // Otherwise returns an empty array (the residentSynth will use the incoming message's channel).
            // Throws an exception if keys are not unique and in ascending order, or a channel or key is out of range.
            // 01.09.2023: Interestingly, this function was partly optimized in a dialog with ChatGPT.
            // ChatGPT uses some constructs that I should adopt: (const etc.)
            function getChannelPerKeyArray(keyboardSplitDefs, defIndex)
            {
                function check(keyChannelPairs, keyValuesString) 
                {
                    for(let i = 0, previousKey = -1; i < keyChannelPairs.length; i++)
                    {
                        let kvp = keyChannelPairs[i],
                            key = kvp.key,
                            channel = kvp.value;

                        if(key <= previousKey || channel < 0 || channel > 15 || key < 0 || key > 127)
                        {
                            const errorString = `Illegal keyboardSplitString: ${keyValuesString}\n<key:channel> component index: ${i}`;
                            alert(errorString);
                            throw errorString;
                        }

                        previousKey = key;
                    }
                }

                const keyboardSplitDef = keyboardSplitDefs[defIndex];

                if(keyboardSplitDef.length === 0)
                {
                    return []; // the residentSynth will use the incoming message's channel
                }
                
                const arraySize = 128,
                    keyChannelPairs = getKeyIntValuePairs(keyboardSplitDef),
                    channelPerKeyArray = (keyChannelPairs.length > 0) ? Array(arraySize).fill(0) : [];

                check(keyChannelPairs, keyboardSplitDef);

                for(let i = 0; i < keyChannelPairs.length; i++)
                {
                    let kvp = keyChannelPairs[i],
                        key = kvp.key,
                        channel = kvp.value,
                        nextKey = (i < keyChannelPairs.length - 1) ? keyChannelPairs[i + 1].key : arraySize;

                    for(let j = key; j < nextKey; j++)
                    {
                        channelPerKeyArray[j] = channel;
                    }
                }

                return channelPerKeyArray;
            }

            function getKeyIntValuePairs(keyValuesString)
            {
                console.assert(keyValuesString.length > 0);

                const keyValuePairs = [],
                    components = keyValuesString.split(";");

                for(const component of components)
                {
                    const [keyStr, valueStr] = component.trim().split(":");
                    const key = parseInt(keyStr);
                    const value = parseInt(valueStr);

                    keyValuePairs.push({key, value});
                }

                return keyValuePairs;
            }

            let keyboardSplitDefs = ResSynth.keyboardSplitDefs;

            if(keyboardSplitDefs === undefined)
            {
                channelPerKeyArrays.push([]); // an empty array means use the incoming message channel
            }
            else
            {
                try
                {
                    checkKeyValuesStrings(keyboardSplitDefs);

                    for(var i = 0; i < keyboardSplitDefs.length; i++)
                    {
                        let channelPerKeyArray = getChannelPerKeyArray(keyboardSplitDefs, i);  // can return an empty array (meaning use the incoming message channel)
                        channelPerKeyArrays.push(channelPerKeyArray);
                    }
                }
                catch(msg)
                {
                    msg = "Error in keyboardSplitDefs.js\n" + msg;
                    channelPerKeyArrays.length = 0;
                    channelPerKeyArrays.push([]);
                    console.assert(false, msg);
                }
            }
        },

        // The private (readonly) keyOrnamentsArrays array is initialized, from ResSynth.ornamentPerKeysStrings,
        // to contain (readonly) keyOrnaments arrays.
        // Each keyOrnaments array contains (readonly) <key, ornament> objects, one object per substring in each
        // ornamentPerKeys string.
        // Each keyOrnament object has (readonly) attributes .key and .ornamentInfo.
        // The ornamentInfo objects have the following (readonly) attributes:
        //   ornamentInfo.name
        //   ornamentInfo.msgs //  an array
        //   ornamentInfo.repeat
        //
        // Each msgs definition is an array containing objects having one each of the following attributes (defining their type):
        //      cmd: [commandIndex, value]
        //      ctl: [controlIndex, value]
        //      delay: milliseconds -- must always be > 0 (default is no delay between messages)
        //      noteOn: [keyIncrement, velocityIncrement]
        //      noteOff: keyIncrement
        // delay must always be > 0 (default is no delay between messages)
        // keyIncrement and velocityIncrement must each be in range -127..127.
        // The repeat attribute is a boolean value that can be either "yes" or "no".
        // If the repeat attribute is "no", the ornamented event ends when the trigger note's noteOff is received.
        // If the repeat attribute is "yes", the chords are played in a continuous cycle until the trigger note's noteOff is received.
        //
        // The volatile runtime attributes (.cancel and .complete) are addressed later.
        //   ornamentInfo.cancel = false;
        //   ornamentInfo.complete = false;
        setPrivateKeyOrnamentsArrays = function()
        {
            // throws exception on error
            function getInKeyOrnamentsArray(ornamentPerKeysString, fileOrnamentDefs)
            {
                // throws exception on error
                function getInKeyOrnamentDef(keyStr, ornamentName, fileOrnamentDefs)
                {
                    function getOrnamentMsgDefs(inKey, msgDefs)
                    {
                        let ornamentMsgs = [];

                        for(let i = 0; i < msgDefs.length; i++)
                        {
                            let msg = {},
                                msgDef = msgDefs[i];

                            if(msgDef.delay !== undefined)
                            {
                                msg.type = "delay";
                                msg.delay = parseInt(msgDef.delay);
                            }
                            else if(msgDef.chordOn !== undefined)
                            {
                                let chordOnDef = msgDef.chordOn;
                                msg.type = "chordOn";

                                msg.noteOns = [];
                                for(let i = 0; i < chordOnDef.length; i++)
                                {
                                    let noteOnDef = chordOnDef[i],
                                        noteOn = {};

                                    noteOn.key = inKey + parseInt(noteOnDef[0]);
                                    noteOn.velocityIncr = parseInt(noteOnDef[1]);

                                    msg.noteOns.push(noteOn);
                                }                                
                            }
                            else if(msgDef.chordOff !== undefined)
                            {
                                let chordOffDef = msgDef.chordOff;
                                msg.type = "chordOff";
                                msg.noteOffs = [];
                                for(let i = 0; i < chordOffDef.length; i++)
                                {
                                    let noteOff = {};

                                    noteOff.key = inKey + parseInt(chordOffDef[i]);

                                    msg.noteOffs.push(noteOff);
                                } 
                            } 

                            ornamentMsgs.push(msg);
                        }
                        return ornamentMsgs;
                    }

                    let inKey = parseInt(keyStr),
                        fileOrnamentDef = fileOrnamentDefs.find(x => x.name === ornamentName),
                        ornamentDef = {};

                    if(Number.isNaN(inKey) || inKey < 0 || inKey > 127)
                    {
                        throw `illegal key (${keyStr}) in ornamentDefs`;
                    }
                    if(fileOrnamentDef === undefined)
                    {
                        throw `ornament name ${ornamentName} not found in ornamentDefs`;
                    }

                    ornamentDef.name = fileOrnamentDef.name;
                    ornamentDef.msgs = getOrnamentMsgDefs(inKey, fileOrnamentDef.msgs);
                    ornamentDef.repeat = (fileOrnamentDef.repeat === "yes") ? true : false;

                    return {inKey, ornamentDef};
                }

                // throws exception on error
                function checkKeys(keyOrnaments)
                {
                    let usedKeys = [];

                    usedKeys.push(keyOrnaments[0].inKey);

                    // Key values must be in ascending order, and may not repeat.
                    for(var i = 1; i < keyOrnaments.length; i++)
                    {
                        let key0 = keyOrnaments[i - 1].inKey,
                            key1 = keyOrnaments[i].inKey;

                        if(key0 >= key1)
                        {
                            throw `illegal key (${key0} >= ${key1}) in keyOrnaments`;
                        }
                        if(usedKeys.find(x => x === key1) !== undefined)
                        {
                            throw `illegal duplicate key (${key1}) in keyOrnaments`;
                        }
                        usedKeys.push(key1);
                    }
                }

                let inKeyOrnamentsArray = [];

                if(ornamentPerKeysString.length > 0)
                {
                    const components = ornamentPerKeysString.split(";");

                    for(const component of components)
                    {
                        const [keyStr, ornamentName] = component.trim().split(":"),
                            inKeyOrnamentDef = getInKeyOrnamentDef(keyStr, ornamentName, fileOrnamentDefs);

                        inKeyOrnamentsArray.push(inKeyOrnamentDef);
                    }
                }

                if(inKeyOrnamentsArray.length > 0)
                {
                    checkKeys(inKeyOrnamentsArray);
                }

                return inKeyOrnamentsArray;
            }

            const ornamentPerKeysStrings = ResSynth.ornamentPerKeysStrings,
                fileOrnamentDefs = ResSynth.ornamentDefs;

            if(ornamentPerKeysStrings === undefined || fileOrnamentDefs === undefined)
            {
                inKeyOrnamentDefsArrays.push([]); // an empty array means there are no ornaments defined.
            }
            else
            {
                try
                {
                    for(var i = 0; i < ornamentPerKeysStrings.length; i++)
                    {
                        const keyOrnamentsString = ornamentPerKeysStrings[i],
                            inKeyOrnamentDefs = getInKeyOrnamentsArray(keyOrnamentsString, fileOrnamentDefs);

                        inKeyOrnamentDefsArrays.push(inKeyOrnamentDefs); // global keyOrnamentsArrays
                    }
                }
                catch(msg)
                {
                    msg = "Error in ornamentPerKeysStrings.js\n" + msg;
                    inKeyOrnamentDefsArrays.length = 0;
                    inKeyOrnamentDefsArrays.push([]);
                    console.assert(false, msg);
                }
            }
        },

        // returns an array of Settings objects containing the values set in the settingsPresets.js file.
        // The values in the attributes of the returned Settings objects are immutable.
        // Clone using {...settings} to create an object having mutable attributes. (Attributes can never be created or destroyed.)
        getSettingsPresets = function(resSynthSettingsPresets)
        {
            if(resSynthSettingsPresets === undefined)
            {
                let defaultSettings1 = new ResSynth.settings.Settings("default settings 1"),
                    defaultSettings2 = new ResSynth.settings.Settings("default settings 2");

                Object.freeze(defaultSettings1); // attribute values are frozen
                Object.freeze(defaultSettings2); // attribute values are frozen

                settingsPresets.push(defaultSettings1); // push twice for host's select control (so that it works)
                settingsPresets.push(defaultSettings2);
            }
            else
            {
                for(var settingsIndex = 0; settingsIndex < resSynthSettingsPresets.length; settingsIndex++)
                {
                    let sp = resSynthSettingsPresets[settingsIndex],
                        settings = new ResSynth.settings.Settings(sp.name);

                    settings.bankIndex = sp.bankIndex;
                    settings.presetIndex = sp.presetIndex;
                    settings.mixtureIndex = sp.mixtureIndex;
                    settings.tuningGroupIndex = sp.tuningGroupIndex;
                    settings.tuningIndex = sp.tuningIndex;
                    settings.semitonesOffset = sp.semitonesOffset;
                    settings.centsOffset = sp.centsOffset;
                    settings.pitchWheel = sp.pitchWheel;
                    settings.modWheel = sp.modWheel;
                    settings.volume = sp.volume;
                    settings.pan = sp.pan;
                    settings.reverberation = sp.reverberation;
                    settings.pitchWheelSensitivity = sp.pitchWheelSensitivity;
                    settings.triggerKey = sp.triggerKey;
                    settings.velocityPitchSensitivity = sp.velocityPitchSensitivity;
                    settings.keyboardSplitIndex = sp.keyboardSplitIndex;
                    settings.keyboardOrnamentsArrayIndex = sp.keyboardOrnamentsArrayIndex;

                    Object.freeze(settings); // attribute values are frozen

                    settingsPresets.push(settings);
                }
            }

            return settingsPresets;
        },

        getTuningGroups = function()
        {
            let tuningsFactory = new ResSynth.tuningsFactory.TuningsFactory(),
                tuningGroupDefs = ResSynth.tuningDefs,
                wmtg = ResSynth.tuningConstructors;

            if(tuningGroupDefs === undefined || tuningGroupDefs.length === 0)
            {
                // default tuning
                let tuningGroup = [],
                    tuning = tuningsFactory.getEqualTemperamentTuning();

                tuning.name = "Equal Temperament";
                tuningGroup.push(tuning);
                tuningGroups.push(tuningGroup);
            }
            else
            {
                for(var i = 0; i < tuningGroupDefs.length; i++)
                {
                    let tuningGroupDef = tuningGroupDefs[i],
                        tuningDefs = tuningGroupDef.tunings,
                        tuningGroup = [];

                    tuningGroup.name = tuningGroupDef.name;

                    switch(tuningGroupDef.ctor)
                    {
                        case wmtg.FUNCTION_GET_TUNING_FROM_CONSTANT_FACTOR:
                            {
                                for(let k = 0; k < tuningDefs.length; k++)
                                {
                                    let tuningDef = tuningDefs[k],
                                        root = tuningDef.root,
                                        factor = tuningDef.factor,
                                        tuning = tuningsFactory.getTuningFromConstantFactor(root, factor);

                                    tuning.name = tuningDef.name;
                                    tuningGroup.push(tuning);
                                }
                                break;
                            }
                        case wmtg.FUNCTION_GET_PARTCH_TUNING:
                            {
                                for(let k = 0; k < tuningDefs.length; k++)
                                {
                                    let tuningDef = tuningDefs[k],
                                        root = tuningDef.root,
                                        tuning = tuningsFactory.getPartchTuning(root);

                                    tuning.name = tuningDef.name;
                                    tuningGroup.push(tuning);
                                }
                                break;
                            }
                        case wmtg.FUNCTION_GET_WARPED_OCTAVES_TUNING:
                            {
                                for(let k = 0; k < tuningDefs.length; k++)
                                {
                                    let tuningDef = tuningDefs[k],
                                        keyValuesArray = tuningDef.keyValuesArray,
                                        tuning = tuningsFactory.getWarpedTuning(keyValuesArray, "octaves");

                                    tuning.name = tuningDef.name;
                                    tuningGroup.push(tuning);
                                }
                                break;
                            }
                        case wmtg.FUNCTION_GET_WARPED_GAMUT_TUNING:
                            {
                                for(let k = 0; k < tuningDefs.length; k++)
                                {
                                    let tuningDef = tuningDefs[k],
                                        keyValuesArray = tuningDef.keyValuesArray,
                                        tuning = tuningsFactory.getWarpedTuning(keyValuesArray, "gamut");

                                    tuning.name = tuningDef.name;
                                    tuningGroup.push(tuning);
                                }
                                break;
                            }
                        case wmtg.FUNCTION_GET_BAROQUE_TUNING:
                            {
                                for(let k = 0; k < tuningDefs.length; k++)
                                {
                                    let tuningDef = tuningDefs[k],
                                        offsets = tuningDef.offsets,
                                        tuning = tuningsFactory.getBaroqueTuning(offsets);

                                    tuning.name = tuningDef.name;
                                    tuningGroup.push(tuning);
                                }
                                break;
                            }
                        default:
                            console.assert(false, "Unknown tuning type.");
                    }

                    tuningGroups.push(tuningGroup);
                }
            }

            return tuningGroups;
        },

        /*****************************************/
        /* Control Functions */

        // also sets channelPresets[channel] and channelControl.presetIndex to 0.
        updateBankIndex = function(channel, bankIndex)
        {
            channelPresets[channel] = channelPresets.webAudioFont[bankIndex].presets; // global

            channelControls[channel].bankIndex = bankIndex;
            channelControls[channel].presetIndex = 0;
        },
        updateMixtureIndex = function(channel, mixtureIndex)
        {
            channelControls[channel].mixtureIndex = mixtureIndex;
        },

        // sets channelControl.tuning to the first tuning in the group.
        updateTuningGroupIndex = function(channel, tuningGroupIndex)
        {
            channelControls[channel].tuningGroupIndex = tuningGroupIndex;
            channelControls[channel].tuningIndex = 0;
            channelControls[channel].tuning = tuningGroups[tuningGroupIndex][0];
        },
        updateTuning = function(channel, tuningIndex)
        {
            let tuningGroupIndex = channelControls[channel].tuningGroupIndex;

            channelControls[channel].tuningIndex = tuningIndex;
            channelControls[channel].tuning = tuningGroups[tuningGroupIndex][tuningIndex];
        },
        updateSemitonesOffset = function(channel, semitonesOffset)
        {
            channelControls[channel].semitonesOffset = semitonesOffset;
        },
        updateCentsOffset = function(channel, centsOffset)
        {
            channelControls[channel].centsOffset = centsOffset;
        },

        updatePitchWheel = function(channel, data1, data2)
        {
            var pitchWheel14Bit = (((data2 & 0x7f) << 7) | (data1 & 0x7f)) - 8192,
                currentNoteOns = channelControls[channel].currentNoteOns;

            // data2 is the MSB, data1 is LSB.
            //console.log("updatePitchWheel() data1: " + data1 + " data2:" + data2 + " pitchWheel14Bit=" + pitchWheel14Bit + " (should be in range -8192..+8191)");

            if(currentNoteOns !== undefined && currentNoteOns.length > 0)
            {
                let nNoteOns = currentNoteOns.length;
                for(let i = 0; i < nNoteOns; ++i)
                {
                    currentNoteOns[i].updatePitchWheel(pitchWheel14Bit);
                }
            }

            channelControls[channel].pitchWheelData1 = data1; // for restoring settings
            channelControls[channel].pitchWheelData2 = data2; // for restoring settings
            channelControls[channel].pitchWheel14Bit = pitchWheel14Bit; // for new noteOns
        },
        // The value argument is in range [0..127], meaning not modulated to as modulated as possible.
        // The frequency of the modMode depends on the frequency of the note...
        updateModWheel = function(channel, value)
        {
            //console.log("ResidentSynth: ModWheel channel:" + channel + " value:" + value);

            let currentNoteOns = channelControls[channel].currentNoteOns;
            if(currentNoteOns !== undefined && currentNoteOns.length > 0)
            {
                let nNoteOns = currentNoteOns.length;
                for(let i = 0; i < nNoteOns; ++i)
                {
                    currentNoteOns[i].updateModWheel(channelAudioNodes[channel].modNode, channelAudioNodes[channel].modGainNode, value);
                }
            }

            channelControls[channel].modWheel = value; // for new noteOns
        },
        // The volume argument is in range [0..127], meaning muted to as loud as possible.
        updateVolume = function(channel, volume)
        {
            let volumeFactor = volume / 127;

            channelControls[channel].volume = volume;
            channelAudioNodes[channel].gainNode.gain.setValueAtTime(volumeFactor, audioContext.currentTime);
        },
        // The pan argument is in range [0..127], meaning completely left to completely right.
        updatePan = function(channel, pan)
        {
            let panValue = ((pan / 127) * 2) - 1; // panValue is in range [-1..1]

            channelControls[channel].pan = pan;
            channelAudioNodes[channel].panNode.pan.setValueAtTime(panValue, audioContext.currentTime);
        },
        // The reverberation argument is in range [0..127], meaning completely dry to completely wet.
        updateReverberation = function(channel, reverberation)
        {
            channelControls[channel].reverberation = reverberation;
            channelAudioNodes[channel].reverberator.setValueAtTime(reverberation, audioContext.currentTime);
        },
        updatePitchWheelSensitivity = function(channel, semitones)
        {
            let chanControls = channelControls[channel],
                currentNoteOns = chanControls.currentNoteOns;

            if(currentNoteOns !== undefined && currentNoteOns.length > 0) // required for sounding notes
            {
                let pitchWheel14Bit = chanControls.pitchWheel14Bit,
                    nNoteOns = currentNoteOns.length;

                for(let i = 0; i < nNoteOns; ++i)
                {
                    currentNoteOns[i].pitchWheelSensitivity = semitones; // 0..127 semitones
                    currentNoteOns[i].updatePitchWheel(pitchWheel14Bit);
                }
            }

            chanControls.pitchWheelSensitivity = semitones; // for new noteOns
        },

        updateVelocityPitchSensitivity = function(channel, data2)
        {
            channelControls[channel].velocityPitchSensitivity = data2 / 127; // semitones
        },
        updateKeyboardSplit = function(channel, keyboardSplitIndex)
        {
            channelControls[channel].channelPerKeyArray = channelPerKeyArrays[keyboardSplitIndex];
        },
        updateInKeyOrnamentDefs = function(channel, inKeyOrnamentDefsIndex)
        {
            channelControls[channel].inKeyOrnamentDefs = inKeyOrnamentDefsArrays[inKeyOrnamentDefsIndex];
        },
        // Must turn off notes in all channels, since the keyboard can be split,
        // so we don't know which channels may be sounding.
        allSoundOff = function()
        {
            function reconnectChannelInput(chanAudioNodes)
            {
                // audioContext is inherited
                chanAudioNodes.inputNode = audioContext.createStereoPanner();
                chanAudioNodes.panNode = chanAudioNodes.inputNode;
                chanAudioNodes.inputNode.connect(chanAudioNodes.reverberator.input);
            }

            for(let channel = 0; channel < 16; channel++)
            {
                let currentNoteOns = channelControls[channel].currentNoteOns,
                    chanAudioNodes = channelAudioNodes[channel],
                    inputNode = chanAudioNodes.inputNode,
                    now = 0, stopTime = 0;

                inputNode.disconnect();
                while(currentNoteOns.length > 0)
                {
                    now = audioContext.currentTime;
                    stopTime = noteOff(channel, currentNoteOns[0].keyKey);
                }
                setTimeout(function() {reconnectChannelInput(chanAudioNodes)}, stopTime - now);
            }            
        },

        noteOn = async function(inChannel, inKey, inVelocity)
        {
            function wait(milliseconds)
            {
                return new Promise(resolve => setTimeout(resolve, milliseconds));
            }

            // returns a new midiAttributes object
            function getMidiAttributes(chanPresets, chanControls, inKey, inVelocity)
            {
                let midi = {};

                midi.preset = chanPresets[chanControls.presetIndex];
                midi.inKey = inKey;  // the note stops when the inKey's noteOff arrives                
                midi.inVelocity = inVelocity;
                // keyCentsPitch is the pitch described as a key.cents value in equal temperament.
                midi.keyCentsPitch = chanControls.tuning[inKey] + chanControls.semitonesOffset + (chanControls.centsOffset / 100);

                // velocityPitchValue14Bit is always the same for all octaves of the same absolute pitch
                let noteOn = chanControls.currentNoteOns.find(x => (x.inKey % 12) === (midi.inKey % 12));
                if(noteOn !== undefined)
                {
                    midi.velocityPitchValue14Bit = noteOn.velocityPitchValue14Bit;
                }
                else
                {
                    midi.velocityPitchValue14Bit = (((inVelocity & 0x7f) << 7) | (inVelocity & 0x7f)) - 8192;
                }

                return midi;
            }

            function doNoteOn(midi)
            {
                function doNewIndividualNoteOn(midi)
                {
                    let zone, note,
                        preset = midi.preset,
                        keyPitchBase = Math.floor(midi.keyCentsPitch);

                    zone = preset.zones.find(obj => (obj.keyRangeHigh >= keyPitchBase && obj.keyRangeLow <= keyPitchBase));
                    if(!zone)
                    {
                        console.throw("zone  not found");
                    }
                    // note on
                    note = new ResSynth.residentSynthNote.ResidentSynthNote(audioContext, zone, midi, chanControls, channelAudioNodes[channel]);
                    note.noteOn();
                    chanControls.currentNoteOns.push(note);
                }

                function doMixture(midi, mixtureIndex, mixtureVelocityPitchValue14Bit)
                {
                    let mixture = mixtures[mixtureIndex],
                        extraNotes = mixture.extraNotes,
                        except = mixture.except,
                        keyMixtureIndex = except.find(x => x[0] === inKey),
                        keyKeys = [];

                    if(keyMixtureIndex !== undefined)
                    {
                        extraNotes = keyboardSplitDefs[keyMixtureIndex[1]].extraNotes;
                    }

                    for(let i = 0; i < extraNotes.length; i++)
                    {
                        let keyVel = extraNotes[i],
                            newKey = inKey + keyVel[0],
                            newVelocity = Math.floor(inVelocity * keyVel[1]);

                        newKey = (newKey > 127) ? 127 : newKey;
                        newKey = (newKey < 0) ? 0 : newKey;
                        newVelocity = (newVelocity > 127) ? 127 : newVelocity;
                        newVelocity = (newVelocity < 1) ? 1 : newVelocity;

                        // midi.preset is unchanged
                        midi.keyKey = inKey; // the key that turns this note off (unchanged in mix)
                        midi.keyCentsPitch = chanControls.tuning[newKey] + semitonesOffset;
                        midi.velocity = newVelocity;

                        keyKeys.push(midi.keyKey);

                        doNewIndividualNoteOn(midi);
                    }

                    return keyKeys;
                }

                doNewIndividualNoteOn(midi);

                if(chanControls.mixtureIndex > 0) // 0 is "no mixture"
                {
                    doMixture(midi, chanControls.mixtureIndex, midi.velocityPitchValue14Bit);
                }
            }

            async function playOrnamentAsync(inMidi, ornamentDef)
            {
                async function doMsgAsync(inMidi, msg, ornamentNoteOnKeys, cancel)
                {
                    function midiVal(value)
                    {
                        value = (value < 0) ? 0 : value;
                        value = (value > 127) ? 127 : value;
                        return value;
                    }

                    function wait(delay, cancel)
                    {
                        if(!cancel)
                        {
                            return new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }

                    switch(msg.type)
                    {
                        case "delay":
                        {
                            await wait(msg.delay, cancel);
                            break;
                        }
                        case "chordOn":
                        {
                            let noteOns = msg.noteOns;

                            for(let i = 0; i < noteOns.length; i++)
                            {
                                let noteOnMsg = noteOns[i],
                                    oMidi = {};

                                oMidi.preset = inMidi.preset;
                                oMidi.inKey = noteOnMsg.key;
                                oMidi.keyCentsPitch = chanControls.tuning[oMidi.inKey] + chanControls.semitonesOffset + (chanControls.centsOffset / 100);
                                oMidi.inVelocity = midiVal(inMidi.inVelocity + noteOnMsg.velocityIncr);

                                let noteOn = chanControls.currentNoteOns.find(x => (x.inKey % 12) === (oMidi.inKey % 12));
                                if(noteOn !== undefined)
                                {
                                    oMidi.velocityPitchValue14Bit = noteOn.velocityPitchValue14Bit;
                                }
                                else
                                {
                                    oMidi.velocityPitchValue14Bit = (((oMidi.inVelocity & 0x7f) << 7) | (oMidi.inVelocity & 0x7f)) - 8192;
                                }

                                ornamentNoteOnKeys.push(oMidi.inKey);

                                doNoteOn(oMidi);
                            }
                            break;
                        }
                        case "chordOff":
                        {
                            let noteOffs = msg.noteOffs;
                            for(let i = 0; i < noteOffs.length; i++)
                            {
                                let currentChanNoteOns = chanControls.currentNoteOns,
                                    note = currentChanNoteOns.find(x => x.inKey === noteOffs[i].key);                                

                                if(note !== undefined)
                                {
                                    note.noteOff();

                                    let index = currentChanNoteOns.indexOf(note);
                                    currentChanNoteOns.splice(index, 1);

                                    index = ornamentNoteOnKeys.indexOf(note.inKey);
                                    ornamentNoteOnKeys.splice(index, 1);
                                }
                            }
                            break;
                        }                        
                    }
                }

                let ornamentMsgs = ornamentDef.msgs,
                    doRepeats = ornamentDef.repeat; 

                do
                {
                    for(var i = 0; i < ornamentMsgs.length; i++)
                    {
                        let ornamentMsg = ornamentMsgs[i];

                        await doMsgAsync(inMidi, ornamentMsg, ornamentDef.ornamentNoteOnKeys, ornamentDef.cancel);

                        if(ornamentDef.cancel === true)
                        {
                            break;
                        }
                    }
                } while((ornamentDef.cancel === false) && (doRepeats === true));

                ornamentDef.complete = true;
            }

            let inChannelPerKeyArray = channelControls[inChannel].channelPerKeyArray,
                channel = (inChannelPerKeyArray.length > 0) ? inChannelPerKeyArray[inKey] : inChannel,
                chanControls = channelControls[channel],
                chanPresets = channelPresets[channel],
                inKeyOrnamentDef = chanControls.inKeyOrnamentDefs.find(x => x.inKey === inKey),
                ornamentDef = (inKeyOrnamentDef === undefined) ? undefined : inKeyOrnamentDef.ornamentDef,
                midi = {};

            if(inVelocity === 0)
            {
                let currentNoteOns = chanControls.currentNoteOns,
                    note = currentNoteOns.find(note => note.inKey === inKey);

                if(note !== undefined)
                {
                    note.noteOff();
                }

                return;
            }

            midi = getMidiAttributes(chanPresets, chanControls, inKey, inVelocity);

            if(ornamentDef !== undefined)
            {
                console.assert(inKeyOrnamentDef.inKey === midi.inKey);
                ornamentDef.complete = false;
                ornamentDef.cancel = false;
                ornamentDef.ornamentNoteOnKeys = [];
                playOrnamentAsync(midi, ornamentDef);
            }
            else
            {
                doNoteOn(midi);
            }
        },

        noteOff = async function(inChannel, inKey)
        {
            // Written with ChatGPT's help. See also the calling code.
            // I've optimized the timeoutMs and maxTimeoutMs values experimentally.
            function waitUntil(conditionFunction)
            {
                return new Promise((resolve, reject) =>
                {
                    const timeoutMs = 10,
                        maxTimeoutMs = 500,                        
                        startTime = Date.now();

                    function checkCondition()
                    {
                        if(conditionFunction())
                        {
                            resolve(); // Condition is met, resolve the Promise
                            //console.log(`waitUntil resolved after ${Date.now() - startTime}ms.`);
                        }
                        else if(Date.now() - startTime >= maxTimeoutMs)
                        {
                            reject(new Error('Timeout exceeded')); // Reject if timeout is exceeded
                        }
                        else
                        {
                            setTimeout(checkCondition, timeoutMs); // Check again after a short interval
                        }
                    }

                    checkCondition(); // Start checking the condition
                });
            }

            function doOrnamentNoteOffs(chanControls, ornamentDef)
            {
                let ornamentNoteOnKeys = ornamentDef.ornamentNoteOnKeys,
                    currentChanNoteOns = chanControls.currentNoteOns;

                for(let i = 0; i < ornamentNoteOnKeys.length; i++)
                {
                    let key = ornamentNoteOnKeys[i],
                        index = currentChanNoteOns.findIndex(note => note.inKey === key);

                    currentChanNoteOns[index].noteOff(); // ignore returned stopTime
                    currentChanNoteOns.splice(index, 1);
                }
                ornamentNoteOnKeys.length = 0;
            }

            let inChannelPerKeyArray = channelControls[inChannel].channelPerKeyArray,
                channel = (inChannelPerKeyArray.length > 0) ? inChannelPerKeyArray[inKey] : inChannel,
                chanControls = channelControls[channel],
                currentNoteOns = chanControls.currentNoteOns,
                inKeyOrnamentDefs = chanControls.inKeyOrnamentDefs,
                inKeyOrnamentDef = inKeyOrnamentDefs.find(x => x.inKey === inKey),
                ornamentDef = (inKeyOrnamentDef === undefined) ? undefined : inKeyOrnamentDef.ornamentDef,
                ornamentNoteOnKeys = (ornamentDef === undefined) ? undefined : ornamentDef.ornamentNoteOnKeys,
                stopTime = 0;

            if(ornamentNoteOnKeys !== undefined && ornamentNoteOnKeys.length > 0)
            {
                ornamentDef.cancel = true;
                try
                {
                    await waitUntil(() => {return ornamentDef.complete});
                }
                catch(error)
                {
                    throw 'Condition not met:' + error.message;
                }

                doOrnamentNoteOffs(chanControls, ornamentDef);
            }
            else
            {
                for(var index = currentNoteOns.length - 1; index >= 0; index--)
                {
                    if(currentNoteOns[index].inKey === inKey)
                    {
                        stopTime = currentNoteOns[index].noteOff();
                        currentNoteOns.splice(index, 1);
                    }
                }
            }

            return stopTime;
        },

        /*****************************************/

        setFontAndTuningDefaults = function(channel)
        {
            updateBankIndex(channel, 0); // also sets channelPresets[channel].presets and channelControl.presetIndex to 0.
            updateMixtureIndex(channel, 0);
            updateTuningGroupIndex(channel, 0);  // sets channelControl.tuning to the first tuning in the group.
            updateSemitonesOffset(channel, 0); // semitonesOffset will be added to the key's tuning value in NoteOn. 
            updateCentsOffset(channel, 0); // centsOffset/100 will be added to the key's tuning value in NoteOn. 
        },
        setControllerDefaults = function(channel)
        {
            let constants = ResSynth.constants,
                controlDefaultValue = constants.controlDefaultValue,
                pitchWheelDefaultValue = constants.commandDefaultValue(CMD.PITCHWHEEL);

            updatePitchWheel(channel, pitchWheelDefaultValue, pitchWheelDefaultValue);
            updateModWheel(channel, controlDefaultValue(CTL.MODWHEEL));
            updateVolume(channel, controlDefaultValue(CTL.VOLUME));
            updatePan(channel, controlDefaultValue(CTL.PAN));
            updateReverberation(channel, controlDefaultValue(CTL.REVERBERATION));
            updatePitchWheelSensitivity(channel, controlDefaultValue(CTL.PITCH_WHEEL_SENSITIVITY));
            updateVelocityPitchSensitivity(channel, controlDefaultValue(CTL.VELOCITY_PITCH_SENSITIVITY));
        },

        CMD = ResSynth.constants.COMMAND,
        CTL = ResSynth.constants.CONTROL,
        MISC = ResSynth.constants.MISC,

        // The commands and controls arrays are part of a standard ResSynth synth's interface,
        // These attributes are not actually used by the ResidentSynth's code.
        commands =
            [
                //Neither SYSEX, AFTERTOUCH nor CHANNEL_PRESSURE are implemented.
                CMD.NOTE_OFF,
                CMD.NOTE_ON,
                CMD.CONTROL_CHANGE,
                CMD.PRESET,
                CMD.PITCHWHEEL
            ],

        // The commands and controls arrays are part of a standard ResSynth synth's interface,
        // These attributes are not actually used by the ResidentSynth's code.
        controls =
            [
                // standard 3-byte controllers.
                CTL.BANK,
                CTL.MODWHEEL,
                CTL.VOLUME,
                CTL.PAN,
                // standard 2-byte controllers.
                CTL.ALL_CONTROLLERS_OFF,
                CTL.ALL_SOUND_OFF,

                // custom controls (see constants.js)
                CTL.REVERBERATION,
                CTL.PITCH_WHEEL_SENSITIVITY,
                CTL.MIXTURE_INDEX, 
                CTL.TUNING_GROUP_INDEX,
                CTL.TUNING_INDEX,
                CTL.SEMITONES_OFFSET,
                CTL.CENTS_OFFSET,
                CTL.SET_SETTINGS,
                CTL.VELOCITY_PITCH_SENSITIVITY,
                CTL.SET_KEYBOARD_ORNAMENT_DEFS,
                CTL.SET_KEYBOARD_SPLIT_ARRAY
            ],

        ResidentSynth = function()
        {
            if(!(this instanceof ResidentSynth))
            {
                return new ResidentSynth();
            }

            let AudioContextFunc = (window.AudioContext || window.webkitAudioContext);

            audioContext = new AudioContextFunc();
            channelPresets.webAudioFont = getWebAudioFont(audioContext);

            // WebMIDIAPI §4.6 -- MIDIPort interface
            // See https://github.com/notator/WebMIDISynthHost/issues/23
            // and https://github.com/notator/WebMIDISynthHost/issues/24
            Object.defineProperty(this, "id", {value: "ResidentSynth_v1", writable: false});
            Object.defineProperty(this, "manufacturer", {value: "james ingram (with thanks to sergey surikov)", writable: false});
            Object.defineProperty(this, "name", {value: "ResidentSynth", writable: false});
            Object.defineProperty(this, "type", {value: "output", writable: false});
            Object.defineProperty(this, "version", {value: "2", writable: false});

            /*** Extensions for software synths ***/
            // The synth author's web page hosting the synth. 
            Object.defineProperty(this, "url", {value: "https://github.com/notator/ResidentSynthHostTestSite", writable: false});
            // The commands supported by this synth (see above).
            Object.defineProperty(this, "commands", {value: commands, writable: false});
            // The controls supported by this synth (see above).
            Object.defineProperty(this, "controls", {value: controls, writable: false});
            // If isMultiChannel is false or undefined, the synth ignores the channel nibble in MIDI messages
            Object.defineProperty(this, "isMultiChannel", {value: true, writable: false});
            // If isPolyphonic is false or undefined, the synth can only play one note at a time
            Object.defineProperty(this, "isPolyphonic", {value: true, writable: false});

            /**********************************************************************************************/
            // attributes specific to this installation of the ResidentSynth
            Object.defineProperty(this, "webAudioFont", {value: channelPresets.webAudioFont, writable: false});
            Object.defineProperty(this, "mixtures", {value: getMixtures(), writable: false});
            Object.defineProperty(this, "tuningGroups", {value: getTuningGroups(), writable: false});
            Object.defineProperty(this, "settingsPresets", {value: getSettingsPresets(ResSynth.settingsPresets), writable: false});

            setPrivateChannelPerKeyArrays();
            setPrivateKeyOrnamentsArrays();
        },

        API =
        {
            ResidentSynth: ResidentSynth // constructor
        };

    // end var

    // WebMIDIAPI §6.2 -- MIDIPort interface
    // See https://github.com/notator/WebMIDISynthHost/issues/24
    // This is called after user interaction with the page.
    // This function sets internal default values for all the synth's commands, and controls in all channels.
    // As per the Web MIDI API, this function returns a promise that needs to be handled (its async).
    ResidentSynth.prototype.open = async function()
    {
        // Create and connect the channel AudioNodes:
        function audioNodesConfig(audioContext, finalGainNode)
        {
            let channelInfo = {};

            channelInfo.panNode = audioContext.createStereoPanner();
            channelInfo.reverberator = new ResSynth.reverberator.Reverberator(audioContext);
            channelInfo.modNode = audioContext.createOscillator(),
                channelInfo.modGainNode = audioContext.createGain();
            channelInfo.gainNode = audioContext.createGain();
            channelInfo.inputNode = channelInfo.panNode;

            channelInfo.panNode.connect(channelInfo.reverberator.input);
            channelInfo.reverberator.output.connect(channelInfo.gainNode);
            channelInfo.modNode.connect(channelInfo.modGainNode);
            channelInfo.modGainNode.connect(channelInfo.gainNode.gain);
            channelInfo.gainNode.connect(finalGainNode);

            channelInfo.modNode.type = 'sine';
            channelInfo.modNode.start();

            return channelInfo;
        }

        audioContext.resume().then(() => {console.log('AudioContext resumed successfully');});

        channelAudioNodes.finalGainNode = audioContext.createGain();
        channelAudioNodes.finalGainNode.connect(audioContext.destination);

        for(var channel = 0; channel < 16; channel++)
        {
            channelAudioNodes.push(audioNodesConfig(audioContext, channelAudioNodes.finalGainNode));  

            let controlState = {};
            channelControls.push(controlState);

            channelControls[channel].currentNoteOns = [];

            channelControls[channel].channelPerKeyArray = [];
            channelControls[channel].inKeyOrnamentDefs = [];

            setFontAndTuningDefaults(channel);
            setControllerDefaults(channel);            
        }  
    };

    // WebMIDIAPI §6.2 -- MIDIPort interface
    // As per the Web MIDI API, this function returns a promise that needs to be handled (its async).
    ResidentSynth.prototype.close = async function()
    {
        if(channelAudioNodes.length > 0)
        {
            for(var i = 0; i < 16; i++)
            {
                channelAudioNodes[i].panNode.disconnect();
                channelAudioNodes[i].reverberator.disconnect();
                channelAudioNodes[i].gainNode.disconnect();
            }
            channelAudioNodes.finalGainNode.disconnect();
            channelAudioNodes.length = 0;
            console.log("residentSynth closed.");
        }
    };

    // WebMIDIAPI §6.4 MIDIOutput interface
    // This function is provided because it is part of the MIDIOutput interface,
    // but there seems to be no reason to implement it: The send() function does not
    // support timestamps, so all messages are sent immediately.
    ResidentSynth.prototype.clear = function()
    {
        throw "Not implemented exception.";
    };

    // WebMIDIAPI §6.4 MIDIOutput interface
    // This synth does not support timestamps (05.11.2015)
    ResidentSynth.prototype.send = function(messageData, ignoredTimestamp)
    {
        var
            command = messageData[0] & 0xF0,
            channel = messageData[0] & 0xF,
            control = messageData[1],
            value = messageData[2];

        function handleControl(channel, control, value)
        {
            // Converts the midiValue (in range 0..127) to an integer value in range -50..+50.
            // Used by both setSemitonesOffset(...) and setCentsOffset(...).
            function getOffsetValue(midiValue)
            {
                return Math.round((midiValue / 1.27) - 50);
            }

            // Note that the ResidentSynthHost does not call this function (i.e. send SET_SETTINGS messages)
            // because it needs to update the ResidentSynth's settings incrementally.
            // This function is provided for use in other applications, such as the AssistantPerformer.
            function setSettings(channel, settingsIndex)
            {
                let settings = settingsPresets[settingsIndex];

                updateBankIndex(channel, settings.bankIndex);
                channelControls[channel].presetIndex = settings.presetIndex;
                updateMixtureIndex(channel, settings.mixtureIndex);
                updateTuningGroupIndex(channel, settings.tuningGroupIndex);
                updateTuning(channel, settings.tuningIndex);
                updateSemitonesOffset(channel, settings.semitonesOffset);
                updateCentsOffset(channel, settings.centsOffset);
                updatePitchWheel(channel, settings.pitchWheel, settings.pitchWheel);
                updateModWheel(channel, settings.modWheel);
                updateVolume(channel, settings.volume);
                updatePan(channel, settings.pan);
                updateReverberation(channel, settings.reverberation);
                updatePitchWheelSensitivity(channel, settings.pitchWheelSensitivity);
                updateTriggerKey(channel, settings.triggerkey);
                updateVelocityPitchSensitivity(channel, settings.velocityPitchSensitivity);
                updateKeyboardSplit(channel, settings.keyboardSplitIndex);
                updateInKeyOrnamentDefs(channel, settings.keyboardOrnamentsArrayIndex);
            }

            switch(control)
            {
                case CTL.BANK:
                    updateBankIndex(channel, value);
                    break;
                case CTL.MODWHEEL:
                    updateModWheel(channel, value);
                    break;
                case CTL.VOLUME:
                    updateVolume(channel, value);
                    break;
                case CTL.PAN:
                    updatePan(channel, value);
                    break;
                case CTL.MIXTURE_INDEX:
                    updateMixtureIndex(channel, value);
                    break;
                case CTL.REVERBERATION:
                    updateReverberation(channel, value);
                    break;
                case CTL.PITCH_WHEEL_SENSITIVITY:
                    updatePitchWheelSensitivity(channel, value);
                    break;
                case CTL.SEMITONES_OFFSET:
                    channelControls[channel].semitonesOffset = getOffsetValue(value);
                    break;
                case CTL.CENTS_OFFSET:
                    channelControls[channel].centsOffset = getOffsetValue(value);
                    break;
                case CTL.SET_SETTINGS:
                    setSettings(channel, value);
                    break;
                case CTL.TUNING_GROUP_INDEX:
                    updateTuningGroupIndex(channel, value); // sets tuning to the first tuning in the group
                    break;
                case CTL.TUNING_INDEX:
                    updateTuning(channel, value); // sets tuning to the tuning at value (=index) in the group 
                    break;
                case CTL.VELOCITY_PITCH_SENSITIVITY:
                    updateVelocityPitchSensitivity(channel, value);
                    break;
                case CTL.SET_KEYBOARD_ORNAMENT_DEFS:
                    updateInKeyOrnamentDefs(channel, value);
                    break;
                case CTL.SET_KEYBOARD_SPLIT_ARRAY:
                    updateKeyboardSplit(channel, value); 
                    break;                    
                case CTL.ALL_CONTROLLERS_OFF:
                    allSoundOff();  // all channels (split means we don't know which channels are sounding)
                    setControllerDefaults(channel); // only the current channel
                    break;
                case CTL.ALL_SOUND_OFF:
                    allSoundOff(); // all channels (split means we don't know which channels are sounding)
                    break;
                default:
                    console.warn(`Controller ${control.toString(10)} (0x${control.toString(16)}) is not supported.`);
            }
        }

        switch(command)
        {
            case CMD.NOTE_OFF:
                noteOff(channel, control);
                break;
            case CMD.NOTE_ON:
                if(value === 0)
                {
                    noteOff(channel, control);
                }
                else
                {
                    noteOn(channel, control, value);
                }
                break;
            case CMD.CONTROL_CHANGE:
                handleControl(channel, control, value);
                break;
            case CMD.PRESET:
                channelControls[channel].presetIndex = control;
                break;
            case CMD.PITCHWHEEL:
                updatePitchWheel(channel, control, value);
                break;
            default:
                console.assert(false, "The residentSynth does not process\n" +
                    "SYSEX, AFTERTOUCH or CHANNEL_PRESSURE messages.");
                break;
        }
    };

    ResidentSynth.prototype.setAudioOutputDevice = function(deviceId)
    {
        setAudioOutputDevice(deviceId);
    };

    // see close() above...
    ResidentSynth.prototype.disconnect = function()
    {
        throw "Not implemented error.";
    };

    return API;

}(window));

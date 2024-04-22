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
        currentMasterNotes = [], // contains the notes created as a response to the noteOn(inChannel, inKey, inVelocity) function
        mixtures = [], // set by getMixtures()
        tuningGroups = [], // set by getTuningGroups()
        inKeyOrnamentDefsArrays = [], // initialized by setPrivateOrnamentPerKeyArrays().

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
                        if(presets[presetIndex] === undefined)
                        {
                            continue;
                        }

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

            function getFinalizedPresets(bankPresetNames, percussionPresets)
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

                let bankPresets = [];

                for(var presetIndex = 0; presetIndex < bankPresetNames.length; presetIndex++)
                {
                    if(bankPresetNames[presetIndex] === undefined)
                    {
                        continue;
                    }

                    let isPercussion = false,
                        presetName = bankPresetNames[presetIndex],
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

                    bankPresets[presetIndex] = {name: presetOptionName, originalPresetIndex: originalPresetIndex, zones: zones, isPercussion: isPercussion};
                }

                return bankPresets;
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
                    if(presets[presetIndex] === undefined)
                    {
                        continue;
                    }
                    
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
                                keyIncr, // extraNote[0]
                                velIncr; // extraNote[1]

                            if(dataLength > 0)
                            {
                                console.assert(dataLength === 2);
                                keyIncr = extraNote[0]
                                velIncr = extraNote[1]
                                console.assert(Number.isInteger(keyIncr) && keyIncr >= -127 && keyIncr <= 127);
                                console.assert(Number.isInteger(velIncr) && velIncr >= -127 && velIncr <= 127);

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

            if(ResSynth.mixtureDefs !== undefined && ResSynth.mixtureDefs.length > 0)
            {
                mixtures = ResSynth.mixtureDefs;
                checkMixturesInputFile(mixtures);
            }

            let noMixture = {};
            noMixture.name = "no mixture";
            noMixture.extraNotes = [];
            noMixture.except = [];

            mixtures.unshift(noMixture);

            return mixtures;
        },

        getTuningGroups = function()
        {
            let tuningsFactory = new ResSynth.tuningsFactory.TuningsFactory(),
                tuningGroupDefs = ResSynth.tuningDefs,
                tuningType = ResSynth.tuningType;

            if(tuningGroupDefs !== undefined || tuningGroupDefs.length > 0)
            {
                for(var i = 0; i < tuningGroupDefs.length; i++)
                {
                    let tuningGroupDef = tuningGroupDefs[i],
                        tuningDefs = tuningGroupDef.tunings,
                        tuningGroup = [];

                    tuningGroup.name = tuningGroupDef.name;

                    switch(tuningGroupDef.ctor)
                    {
                        case tuningType.CONSTANT_FIFTH_FACTOR:
                            {
                                for(let k = 0; k < tuningDefs.length; k++)
                                {
                                    let tuningDef = tuningDefs[k],
                                        root = tuningDef.root,
                                        factor = tuningDef.factor,
                                        tuning = tuningsFactory.getTuningFromConstantFifthFactor(root, factor);

                                    tuning.name = tuningDef.name;
                                    tuningGroup.push(tuning);
                                }
                                break;
                            }
                        case tuningType.CONSTANT_MIDI_KEY_FACTOR:
                            {
                                for(let k = 0; k < tuningDefs.length; k++)
                                {
                                    let tuningDef = tuningDefs[k],
                                        keysPerOctave = tuningDef.keysPerOctave,
                                        tuning = tuningsFactory.getTuningFromKeysPerOctave(keysPerOctave);

                                    tuning.name = tuningDef.name;
                                    tuningGroup.push(tuning);
                                }
                                break;
                            }
                        case tuningType.WARPED_OCTAVES:
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
                        case tuningType.WARPED_GAMUT:
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
                        case tuningType.BAROQUE:
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
                        case tuningType.ODD_HARMONIC:
                        case tuningType.PRIME_HARMONIC:
                        case tuningType.INVERTED_ODD_HARMONIC:
                        case tuningType.INVERTED_PRIME_HARMONIC:
                            {
                                let tunings = tuningsFactory.getHarmonicTunings(tuningGroupDef);

                                for(let k = 0; k < tunings.length; k++)
                                {
                                    tuningGroup.push(tunings[k]);
                                }
                                break;
                            }
                        default:
                            console.assert(false, "Unknown tuning type.");
                    }

                    tuningGroups.push(tuningGroup);
                }
            }

            if(tuningGroups.length === 0)
            {
                // default tuning
                let tuningGroup = [],
                    tuning = tuningsFactory.getEqualTemperamentTuning();

                tuning.name = "Equal Temperament";
                tuningGroup.push(tuning);
                tuningGroups.push(tuningGroup);
            }

            return tuningGroups;
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
            function getInKeyOrnamentDefs(ornamentPerKeysString, fileOrnamentDefs)
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

                let inKeyOrnamentDefs = [];

                if(ornamentPerKeysString.length === 0)
                {
                    throw `ornamentPerKeysString may not be empty`;
                }

                const components = ornamentPerKeysString.split(";");

                for(const component of components)
                {
                    const [keyStr, ornamentName] = component.trim().split(":"),
                        inKeyOrnamentDef = getInKeyOrnamentDef(keyStr, ornamentName, fileOrnamentDefs);

                    inKeyOrnamentDefs.push(inKeyOrnamentDef);
                }

                checkKeys(inKeyOrnamentDefs);

                return inKeyOrnamentDefs;
            }

            const ornamentPerKeysStrings = ResSynth.ornamentPerKeysStrings,
                fileOrnamentDefs = ResSynth.ornamentDefs;

            inKeyOrnamentDefsArrays.push([]); // an empty array means there are no ornaments defined.

            if(ornamentPerKeysStrings !== undefined && fileOrnamentDefs !== undefined)
            {
                try
                {
                    for(var i = 0; i < ornamentPerKeysStrings.length; i++)
                    {
                        const keyOrnamentsString = ornamentPerKeysStrings[i],
                            inKeyOrnamentDefs = getInKeyOrnamentDefs(keyOrnamentsString, fileOrnamentDefs);

                        inKeyOrnamentDefsArrays.push(inKeyOrnamentDefs); // global inKeyOrnamentDefsArrays
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

        /*****************************************/
        /* Control Functions */

        // also sets channelPresets[channel] and channelControl.presetIndex to 0.
        updateBankIndex = function(channel, bankIndex)
        {
            channelPresets[channel] = channelPresets.webAudioFont[bankIndex].presets; // throws an exception if bankIndex is out of range

            channelControls[channel].bankIndex = bankIndex;
            channelControls[channel].presetIndex = 0;
        },
        updateMixtureIndex = function(channel, mixtureIndex)
        {
            channelControls[channel].mixtureIndex = mixtureIndex;
        },

        updateTuning = function(channel, tuningIndex)
        {
            let chanControls = channelControls[channel],
                tuningGroupIndex = chanControls.tuningGroupIndex;

            chanControls.tuningIndex = tuningIndex;
            chanControls.tuning = tuningGroups[tuningGroupIndex][tuningIndex]; // throws an exception if tunngGroupIndex and/or tuningIndex is out of range
        },

        // sets chanControl.tuning to the first tuning in the group
        updateTuningGroupIndex = function(channel, tuningGroupIndex)
        {
            channelControls[channel].tuningGroupIndex = tuningGroupIndex;
            updateTuning(channel, 0);
        },

        updateSemitonesOffset = function(channel, semitonesOffset)
        {
            channelControls[channel].semitonesOffset = semitonesOffset;
        },
        updateCentsOffset = function(channel, centsOffset)
        {
            channelControls[channel].centsOffset = centsOffset;
        },

        //returns a flat list of all the notes in the masterNote object
        getAllResidentSynthNotes = function(masterNote)
        {
            let allNotes = [],
                subNotes = masterNote.subNotes;

            if(masterNote instanceof ResSynth.residentSynthNote.ResidentSynthNote) // an ornament masterNotes is not a ResidentSynthNote.
            {
                allNotes.push(masterNote);
            }

            for(let i = 0; i < subNotes.length; i++)
            {
                let subNote = subNotes[i],
                    subSubNotes = subNote.subNotes; // mixtures inside ornaments...

                allNotes.push(subNote);

                for(var j = 0; j < subSubNotes.length; j++)
                {
                    allNotes.push(subSubNotes[j]);
                }
            }
            return allNotes;

        },

        updatePitchWheel = function(channel, data1, data2)
        {
            var pitchWheel14Bit = (((data2 & 0x7f) << 7) | (data1 & 0x7f)) - 8192;

            // data2 is the MSB, data1 is LSB.
            //console.log("updatePitchWheel() data1: " + data1 + " data2:" + data2 + " pitchWheel14Bit=" + pitchWheel14Bit + " (should be in range -8192..+8191)");

            for(let i = 0; i < currentMasterNotes.length; ++i)
            {
                let allNotes = getAllResidentSynthNotes(currentMasterNotes[i]);
                for(var j = 0; j < allNotes.length; j++)
                {
                    allNotes[j].updatePitchWheel(pitchWheel14Bit);
                }
            }

            channelControls[channel].pitchWheelData1 = data1; // for restoring channelSettings
            channelControls[channel].pitchWheelData2 = data2; // for restoring channelSettings
            channelControls[channel].pitchWheel14Bit = pitchWheel14Bit; // for new noteOns
        },

        // The value argument is in range [0..127], meaning not modulated to as modulated as possible.
        // The frequency of the modMode depends on the frequency of the note...
        updateModWheel = function(channel, value)
        {
            //console.log("ResidentSynth: ModWheel channel:" + channel + " value:" + value);
            for(let i = 0; i < currentMasterNotes.length; ++i)
            {
                let allNotes = getAllResidentSynthNotes(currentMasterNotes[i]);
                for(var j = 0; j < allNotes.length; j++)
                {
                    allNotes[j].updateModWheel(channelAudioNodes[channel].modNode, channelAudioNodes[channel].modGainNode, value);
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
            for(let i = 0; i < currentMasterNotes.length; ++i)
            {
                let allNotes = getAllResidentSynthNotes(currentMasterNotes[i]);
                for(var j = 0; j < allNotes.length; j++)
                {
                    allNotes[j].pitchWheelSensitivity = semitones; // 0..127 semitones
                    allNotes[j].updatePitchWheel(channelControls[channel].pitchWheel14Bit);
                }
            }

            channelControls[channel].pitchWheelSensitivity = semitones; // for new noteOns
        },

        updateVelocityPitchSensitivity = function(channel, data2)
        {
            channelControls[channel].velocityPitchSensitivity = data2 / 10; // semitones
        },

        updateInKeyOrnamentDefs = function(channel, inKeyOrnamentDefsIndex)
        {
            channelControls[channel].inKeyOrnamentDefs = inKeyOrnamentDefsArrays[inKeyOrnamentDefsIndex]; // throws exception if inKeyOrnamentDefsIndex is out of range
        },

        allSoundOff = function()
        {
            for(let i = currentMasterNotes.length - 1; i >= 0; i--)
            {
                let allNotes = getAllResidentSynthNotes(currentMasterNotes[i]);
                for(var j = allNotes.length - 1; j >= 0; j--)
                {
                    let note = allNotes[j]
                    note.noteOff();
                    allNotes.pop();
                }
                currentMasterNotes.pop();
            }
            console.assert(currentMasterNotes.length === 0);
        },

        midiVal = function(value)
        {
            value = (value > 127) ? 127 : value;
            value = (value < 0) ? 0 : value;

            return value;
        },

        noteOn = async function(channel, inKey, inVelocity)
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
                midi.midiPitchOffset = chanControls.semitonesOffset + (chanControls.centsOffset / 100); // valid throughout a mixture
                midi.midiPitch = midiVal(chanControls.tuning[inKey] + midi.midiPitchOffset);

                midi.velocityFactor = midi.inVelocity / 127;

                // velocityPitchSensitivityFactor is always the same for all octaves of the same absolute pitch
                let noteOn = currentMasterNotes.find(x => (x.inKey % 12) === (midi.inKey % 12));

                if(noteOn !== undefined)
                {
                    midi.velocityPitchSensitivityFactor = noteOn.velocityPitchSensitivityFactor;
                }
                else
                {
                    midi.velocityPitchSensitivityFactor = midi.velocityFactor;
                }

                return midi;
            }

            function doIndividualNoteOn(midi, masterNote)
            {
                let zone, note,
                    preset = midi.preset,
                    keyPitchBase = Math.floor(midi.midiPitch);

                zone = preset.zones.find(obj => (obj.keyRangeHigh >= keyPitchBase && obj.keyRangeLow <= keyPitchBase));
                if(!zone)
                {
                    throw "zone  not found";
                }

                note = new ResSynth.residentSynthNote.ResidentSynthNote(audioContext, zone, midi, chanControls, channelAudioNodes[channel]);

                note.noteOn();

                if(masterNote == undefined)
                {
                    currentMasterNotes.push(note);
                }
                else
                {
                    masterNote.subNotes.push(note);
                }

                return note;
            }

            function doMixture(masterNote, midi, mixtureIndex)
            {
                let mixture = mixtures[mixtureIndex], // throws exception if out of range
                    extraNotes = mixture.extraNotes,
                    exceptKeyMixtureIndex = mixture.except.find(x => x[0] === inKey);

                if(exceptKeyMixtureIndex !== undefined)
                {
                    extraNotes = mixtures[exceptKeyMixtureIndex[1]].extraNotes;
                }

                for(let i = 0; i < extraNotes.length; i++)
                {
                    let keyVel = extraNotes[i],
                        newKey = midiVal(inKey + keyVel[0]),
                        newVelocity = midiVal(inVelocity + keyVel[1]);

                    newVelocity = (newVelocity === 0) ? 1 : newVelocity;

                    // midi.preset and midi.velocityPitchSensitivityFactor have already been set, and do not change.
                    midi.midiPitch = midiVal(chanControls.tuning[newKey] + midi.midiPitchOffset);
                    midi.velocityFactor = newVelocity / 127;

                    doIndividualNoteOn(midi, masterNote);
                }
            }

            function getOrnamentMasterNote(inKey)
            {
                let ornamentMasterNote = {};
                ornamentMasterNote.inKey = inKey;
                ornamentMasterNote.subNotes = [];

                return ornamentMasterNote;
            }

            async function playOrnamentAsync(masterNote, inMidi, ornamentDef)
            {
                async function doMsgAsync(masterNote, inMidi, msg, cancel)
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
                                oMidi.midiPitchOffset = chanControls.semitonesOffset + (chanControls.centsOffset / 100);
                                oMidi.midiPitch = chanControls.tuning[oMidi.inKey] + oMidi.midiPitchOffset,
                                oMidi.inVelocity = midiVal(inMidi.inVelocity + noteOnMsg.velocityIncr);
                                oMidi.velocityFactor = oMidi.inVelocity / 127;

                                let noteOn = masterNote.subNotes[0];
                                if(noteOn !== undefined)
                                {
                                    oMidi.velocityPitchSensitivityFactor = noteOn.velocityPitchSensitivityFactor;
                                }
                                else
                                {
                                    oMidi.velocityPitchSensitivityFactor = oMidi.velocityFactor;
                                }

                                let subNote = doIndividualNoteOn(oMidi, masterNote);

                                if(chanControls.mixtureIndex > 0) // 0 is "no mixture"
                                {
                                    doMixture(subNote, oMidi, chanControls.mixtureIndex);
                                }
                            }
                            break;
                        }
                        case "chordOff":
                        {
                            let subNotes = masterNote.subNotes;
                            for(let i = 0; i < subNotes.length; i++)
                            {
                                let subNote = subNotes[i],
                                    mixtureNotes = subNote.subNotes;

                                for(var j = 0; j < mixtureNotes.length; j++)
                                {
                                    mixtureNotes[j].noteOff();
                                }
                                mixtureNotes.length = 0;
                                subNote.noteOff();
                            }
                            subNotes.length = 0;
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

                        await doMsgAsync(masterNote, inMidi, ornamentMsg, ornamentDef.cancel);

                        if(ornamentDef.cancel === true)
                        {
                            break;
                        }
                    }
                } while((ornamentDef.cancel === false) && (doRepeats === true));

                ornamentDef.complete = true;
            }

            let chanControls = channelControls[channel],
                chanPresets = channelPresets[channel],
                inKeyOrnamentDef = chanControls.inKeyOrnamentDefs.find(x => x.inKey === inKey),
                ornamentDef = (inKeyOrnamentDef === undefined) ? undefined : inKeyOrnamentDef.ornamentDef,
                midi = {};

            if(inVelocity === 0)
            {
                let note = currentMasterNotes.find(x => x.inKey === inKey);

                if(note !== undefined)
                {
                    let allNotes = getAllResidentSynthNotes(note);

                    for(let i = 0; i < allNotes.length; i++)
                    {
                        allNotes[i].noteOff();
                    }
                }

                return;
            }

            midi = getMidiAttributes(chanPresets, chanControls, inKey, inVelocity);

            if(ornamentDef !== undefined)
            {
                let ornamentMasterNote = getOrnamentMasterNote(inKey);
                currentMasterNotes.push(ornamentMasterNote);

                console.assert(inKeyOrnamentDef.inKey === midi.inKey);
                ornamentDef.complete = false;
                ornamentDef.cancel = false;

                playOrnamentAsync(ornamentMasterNote, midi, ornamentDef);
            }
            else
            {
                let masterNote = undefined;
                // 2nd argument, masterNote, is undefined here (noteOn() is the response to a keyboard event)
                masterNote = doIndividualNoteOn(midi, masterNote);

                if(chanControls.mixtureIndex > 0) // 0 is "no mixture"
                {
                    // pushes the new notes into masterNote.subNotes[]
                    doMixture(masterNote, midi, chanControls.mixtureIndex);
                }
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

            let inChannelPerKeyArray = channelControls[inChannel].channelPerKeyArray,
                channel = (inChannelPerKeyArray.length > 0) ? inChannelPerKeyArray[inKey] : inChannel,
                chanControls = channelControls[channel],
                inKeyOrnamentDefs = chanControls.inKeyOrnamentDefs,
                inKeyOrnamentDef = inKeyOrnamentDefs.find(x => x.inKey === inKey),
                ornamentDef = (inKeyOrnamentDef === undefined) ? undefined : inKeyOrnamentDef.ornamentDef,
                stopTime = 0;

            if(ornamentDef !== undefined && ornamentDef.cancel !== undefined)
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
            }

            let noteIndex = currentMasterNotes.findIndex(x => x.inKey === inKey);
            if(noteIndex >= 0)
            {
                let note = currentMasterNotes[noteIndex],
                    allResidentSynthNotes = getAllResidentSynthNotes(note);

                for(let i = 0; i < allResidentSynthNotes.length; i++)
                {
                    stopTime = allResidentSynthNotes[i].noteOff();
                }

                currentMasterNotes.splice(noteIndex, 1);
            }

            return stopTime;
        },

        /*****************************************/

        setFontAndTuningDefaults = function(channel)
        {
            updateBankIndex(channel, 0); // also sets channelPresets[channel].presets and channelControl.presetIndex to 0.
            updateMixtureIndex(channel, 0);
            updateTuningGroupIndex(channel, 0);
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
                CTL.VELOCITY_PITCH_SENSITIVITY,
                CTL.SET_KEYBOARD_ORNAMENT_DEFS,
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
            // Converts the midiValue (in range 0..127) to an integer value in range -64..+63.
            // This function is used by both setSemitonesOffset(...) and setCentsOffset(...).
            // The semitonesOffset control is currently limited to values in range -64..+63,
            // the centsOffset control is currently limited to values in range -50..+50 (i.e. midiValues in range 14..114)
            function getOffsetValue(midiValue)
            {
                return midiValue - 64;
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

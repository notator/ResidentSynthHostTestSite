/* Copyright 2020 James Ingram
 * https://james-ingram-act-two.de/
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
var ResSynth = ResSynth || {};

ResSynth.bank = (function()
{
    "use strict";

    let
        getCorrectedPresets = function(fontPresets)
        {
            // This function just corrrects errors in the Bank preset files.
            function correctWebAudioPresetErrors(originalPresetIndex, zones)
            {
                function removeRedundantBankGeneralUserGSGrandPianoZones(zones)
                {
                    let zoneIndex = zones.findIndex(z => (z.keyRangeLow === 88 && z.keyRangeHigh === 90)),
                        corrected = false;

                    if(zoneIndex > -1)
                    {
                        zones.splice(zoneIndex, 1);
                        corrected = true;
                    }
                    zoneIndex = zones.findIndex(z => (z.keyRangeLow === 61 && z.keyRangeHigh === 61));
                    if(zoneIndex > -1)
                    {
                        zones.splice(zoneIndex, 1);
                        corrected = true;
                    }
                    if(corrected)
                    {
                        // console.warn("Bank: corrected GeneralUserGS GrandPiano zones.");
                    }
                }
                function removeRedundantBankGeneralUserGSMusicBoxZones(zones)
                {
                    let zoneIndex = zones.findIndex(z => (z.keyRangeLow === 0 && z.keyRangeHigh === 80)),
                        corrected = false;

                    if(zoneIndex > -1)
                    {
                        zones.splice(zoneIndex, 1);
                        corrected = true;
                    }
                    zoneIndex = zones.findIndex(z => (z.keyRangeLow === 81 && z.keyRangeHigh === 113));
                    if(zoneIndex > -1)
                    {
                        zones.splice(zoneIndex, 1);
                        corrected = true;
                    }
                    if(corrected)
                    {
                        // console.warn("Bank: corrected GeneralUserGS MusicBox zones.");
                    }
                }
                function resetHighFluidPadZone(zones, padNumber)
                {
                    if(zones.length === 2 && zones[1].keyRangeLow === 0)
                    {
                        zones[1].keyRangeLow = zones[0].keyRangeHigh + 1;
                        zones[1].keyRangeHigh = 127;
                        // console.warn("Bank: corrected Fluid Pad " + padNumber + " (top zone).");
                    }
                }
                function correctFluidPad5Zones(zones)
                {
                    // remove the middle zone, and make the others contiguous
                    if(zones.length === 3 && zones[1].keyRangeLow === 0)
                    {
                        zones.splice(1, 1);
                        zones[1].keyRangeLow = zones[0].keyRangeHigh + 1;
                        zones[1].keyRangeHigh = 127;
                        // console.warn("Bank: corrected Fluid Pad 5 zones.");
                    }
                }

                switch(originalPresetIndex)
                {
                    case 0:
                        removeRedundantBankGeneralUserGSGrandPianoZones(zones);
                        break;
                    case 10:
                        removeRedundantBankGeneralUserGSMusicBoxZones(zones);
                        break;
                    case 89:
                        resetHighFluidPadZone(zones, 2);
                        break;
                    case 92:
                        correctFluidPad5Zones(zones);
                        break;
                    case 93:
                        resetHighFluidPadZone(zones, 6);
                        break;
                }
            }

            function checkZoneContiguity(presetName, originalPresetIndex, zones)
            {
                for(var zoneIndex = 1; zoneIndex < zones.length; zoneIndex++)
                {
                    if(zones[zoneIndex].keyRangeLow !== (zones[zoneIndex - 1].keyRangeHigh + 1))
                    {
                        throw presetName + " (originalPresetIndex:" + originalPresetIndex + "): zoneIndex " + zoneIndex + " is not contiguous!";
                    }
                }
            }

            let correctedPresets = [];

            for(let presetIndex = 0; presetIndex < fontPresets.length; ++presetIndex)
            {
                if(fontPresets[presetIndex] === undefined)
                {
                    continue;
                }

                let preset = fontPresets[presetIndex],
                    originalPresetIndex = preset.zones[0].midi; // Surikov's midi attribute (already set for non-percussion)

                if(preset.isPercussion)
                {
                    originalPresetIndex = preset.originalPresetIndex; // already set                    
                }
                else
                {
                    console.assert(preset.originalPresetIndex === originalPresetIndex);
                }

                correctWebAudioPresetErrors(originalPresetIndex, preset.zones);

                if(!preset.isPercussion)
                {
                    checkZoneContiguity(preset.name, originalPresetIndex, preset.zones);
                }                

                correctedPresets[presetIndex] = preset;
            }

            return correctedPresets;
        },

        // Returns true if all the contained zones have a buffer attribute.
        // Otherwise false.
        isReady = function()
        {
            let presets = this.presets;

            for(var presetIndex = 0; presetIndex < presets.length; presetIndex++)
            {
                if(presets[presetIndex] === undefined)
                {
                    continue;
                }

                let zones = presets[presetIndex].zones;
                for(var zoneIndex = 0; zoneIndex < zones.length; zoneIndex++)
                {
                    if(zones[zoneIndex].buffer === undefined)
                    {
                        return false;
                    }
                }
            }

            return true;
        },

        // This constructor checks for (and if necessary corrects) errors in the bank's preset files,
        // and then returns a bank containing presets whose format and attributes are the same as
        // those returned by Surikov's decodeAfterLoading() function (e.g. zone.ahdsr).
        // Enhancements are done later (in the ResidentSynth code).
        Bank = function(name, fontPresets)
        {
            if(!(this instanceof Bank))
            {
                return new Bank(name, fontPresets);
            }

            Object.defineProperty(this, "name", {value: name, writable: false});
            Object.defineProperty(this, "presets", {value: getCorrectedPresets(fontPresets), writable: false});
            Object.defineProperty(this, "isReady", {value: isReady, writable: false});
        },

        API =
        {
            Bank: Bank // constructor
        };
    // end var

    return API;
}());

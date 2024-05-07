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
        getCheckedPresets = function(fontPresets)
        {
            function checkPersussionZones(presetName, zones)
            {
                for(var zoneIndex = 0; zoneIndex < zones.length; zoneIndex++)
                {
                    let zone = zones[zoneIndex];
                    if( zone !== undefined && zone.keyRangeLow !== zone.keyRangeHigh)
                    {
                        throw `Error in zone (zoneIndex:${zoneIndex}) in preset ${presetName}`;
                    }
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

            let checkedPresets = [];

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
                    checkPersussionZones(preset.name, preset.zones);
                }
                else
                {
                    console.assert(preset.originalPresetIndex === originalPresetIndex);
                    checkZoneContiguity(preset.name, originalPresetIndex, preset.zones);                    
                }              

                checkedPresets[presetIndex] = preset;
            }

            return checkedPresets;
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
            Object.defineProperty(this, "presets", {value: getCheckedPresets(fontPresets), writable: false});
            Object.defineProperty(this, "isReady", {value: isReady, writable: false});
        },

        API =
        {
            Bank: Bank // constructor
        };
    // end var

    return API;
}());

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

ResSynth.channelSettings = (function()
{
    "use strict";

    let ChannelSettings = function(name)
    {
        if(!(this instanceof ChannelSettings))
        {
            return new ChannelSettings(name);
        }

        this.name = name;
        this.bankIndex = 0;
        this.presetIndex = 0;
        this.mixtureIndex = 0;
        this.tuningGroupIndex = 0;
        this.tuningIndex = 0;
        this.semitonesOffset = 0;
        this.centsOffset = 0;
        this.pitchWheel = 64; // send this as both data1 and data2 to the synth
        this.modWheel = 0;
        this.volume = 100;
        this.pan = 64;
        this.reverberation = 0;
        this.pitchWheelSensitivity = 2;
        this.triggerKey = 36;
        this.velocityPitchSensitivity = 0;
        this.keyboardSplitIndex = 0;
        this.keyboardOrnamentsArrayIndex = 0;

        Object.preventExtensions(this); // disallow new attribute creation 
    },

    API =
    {
        ChannelSettings: ChannelSettings // constructor
    };

    // Returns true if all attributes (except .name and .keyboardSplitIndex attributes)
    // have the same values, otherwise false.
    // Simply ignores the .name and .keyboardSplitIndex attributes.
    ChannelSettings.prototype.isEqual = function(otherSettings)
    {
        let rval = true;

        if(this.bankIndex !== otherSettings.bankIndex
        || this.presetIndex !== otherSettings.presetIndex
        || this.mixtureIndex !== otherSettings.mixtureIndex
        || this.tuningGroupIndex !== otherSettings.tuningGroupIndex
        || this.tuningIndex !== otherSettings.tuningIndex
        || this.semitonesOffset !== otherSettings.semitonesOffset
        || this.centsOffset !== otherSettings.centsOffset
        || this.pitchWheel !== otherSettings.pitchWheel
        || this.modWheel !== otherSettings.modWheel
        || this.volume !== otherSettings.volume
        || this.pan !== otherSettings.pan
        || this.reverberation !== otherSettings.reverberation
        || this.pitchWheelSensitivity !== otherSettings.pitchWheelSensitivity
        || this.triggerKey !== otherSettings.triggerKey
        || this.velocityPitchSensitivity !== otherSettings.velocityPitchSensitivity
        //|| this.keyboardSplitIndex !== otherSettings.keyboardSplitIndex
        || this.keyboardOrnamentsArrayIndex !== otherSettings.keyboardOrnamentsArrayIndex)
        {
            rval = false;
        }
        return rval;
    };

    return API;
}());

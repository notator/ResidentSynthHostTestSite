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

    let ChannelSettings = function(channel)
    {
        if(!(this instanceof ChannelSettings))
        {
            return new ChannelSettings();
        }
        this.channel = channel;
    },

    API =
    {
        ChannelSettings: ChannelSettings // constructor
    };

    ChannelSettings.prototype.setDefaults = function()
    {
        // this.channel is set by constructor, and not changed here.
        this.bankIndex = 0;
        this.presetIndex = 0;
        this.mixtureIndex = 0;
        this.tuningGroupIndex = 0;
        this.tuningIndex = 0;
        this.semitonesOffset = 0; // in range -64..+63.
        this.centsOffset = 0; // in range -50..+50.
        this.pitchWheel = 64; // send this as both data1 and data2 to the synth
        this.modWheel = 0;
        this.volume = 100;
        this.pan = 64;
        this.reverberation = 0;
        this.pitchWheelSensitivity = 2;
        this.velocityPitchSensitivity = 0;
        this.keyboardOrnamentsArrayIndex = 0;
        // triggerKey and keyboardSplitIndex are synthSettings, not channelSettings
    };

    // Returns true if the control attributes have the same values, otherwise false.
    // Ignores the .channel attribute.
    ChannelSettings.prototype.isSimilar = function(otherSettings)
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
            || this.velocityPitchSensitivity !== otherSettings.velocityPitchSensitivity
            || this.keyboardOrnamentsArrayIndex !== otherSettings.keyboardOrnamentsArrayIndex)
        {
            rval = false;
        }
        return rval;
    };

    // Returns a complete clone of the calling ChannelSettings, including
    // all control attribute values, and the .channel .name and.keyboardSplitIndex.
    // Only attributes that really exist are cloned.
    ChannelSettings.prototype.clone = function()
    {
        let clone = new ResSynth.channelSettings.ChannelSettings(this.channel);

        if(this.bankIndex !== undefined)
            clone.bankIndex = this.bankIndex;
        if(this.presetIndex !== undefined)
            clone.presetIndex = this.presetIndex;
        if(this.mixtureIndex !== undefined)
            clone.mixtureIndex = this.mixtureIndex;
        if(this.tuningGroupIndex !== undefined)
            clone.tuningGroupIndex = this.tuningGroupIndex;
        if(this.tuningIndex !== undefined)
            clone.tuningIndex = this.tuningIndex;
        if(this.semitonesOffset !== undefined)
            clone.semitonesOffset = this.semitonesOffset;
        if(this.centsOffset !== undefined)
            clone.centsOffset = this.centsOffset;
        if(this.pitchWheel !== undefined)
            clone.pitchWheel = this.pitchWheel;
        if(this.modWheel !== undefined)
            clone.modWheel = this.modWheel;
        if(this.volume !== undefined)
            clone.volume = this.volume;
        if(this.pan !== undefined)
            clone.pan = this.pan;
        if(this.reverberation !== undefined)
            clone.reverberation = this.reverberation;
        if(this.pitchWheelSensitivity !== undefined)
            clone.pitchWheelSensitivity = this.pitchWheelSensitivity;
        if(this.velocityPitchSensitivity !== undefined)
            clone.velocityPitchSensitivity = this.velocityPitchSensitivity;
        if(this.keyboardOrnamentsArrayIndex !== undefined)
            clone.keyboardOrnamentsArrayIndex = this.keyboardOrnamentsArrayIndex;

        return clone;
    };

    return API;
}());

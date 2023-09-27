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

ResSynth.synthSettings = (function()
{
    "use strict";

    // If optionalChannelSettingsArray is undefined
    //     .keyboardSplitIndex = 0
    //     .channelSettings contains 16 default ChannelSettings objects
    // else:
    //     .keyboardSplitIndex is retrieved from optionalChannelSettingsArray[0].keyboardSplitIndex.
    //     .channelSettings is set to clones of the 16 ChannelSettings objects in optionalChannelSettingsArray.
    //     An exception is thrown if:
    //         optionalChannelSettingsArray does not contain 16 ChannelSettings objects.
    //         .keyboardSplitIndex is not the same in all the ChannelSetting objects in the optionalChannelSettingsArray.
    let SynthSettings = function()
    {
        if(!(this instanceof SynthSettings))
        {
            return new SynthSettings();
        }

        this.name = "default synth settings";
        this.keyboardSplitIndex = 0;
        this.channelSettingsArray = [];
        
        for(var channel = 0; channel < 16; channel++)
        {
            this.channelSettingsArray.push(new ResSynth.channelSettings.ChannelSettings());
            console.assert(this.channelSettingsArray[0].keyboardSplitIndex === this.keyboardSplitIndex);
        }

        Object.preventExtensions(this); // disallow new attribute creation 
    },

    API =
    {
        SynthSettings: SynthSettings // constructor
    };

    // Returns a deep clone of the calling SynthSettings.
    SynthSettings.prototype.clone = function()
    {
        let clone = new ResSynth.synthSettings.SynthSettings();
        
        clone.name = this.name; // (javascript strings are passed by reference, but are immutable)
        clone.keyboardSplitIndex = this.keyboardSplitIndex;
        clone.channelSettings = [];

        console.assert(this.channelSettings.length === 16);
        for(let channel = 0; channel < 16; channel++)
        {
            clone.channelSettings.push(this.channelSettings[channel].clone());
        } 

        return clone;
    };

    return API;
}());

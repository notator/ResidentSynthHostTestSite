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

    let SynthSettings = function()
    {
        if(!(this instanceof SynthSettings))
        {
            return new SynthSettings();
        }

        this.name = "default synth settings";
        this.keyboardSplitIndex = 0;
        this.channelSettingsArray = [];

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

        for(let channel = 0; channel < this.channelSettings.length; channel++)
        {
            clone.channelSettings.push(this.channelSettings[channel].clone());
        } 

        return clone;
    };

    return API;
}());

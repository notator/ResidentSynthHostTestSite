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

ResSynth.settings = (function()
{
    "use strict";

    let Settings = function(name, channel)
    {
        if(!(this instanceof Settings))
        {
            return new Settings(name, channel);
        }

        this.name = name;
        this.channel = channel;
        this.fontIndex = 0;
        this.presetIndex = 0;
        this.mixtureIndex = 0;
        this.tuningGroupIndex = 0;
        this.tuningIndex = 0;
        this.centsOffset = 0;
        this.pitchWheel = 64; // send this as both data1 and data2 to the synth
        this.modWheel = 0;
        this.volume = 100;
        this.pan = 64;
        this.reverberation = 0;
        this.pitchWheelSensitivity = 2;
        this.triggerKey = 36;

        Object.preventExtensions(this); // disallow new attribute creation 
    },

    API =
    {
        Settings: Settings // constructor
    };

    return API;
}());

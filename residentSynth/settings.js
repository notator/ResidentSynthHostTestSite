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

    // can be called without chanControls (= residentSynth.channelControls[channel])
    let Settings = function(name, chanControls)
    {
        if(!(this instanceof Settings))
        {
            return new Settings(name, chanControls);
        }

        // defaults
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

        if(chanControls !== undefined)       
        {
            //this.bankIndex = chanControls.bankIndex;

            this.presetIndex = chanControls.presetIndex;

            //this.mixtureIndex = chanControls.mixtureIndex;
            //this.tuningGroupIndex = chanControls.tuningGroupIndex;
            //this.tuningIndex = chanControls.tuningIndex;
            //this.semitonesOffset = chanControls.semitonesOffset;
            //this.centsOffset = chanControls.centsOffset;

            this.pitchWheel = chanControls.pitchWheelData1, chanControls.pitchWheelData2; // send this as data1 and data2 to the synth


        //this.modWheel = chanControls.modWheel;
        //this.volume = chanControls.volume;
        //this.pan =  chanControls.pan;
        //this.reverberation = chanControls.reverberation;
        //this.pitchWheelSensitivity = chanControls.pitchWheelSensitivity;
        //////////////////this.triggerKey = chanControls.triggerKey; // not yet in chanControls.
        //this.velocityPitchSensitivity = chanControls.velocityPitchSensitivity;
        ///////////////////this.keyboardSplitIndex = chanControls.keyboardSplitIndex; // not yet in chanControls.
        ///////////////////this.keyboardOrnamentsArrayIndex = chanControls.keyboardOrnamentsArrayIndex; // not yet in chanControls.

        }

        Object.preventExtensions(this); // disallow new attribute creation 
    },

    API =
    {
        Settings: Settings // constructor
    };

    // Returns true if all attributes have the same values, otherwise false.
    // Ignores the "name" attribute.
    Settings.prototype.isEqual = function(otherSettings)
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
        || this.keyboardSplitIndex !== otherSettings.keyboardSplitIndex
        || this.keyboardOrnamentsArrayIndex !== otherSettings.keyboardOrnamentsArrayIndex)
        {
            rval = false;
        }
        return rval;
    };

    return API;
}());

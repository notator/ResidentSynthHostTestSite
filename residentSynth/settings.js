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

    let _name = "default settings",
        _channel = 0,
        _fontIndex = 0,
        _presetIndex = 0,
        _mixtureIndex = 0,
        _tuningGroupIndex = 0,
        _tuningIndex = 0,
        _centsOffset = 0,
        _pitchWheelData1 = 64,
        _pitchWheelData2 = 64,
        _modWheel = 0,
        _volume = 100,
        _pan = 64,
        _reverberation = 0,
        _pitchWheelSensitivity = 2,
        _triggerKey = 36,

        // getters
        setName = function(name)
        {
            _name = name;
        },
        setChannel = function(channel)
        {
            _channel = channel;
        },
        setFontIndex = function(fontIndex)
        {
            _fontIndex = fontIndex;
        },
        setPresetIndex = function(presetIndex)
        {
            _presetIndex = presetIndex;
        },
        setMixtureIndex = function(mixtureIndex)
        {
            _mixtureIndex = mixtureIndex;
        },
        setTuningGroupIndex = function(tuningGroupIndex)
        {
            _tuningGroupIndex = tuningGroupIndex;
        },
        setTuningIndex = function(tuningIndex)
        {
            _tuningIndex = tuningIndex;
        },
        setCentsOffset = function(centsOffset)
        {
            _centsOffset = centsOffset;
        },
        setPitchWheelData1 = function(pitchWheelData1)
        {
            _pitchWheelData1 = pitchWheelData1;
        },
        setPitchWheelData2 = function(pitchWheelData2)
        {
            _pitchWheelData2 = pitchWheelData2;
        },
        setModWheel = function(modWheel)
        {
            _modWheel = modWheel;
        },
        setVolume = function(volume)
        {
            _volume = volume;
        },
        setPan = function(pan)
        {
            _pan = pan;
        },
        setReverberation = function(reverberation)
        {
            _reverberation = reverberation;
        },
        setPitchWheelSensitivity = function(pitchWheelSensitivity)
        {
            _pitchWheelSensitivity = pitchWheelSensitivity;
        },
        setTriggerKey = function(triggerKey)
        {
            _triggerKey = triggerKey;
        },

        // getters
        getName = function(name)
        {
            return _name;
        },
        getChannel = function()
        {
            return _channel;
        },
        getFontIndex = function()
        {
            return _fontIndex;
        },
        getPresetIndex = function()
        {
            return _presetIndex;
        },
        getMixtureIndex = function()
        {
            return _mixtureIndex;
        },
        getTuningGroupIndex = function()
        {
            return _tuningGroupIndex;
        },
        getTuningIndex = function()
        {
            return _tuningIndex;
        },
        getCentsOffset = function()
        {
            return _centsOffset;
        },
        getPitchWheelData1 = function()
        {
            return _pitchWheelData1;
        },
        getPitchWheelData2 = function()
        {
            return _pitchWheelData2;
        },
        getModWheel = function()
        {
            return _modWheel;
        },
        getVolume = function()
        {
            return _volume;
        },
        getPan = function()
        {
            return _pan;
        },
        getReverberation = function()
        {
            return _reverberation;
        },
        getPitchWheelSensitivity = function()
        {
            return _pitchWheelSensitivity;
        },
        getTriggerKey = function()
        {
            return _triggerKey;
        },

        // Returns a new object having all the attributes (used for exporting).
        getObject = function()
        {
            let rval = {}

            rval.name = _name;
            rval.channel = _channel;
            rval.fontIndex = _fontIndex;
            rval.presetIndex = _presetIndex;
            rval.mixtureIndex = _mixtureIndex;
            rval.tuningGroupIndex = _tuningGroupIndex;
            rval.tuningIndex = _tuningIndex;
            rval.centsOffset = _centsOffset;
            rval.pitchWheelData1 = _pitchWheelData1;
            rval.pitchWheelData2 = _pitchWheelData2;
            rval.modWheel = _modWheel;
            rval.volume = _volume;
            rval.pan = _pan;
            rval.reverberation = _reverberation;
            rval.pitchWheelSensitivity = _pitchWheelSensitivity;
            rval.triggerKey = _triggerKey;

            return rval;
        },

        Settings = function(name, channel)
        {
            if(!(this instanceof Settings))
            {
                return new Settings(name, channel);
            }

            Object.defineProperty(this, "setName", {value: setName, writable: false});
            Object.defineProperty(this, "setChannel", {value: setChannel, writable: false});
            Object.defineProperty(this, "setFontIndex", {value: setFontIndex, writable: false});
            Object.defineProperty(this, "setPresetIndex", {value: setPresetIndex, writable: false});
            Object.defineProperty(this, "setMixtureIndex", {value: setMixtureIndex, writable: false});
            Object.defineProperty(this, "setTuningGroupIndex", {value: setTuningGroupIndex, writable: false});
            Object.defineProperty(this, "setTuningIndex", {value: setTuningIndex, writable: false});
            Object.defineProperty(this, "setCentsOffset", {value: setCentsOffset, writable: false});
            Object.defineProperty(this, "setPitchWheelData1", {value: setPitchWheelData1, writable: false});
            Object.defineProperty(this, "setPitchWheelData2", {value: setPitchWheelData2, writable: false});
            Object.defineProperty(this, "setModWheel", {value: setModWheel, writable: false});
            Object.defineProperty(this, "setVolume", {value: setVolume, writable: false});
            Object.defineProperty(this, "setPan", {value: setPan, writable: false});
            Object.defineProperty(this, "setReverberation", {value: setReverberation, writable: false});
            Object.defineProperty(this, "setPitchWheelSensitivity", {value: setPitchWheelSensitivity, writable: false});
            Object.defineProperty(this, "setTriggerKey", {value: setTriggerKey, writable: false});

            Object.defineProperty(this, "getName", {value: getName, writable: false});
            Object.defineProperty(this, "getChannel", {value: getChannel, writable: false});
            Object.defineProperty(this, "getFontIndex", {value: getFontIndex, writable: false});
            Object.defineProperty(this, "getPresetIndex", {value: getPresetIndex, writable: false});
            Object.defineProperty(this, "getMixtureIndex", {value: getMixtureIndex, writable: false});
            Object.defineProperty(this, "getTuningGroupIndex", {value: getTuningGroupIndex, writable: false});
            Object.defineProperty(this, "getTuningIndex", {value: getTuningIndex, writable: false});
            Object.defineProperty(this, "getCentsOffset", {value: getCentsOffset, writable: false});
            Object.defineProperty(this, "getPitchWheelData1", {value: getPitchWheelData1, writable: false});
            Object.defineProperty(this, "getPitchWheelData2", {value: getPitchWheelData2, writable: false});
            Object.defineProperty(this, "getModWheel", {value: getModWheel, writable: false});
            Object.defineProperty(this, "getVolume", {value: getVolume, writable: false});
            Object.defineProperty(this, "getPan", {value: getPan, writable: false});
            Object.defineProperty(this, "getReverberation", {value: getReverberation, writable: false});
            Object.defineProperty(this, "getPitchWheelSensitivity", {value: getPitchWheelSensitivity, writable: false});
            Object.defineProperty(this, "getTriggerKey", {value: getTriggerKey, writable: false});

            Object.defineProperty(this, "getObject", {value: getObject, writable: false});

            setName(name);
            setChannel(channel);
            // the other attributes are set to default values
        },

        API =
        {
            Settings: Settings // constructor
        };
    // end var

    return API;
}());

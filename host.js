/*
*  copyright 2015 James Ingram
*  https://james-ingram-act-two.de/
*
*  Code licensed under MIT
*
*  This file contains the implementation of the WebMIDISynthHost's GUI. 
*  The WebMIDISynthHost can host one or more WebMIDISynths and use one
*  or more SoundFonts.
*/

ResSynth.host = (function(document)
{
    "use strict";

    var
        synth = null,
        inputDevice = null,
        currentChannel = 0,
        nextSettingsIndex = 1,
        notesAreSounding = false,
        allLongInputControls = [], // used by AllControllersOff control
        triggerKey,

        getElem = function(elemID)
        {
            return document.getElementById(elemID);
        },

        enableSettingsSelect = function(bool)
        {
            let settingsSelect = getElem("settingsSelect"),
                exportSettingsButton = getElem("exportSettingsButton"),
                notBool = (bool === true) ? false : true;

            settingsSelect.disabled = notBool;
            exportSettingsButton.disabled = bool;
        },

        sendCommand = function(commandIndex, data1, data2)
        {
            var CMD = ResSynth.constants.COMMAND,
                status = commandIndex + currentChannel,
                message;

            switch(commandIndex)
            {
                case CMD.NOTE_ON:
                case CMD.NOTE_OFF:
                case CMD.AFTERTOUCH:
                case CMD.CONTROL_CHANGE:
                case CMD.PITCHWHEEL:
                    message = new Uint8Array([status, data1, data2]);
                    break;
                case CMD.PRESET:
                case CMD.CHANNEL_PRESSURE:
                    message = new Uint8Array([status, data1]);
                    break;
                default:
                    console.warn("Error: Not a command, or attempt to set the value of a command that has no value.");
            }
            synth.send(message, performance.now());
        },

        setOptions = function(select, options)
        {
            var i;

            for(i = select.options.length - 1; i >= 0; --i)
            {
                select.remove(i);
            }

            for(i = 0; i < options.length; ++i)
            {
                select.add(options[i]);
            }

            select.selectedIndex = 0;
        },

        sendLongControl = function(controlIndex, value)
        {
            sendCommand(ResSynth.constants.COMMAND.CONTROL_CHANGE, controlIndex, value);
        },

        sendShortControl = function(controlIndex)
        {
            function resetGUILongControllersAndSendButton()
            {
                let sendButton = getElem("sendButton");
                if(sendButton.disabled === true)
                {
                    sendButton.disabled = false;
                }

                for(let i = 0; i < allLongInputControls.length; ++i)
                {
                    let longInputControl = allLongInputControls[i];
                    longInputControl.setValue(longInputControl.numberInputElem.defaultValue);
                }
            }

            if(controlIndex === ResSynth.constants.CONTROL.ALL_CONTROLLERS_OFF)
            {
                resetGUILongControllersAndSendButton();
            }

            // controlIndex === ResSynth.constants.CONTROL.ALL_CONTROLLERS_OFF || controlIndex === ResSynth.constants.CONTROL.ALL_SOUND_OFF
            sendCommand(ResSynth.constants.COMMAND.CONTROL_CHANGE, controlIndex);
        },

        // sets the new channel state in both the host and the synth
        setSettings = function(settingsIndex)
        {
            let settings = ResSynth.hostSettings[settingsIndex],
                channelSelect = getElem("channelSelect"),
                fontSelect = getElem("webAudioFontSelect"),
                presetSelect = getElem("presetSelect"),
                mixtureSelect = getElem("mixtureSelect"),
                tuningGroupSelect = getElem("tuningGroupSelect"),
                tuningSelect = getElem("tuningSelect"),
                a4FrequencySelect = getElem("a4FrequencySelect"),
                triggerKeyInput = getElem("triggerKeyInput"),
                pitchWheelLongControl = getElem("pitchWheelLongControl"),
                modWheelLongControl = getElem("modWheelLongControl"),
                volumeLongControl = getElem("volumeLongControl"),
                panLongControl = getElem("panLongControl"),
                reverberationLongControl = getElem("reverberationLongControl"),
                pitchWheelSensitivityLongControl = getElem("pitchWheelSensitivityLongControl");

            // decided _not_ to silence the synth while resetting all the controls.
            // sendShortControl(ResSynth.constants.CONTROL.ALL_SOUND_OFF);

                //"channel": 0,
                //"fontIndex": 2,
                //"presetIndex": 2,
                //"mixtureIndex": 3,
                //"tuningGroupIndex": 2,
                //"tuningIndex": 2,
                //"centsOffset": 0.16,
                //"pitchWheelData1": 0,
                //"pitchWheelData2": 64,
                //"modWheel": 0,
                //"volume": 100,
                //"pan": 64,
                //"reverberation": 0,
                //"pitchWheelSensitivity": 2,
                //"triggerKey": 36

            // select controls
            if(settings.channel !== undefined)
            {
                channelSelect.selectedIndex = settings.channel;
                onChannelSelectChanged();
            }
            if(settings.fontIndex !== undefined)
            {
                fontSelect.selectedIndex = settings.fontIndex;
                onWebAudioFontSelectChanged();
            }
            if(settings.presetIndex)
            {
                presetSelect.selectedIndex = settings.presetIndex;
                onPresetSelectChanged();
            }
            if(settings.mixtureIndex !== undefined)
            {
                mixtureSelect.selectedIndex = settings.mixtureIndex;
                onMixtureSelectChanged();
            }
            if(settings.tuningGroupIndex !== undefined)
            {
                tuningGroupSelect.selectedIndex = settings.tuningGroupIndex;
                onTuningGroupSelectChanged();
            }
            if(settings.tuningIndex !== undefined)
            {
                tuningSelect.selectedIndex = settings.tuningIndex;
                onTuningSelectChanged();
            }
            if(settings.centsOffset !== undefined)
            {
                let optionsArray = Array.from(a4FrequencySelect.options),
                    index = optionsArray.findIndex(x => x.centsOffset === settings.centsOffset);
 
                a4FrequencySelect.selectedIndex = index;
                onA4FrequencySelectChanged();
            }
            // slider controls
            if(settings.pitchWheelData2 !== undefined)
            {
                // pitchWheelData1 is ignored here, because the host's pitchWheel control only uses pitchWheelData2.
                // (The appropriate data1 is calculated and sent to the synth in the pitchWheel message.)
                pitchWheelLongControl.setValue(settings.pitchWheelData2);
            }
            if(settings.modWheel !== undefined)
            {
                modWheelLongControl.setValue(settings.modWheel);
            }
            if(settings.volume !== undefined)
            {
                volumeLongControl.setValue(settings.volume);
            }
            if(settings.pan !== undefined)
            {
                panLongControl.setValue(settings.pan);
            }
            if(settings.reverberation !== undefined)
            {
                reverberationLongControl.setValue(settings.reverberation);
            }
            if(settings.pitchWheelSensitivity !== undefined)
            {
                pitchWheelSensitivityLongControl.setValue(settings.pitchWheelSensitivity);
            }
            if(settings.triggerKey !== undefined)
            {
                triggerKeyInput.value = settings.triggerKey;
                onTriggerKeyInputChanged();
            }
        },
        setInputDeviceEventListener = function(inputDeviceSelect)
        {
            function handleInputMessage(e)
            {
                // Rectifiy performed velocities so that they are in range [6..127].
                // The velocities generated by my E-MU keyboard are in range [20..127]
                // So: (deviceVelocity - 20) is in range [0..107],
                // ((deviceVelocity - 20) * 121 / 107) is in range [0..121],
                // (121 / 107) is ca. 1.1308
                // and (6 + Math.round(((deviceVelocity - 20) * 1.1308))) is in range [6..127]
                // (The E-MU keyboard's velocity response curve is set to its curve option number 5.)
                function getRectifiedEMUVelocity(deviceVelocity)
                {
                    let rectifiedVelocity = deviceVelocity; // can be 0 (E-MU sends 0 for NoteOff)
                    if(rectifiedVelocity >= 20)
                    {
                        rectifiedVelocity = 6 + Math.round((deviceVelocity - 20) * 1.1308);
                    }
                    console.log("emuVel=" + deviceVelocity.toString() + " vel=" + rectifiedVelocity.toString());

                    return rectifiedVelocity;
                }

                function updateGUI_ControlsTable(ccIndex, ccValue)
                {
                    let longInputControls = allLongInputControls.filter(elem => elem.numberInputElem.ccIndex === ccIndex);

                    // longInputControls.length will be > 1 if there is more than one control has no ccIndex.
                    // This function simply updates all the regParam controls even though only one of them has changed.
                    for(var i = 0; i < longInputControls.length; i++)
                    {
                        let longInputControl = longInputControls[i];

                        longInputControl.setValue(ccValue);
                    }
                }

                function updateGUI_CommandsTable(cmdIndex, cmdValue)
                {
                    let longInputControl = allLongInputControls.find(elem => elem.numberInputElem.cmdIndex === cmdIndex);

                    longInputControl.setValue(cmdValue);
                }

                function doTriggerAction()
                {
                    settingsSelect.selectedIndex = nextSettingsIndex;

                    setSettings(nextSettingsIndex); // sets the channel and its state in both the host and the synth

                    nextSettingsIndex = (nextSettingsIndex < (ResSynth.hostSettings.length - 1)) ? nextSettingsIndex + 1 : 0;

                    setTriggersDiv(channelSelect.options[currentChannel].hostState);

                    enableSettingsSelect(true); // disables the button
                }

                let data = e.data,
                    CMD = ResSynth.constants.COMMAND,
                    cmdIndex = data[0] & 0xF0,
                    now = performance.now();

                if(triggerKey !== undefined && cmdIndex === CMD.NOTE_ON && data[1] === triggerKey)
                {
                    if(data[2] !== 0)
                    {
                        doTriggerAction();
                    }
                }
                else if(!(cmdIndex === CMD.NOTE_OFF && data[1] === triggerKey)) // EMU never sends NOTE_OFF, but anyway...
                {
                    let msg = new Uint8Array([((cmdIndex + currentChannel) & 0xFF), data[1], data[2]]);

                    switch(cmdIndex)
                    {
                        case CMD.NOTE_OFF:
                            break;
                        case CMD.NOTE_ON:
                            if(inputDevice.name.localeCompare("E-MU Xboard49") === 0)
                            {
                                msg[2] = getRectifiedEMUVelocity(msg[2]);
                            }
                            //console.log("NoteOn: key=" + data[1] + ", velocity=" + data[2]);
                            break;
                        case CMD.AFTERTOUCH:
                            // The EMU keyboard never sends aftertouch, so this should never happen.
                            console.assert(false);
                            break;
                        case CMD.CONTROL_CHANGE:
                            updateGUI_ControlsTable(data[1], data[2]);
                            //console.log("control change: " + getMsgString(data));
                            break;
                        case CMD.PRESET:
                            //console.log("preset: " + getMsgString(data));
                            break;
                        case CMD.CHANNEL_PRESSURE:
                            //console.log("channel pressure: value=" + data[1]);
                            break;
                        case CMD.PITCHWHEEL:
                            // This host uses pitchwheel values in range 0..127, so data[1] (the fine byte) is ignored here.
                            // But note that the residentSynth _does_ use both data[1] and data[2] when responding
                            // to PITCHWHEEL messages (including those that come from the E-MU keyboard), so PITCHWHEEL
                            // messages sent from this host's GUI use a data[1] value that is calculated on the fly.
                            updateGUI_CommandsTable(cmdIndex, data[2]);
                            //console.log("pitchWheel: value=" + data[2]);
                            break;
                        default:
                            console.warn("Unknown command sent from midi input device.");
                            break;
                    }
                    synth.send(msg, now);
                }
            }

            if(inputDevice !== null)
            {
                inputDevice.removeEventListener("midimessage", handleInputMessage, false);
                inputDevice.close();
            }

            inputDevice = inputDeviceSelect.options[inputDeviceSelect.selectedIndex].inputDevice;
            if(inputDevice)
            {
                inputDevice.addEventListener("midimessage", handleInputMessage, false);
                inputDevice.open();
            }
            else
            {
                alert("Can't open input device.");
                inputDeviceSelect.selectedIndex = 0;
            }
        },

        // exported
        onInputDeviceSelectChanged = function()
        {
            let inputDeviceSelect = getElem("inputDeviceSelect");

            if(inputDeviceSelect.selectedIndex > 0)
            {
                setInputDeviceEventListener(inputDeviceSelect);
            }
            else
            {
                inputDevice = null;
            }
        },

        // exported
        // See: https://developer.chrome.com/blog/audiocontext-setsinkid/
        onAudioOutputSelectChanged = function()
        {
            let audioOutputSelect = getElem("audioOutputSelect"),
                option = audioOutputSelect.options[audioOutputSelect.selectedIndex],
                deviceId = (option.deviceId === "default") ? "" : option.deviceId;

            synth.setAudioOutputDevice(deviceId);
        },

        // Called by 'gitHub' and 'website' buttons
        openInNewTab = function(url)
        {
            var win = window.open(url, '_blank');
            win.focus();
        },

        // exported
        webAudioFontWebsiteButtonClick = function()
        {
            let webAudioFontSelect = getElem("webAudioFontSelect"),
                selectedOption = webAudioFontSelect[webAudioFontSelect.selectedIndex];

            openInNewTab(selectedOption.url);
        },

        // exported
        onChannelSelectChanged = function()
        {
            function setAndSendFontDivControlsFromState(hostChannelState)
            {
                let fontSelectIndex = hostChannelState.fontSelectIndex, // index in webAudioFontSelect
                    presetSelectIndex = hostChannelState.presetSelectIndex, // index in presetSelect
                    mixtureSelectIndex = hostChannelState.mixtureSelectIndex, // index in mixtureSelect
                    fontSelect = getElem("webAudioFontSelect"),
                    presetSelect = getElem("presetSelect"),
                    mixtureSelect = getElem("mixtureSelect");

                fontSelect.selectedIndex = fontSelectIndex;
                onWebAudioFontSelectChanged(); // sets the presets in the presetSelect and the soundFont in the synth

                presetSelect.selectedIndex = presetSelectIndex; // sets the presetSelect
                onPresetSelectChanged();  // sets the preset in the synth

                mixtureSelect.selectedIndex = mixtureSelectIndex; // sets the mixtureSelect
                onMixtureSelectChanged();  // sets the preset in the synth
            }

            function setAndSendTuningDivFromState(hostChannelState)
            {
                let tuningGroupSelect = getElem("tuningGroupSelect"),
                    tuningSelect = getElem("tuningSelect"),
                    a4FrequencySelect = getElem("a4FrequencySelect"),
                    newTuningGroupSelectIndex = hostChannelState.tuningGroupSelectIndex,
                    newTuningSelectIndex = hostChannelState.tuningSelectIndex,
                    newA4FrequencySelectIndex = hostChannelState.a4FrequencySelectIndex;

                tuningGroupSelect.selectedIndex = newTuningGroupSelectIndex;
                onTuningGroupSelectChanged();

                tuningSelect.selectedIndex = newTuningSelectIndex;
                onTuningSelectChanged();

                a4FrequencySelect.selectedIndex = newA4FrequencySelectIndex;
                onA4FrequencySelectChanged();
            }

            function setAndSendLongControlsFromState(hostChannelState)
            {
                let aftertouchLC = getElem("aftertouchLongControl"),
                    pitchWheelLC = getElem("pitchWheelLongControl"),
                    modWheelLC = getElem("modWheelLongControl"),
                    volumeLC = getElem("volumeLongControl"),
                    panLC = getElem("panLongControl"),
                    reverberationLC = getElem("reverberationLongControl"),
                    pitchWheelSensitivityLC = getElem("pitchWheelSensitivityLongControl");

                aftertouchLC.setValue(hostChannelState.aftertouchValue);
                pitchWheelLC.setValue(hostChannelState.pitchWheelValue);
                modWheelLC.setValue(hostChannelState.modWheelValue);
                volumeLC.setValue(hostChannelState.volumeValue);
                panLC.setValue(hostChannelState.panValue);
                reverberationLC.setValue(hostChannelState.reverberationValue);
                pitchWheelSensitivityLC.setValue(hostChannelState.pitchWheelSensitivityValue);
            }

            let channelSelect = getElem("channelSelect"),
                stopRecordingButton = getElem("stopRecordingButton"),
                channel = channelSelect.selectedIndex,
                channelOptions = channelSelect.options[channel],
                hostChannelState = channelOptions.hostState;

            if(stopRecordingButton.style.display === "block")
            {
                channelSelect.selectedIndex = currentChannel;
                alert("Cant change channel while recording.");
            }
            else
            {
                currentChannel = channel; // the global currentChannel is used by synth.send(...)

                setAndSendFontDivControlsFromState(hostChannelState);
                setAndSendTuningDivFromState(hostChannelState);

                setTriggersDiv(hostChannelState); // uses currentChannel

                setAndSendLongControlsFromState(hostChannelState);

                enableSettingsSelect(false);
            }
        },

        // exported
        onWebAudioFontSelectChanged = function()
        {
            let webAudioFontSelect = getElem("webAudioFontSelect"),
                channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelState = channelSelect.options[channel].hostState,
                presetSelect = getElem("presetSelect"),
                selectedSoundFontOption = webAudioFontSelect[webAudioFontSelect.selectedIndex],
                soundFont = selectedSoundFontOption.soundFont,
                presetOptionsArray = selectedSoundFontOption.presetOptionsArray;

            synth.setSoundFont(soundFont);

            setOptions(presetSelect, presetOptionsArray);

            presetSelect.selectedIndex = 0;
            onPresetSelectChanged();

            hostChannelState.fontSelectIndex = webAudioFontSelect.selectedIndex;
        },

        // exported
        onPresetSelectChanged = function()
        {
            function getPresetMsg(channel, presetIndex)
            {
                return new Uint8Array([ResSynth.constants.COMMAND.PRESET + channel, presetIndex]);
            }

            let channelSelect = getElem("channelSelect"),
                presetSelect = getElem("presetSelect"),
                mixtureSelect = getElem("mixtureSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelState = channelSelect.options[channel].hostState,
                presetIndex = presetSelect.selectedIndex,
                presetMsg = getPresetMsg(channel, presetIndex);

            synth.send(presetMsg);

            mixtureSelect.selectedIndex = hostChannelState.mixtureSelectIndex;
            onMixtureSelectChanged();

            hostChannelState.presetSelectIndex = presetSelect.selectedIndex;
        },

        // exported
        onMixtureSelectChanged = function()
        {
            function getMixtureMsg(channel, mixtureIndex)
            {
                return new Uint8Array([CMD.CONTROL_CHANGE + channel, CTL.MIXTURE_INDEX, mixtureIndex]);
            }

            let CMD = ResSynth.constants.COMMAND,
                CTL = ResSynth.constants.CONTROL,
                channelSelect = getElem("channelSelect"),
                mixtureSelect = getElem("mixtureSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelState = channelSelect.options[channel].hostState,
                mixtureIndex = mixtureSelect.options[mixtureSelect.selectedIndex].mixtureIndex,
                mixtureMessage = getMixtureMsg(channel, mixtureIndex);

            synth.send(mixtureMessage);

            hostChannelState.mixtureSelectIndex = mixtureSelect.selectedIndex;

            enableSettingsSelect(false);
        },

        // exported (c.f. onWebAudioFontSelectChanged() )
        onTuningGroupSelectChanged = function()
        {
            let channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelState = channelSelect.options[channel].hostState,
                tuningGroupSelect = getElem("tuningGroupSelect"),
                tuningSelect = getElem("tuningSelect"),
                selectedTuningGroupOption = tuningGroupSelect[tuningGroupSelect.selectedIndex],
                tuningOptionsArray = selectedTuningGroupOption.tuningOptionsArray;

            setOptions(tuningSelect, tuningOptionsArray);

            tuningSelect.selectedIndex = 0;
            onTuningSelectChanged();

            hostChannelState.tuningGroupSelectIndex = tuningGroupSelect.selectedIndex;
        },

        // exported
        onTuningSelectChanged = function()
        {
            let channelSelect = getElem("channelSelect"),
                tuningGroupIndex = getElem("tuningGroupSelect").selectedIndex,
                a4FrequencySelect = getElem("a4FrequencySelect"),
                tuningSelect = getElem("tuningSelect"),
                tuningIndex = tuningSelect.selectedIndex,
                channel = channelSelect.selectedIndex,
                hostChannelState = channelSelect.options[channel].hostState,
                CONST = ResSynth.constants,
                setTuningGroupIndexMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.TUNING_GROUP_INDEX, tuningGroupIndex]),
                setTuningIndexMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.TUNING_INDEX, tuningIndex]);

            synth.send(setTuningGroupIndexMsg);
            synth.send(setTuningIndexMsg);

            a4FrequencySelect.selectedIndex = hostChannelState.a4FrequencySelectIndex;
            onA4FrequencySelectChanged();

            hostChannelState.tuningSelectIndex = tuningIndex;
        },

        //exported (compare with onMixtureSelectChanged)
        onA4FrequencySelectChanged = function()
        {
            let channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelState = channelSelect.options[channel].hostState,
                a4FrequencySelect = getElem("a4FrequencySelect"),
                centsOffset = a4FrequencySelect[a4FrequencySelect.selectedIndex].centsOffset,
                CONST = ResSynth.constants,
                centsOffsetMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.CENTS_OFFSET, centsOffset]);

            synth.send(centsOffsetMsg);

            hostChannelState.a4FrequencySelectIndex = a4FrequencySelect.selectedIndex;

            enableSettingsSelect(false);
        },

        // Throws an exception either if nextSettingsIndex is out of range,
        // or if the settings object has no name attribute.
        setTriggersDiv = function(hostChannelState)
        {
            let triggerKeyInput = getElem("triggerKeyInput"),
                settingsNameCell = getElem("settingsNameCell"),
                hostSettings = ResSynth.hostSettings;

            triggerKeyInput.value = hostChannelState.triggerKey;
            onTriggerKeyInputChanged();

            if(nextSettingsIndex >= hostSettings.length)
            {
                throw "Error: settings out of range.";
            }
            else if(hostSettings[nextSettingsIndex].name === undefined)
            {
                throw "Error in settings file: settings must have a name.";
            }
            else
            {
                settingsNameCell.innerHTML = "next settings: " + hostSettings[nextSettingsIndex].name;
            }
        },

        onSettingsSelectChanged = function()
        {
            setSettings(getElem("settingsSelect").selectedIndex);

            enableSettingsSelect(true); // disables the button
        },

        //exported
        onExportSettingsButtonClicked = function()
        {
            let channelSelect = getElem("channelSelect"),
                fontSelect = getElem("webAudioFontSelect"),
                presetSelect = getElem("presetSelect"),
                mixtureSelect = getElem("mixtureSelect"),
                tuningGroupSelect = getElem("tuningGroupSelect"),
                tuningSelect = getElem("tuningSelect"),
                a4FrequencySelect = getElem("a4FrequencySelect"),
                triggerKeyInput = getElem("triggerKeyInput"),
                pitchWheelLongControl = getElem("pitchWheelLongControl"),
                modWheelLongControl = getElem("modWheelLongControl"),
                volumeLongControl = getElem("volumeLongControl"),
                panLongControl = getElem("panLongControl"),
                reverberationLongControl = getElem("reverberationLongControl"),
                pitchWheelSensitivityLongControl = getElem("pitchWheelSensitivityLongControl"),
                settingsName = "ch" + currentChannel.toString() + "_settings";

            const settings = {
                name: settingsName, // give this settings object a unique name when adding to the online settings.js
                channel: channelSelect.value,
                font: fontSelect.value, // executed before setPreset, sets synth presetIndex=0
                preset: presetSelect.value,
                mixture: mixtureSelect.value,
                tuningGroup: tuningGroupSelect.value, // executed before tuningIndex, sets tuningIndex=0
                tuning: tuningSelect.value,
                a4Frequency: a4FrequencySelect.value,
                triggerKey: parseInt(triggerKeyInput.value),
                pitchWheel: pitchWheelLongControl.getValue(), // done (value in range 0..127)
                modWheel: modWheelLongControl.getValue(), // done (value in range 0..127)
                volume: volumeLongControl.getValue(),// done (value in range 0..127)
                pan: panLongControl.getValue(), // done (value in range 0..127)
                reverberation: reverberationLongControl.getValue(), // done (value in range 0..127)
                pitchWheelSensitivity: pitchWheelSensitivityLongControl.getValue() // done (value in range 0..127)
            };

            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([JSON.stringify(settings, null, "\t")], {
                type: "text/plain"
            }));
            a.setAttribute("download", settingsName + ".json");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },

        // exported (c.f. onTuningSelectChanged() )
        onTriggerKeyInputChanged = function()
        {
            let triggerKeyInput = getElem("triggerKeyInput"),
                channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                channelOptions = channelSelect.options[channel],
                hostChannelState = channelOptions.hostState,
                CONST = ResSynth.constants,
                triggerKeyMsg;

            triggerKey = parseInt(triggerKeyInput.value); // also set global triggerKey (for convenience, used in handleInputMessage)
            triggerKeyMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.TRIGGER_KEY, triggerKey]);

            synth.send(triggerKeyMsg);            
            hostChannelState.triggerKey = triggerKey;

            enableSettingsSelect(false);
        },
        onPlayRecordingButtonClicked = function()
        {
            let recordingSelect = getElem("recordingSelect"),
                index = recordingSelect.selectedIndex,
                CONST = ResSynth.constants,
                playRecordingMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.PLAY_RECORDING_INDEX, index]);

            synth.send(playRecordingMsg);
        },
        // exported
        onStartRecordingButtonClicked = function()
        {
            let startRecordingButton = getElem("startRecordingButton"),
                stopRecordingButton = getElem("stopRecordingButton"),
                CONST = ResSynth.constants,
                startRecordingMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.RECORDING_ONOFF_SWITCH, CONST.MISC.ON]);

            synth.send(startRecordingMsg);

            startRecordingButton.style.display = "none";
            stopRecordingButton.style.display = "block";
        },
        // exported
        onStopRecordingButtonClicked = function()
        {
            let startRecordingButton = getElem("startRecordingButton"),
                stopRecordingButton = getElem("stopRecordingButton"),
                CONST = ResSynth.constants,
                stopRecordingMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.RECORDING_ONOFF_SWITCH, CONST.MISC.OFF]);

            synth.send(stopRecordingMsg);

            stopRecordingButton.style.display = "none";
            startRecordingButton.style.display = "block";

        },

        // exported
        onContinueAtStartClicked = function()
        {
            function setPage2Display(synth)
            {
                function setWebAudioFontSelect(webAudioFontSelect)
                {
                    function getWebAudioFontOptions(webAudioFonts)
                    {
                        let options = [];

                        for(var fontIndex = 0; fontIndex < webAudioFonts.length; fontIndex++)
                        {
                            let option = new Option("webAudioFontOption"),
                                webAudioFont = webAudioFonts[fontIndex],
                                presets = webAudioFont.presets,
                                presetOptionsArray = [];

                                for(var presetIndex = 0; presetIndex < presets.length; presetIndex++)
                                {
                                    let preset = presets[presetIndex],
                                        presetOption = new Option("presetOption");

                                    presetOption.innerHTML = preset.name;
                                    presetOption.preset = preset;
                                    presetOption.preset.mixtureIndex = undefined; // could be omitted -- included here for instructional purposes only.

                                    presetOptionsArray.push(presetOption);
                                }


                            option.innerHTML = webAudioFont.name;
                            option.soundFont = webAudioFont;
                            option.presetOptionsArray = presetOptionsArray; // used to set the presetSelect
                            option.url = "https://github.com/surikov/webaudiofont";

                            options.push(option);
                        }

                        return options;
                    }

                    let webAudioFontOptions = getWebAudioFontOptions(synth.webAudioFonts);

                    setOptions(webAudioFontSelect, webAudioFontOptions);

                    webAudioFontSelect.selectedIndex = 0;
                }

                function setPresetSelect(presetSelect, webAudioFontSelect)
                {
                    setOptions(presetSelect, webAudioFontSelect[webAudioFontSelect.selectedIndex].presetOptionsArray);

                    presetSelect.selectedIndex = 0;
                }

                function setMixtureSelect(mixtureSelect)
                {
                    function getMixtureOptions()
                    {
                        let mixtures = synth.mixtures,
                            options = [];

                        let option = new Option("mixtureOption");

                        option.innerHTML = "none";
                        option.mixtureIndex = 127; // sending the synth a MIXTURE_INDEX of 127 resets it to a "no mixture" state.
                        options.push(option);

                        console.assert(mixtures.length < 127);

                        for(var mixtureIndex = 0; mixtureIndex < mixtures.length; mixtureIndex++)
                        {
                            let option = new Option("mixtureOption");

                            option.innerHTML = mixtures[mixtureIndex].name;
                            option.mixtureIndex = mixtureIndex;

                            options.push(option);
                        }

                        return options;
                    }

                    let mixtureOptions = getMixtureOptions();

                    setOptions(mixtureSelect, mixtureOptions);

                    mixtureSelect.selectedIndex = 0;
                }

                function setTuningGroupSelect(tuningGroupSelect)
                {
                    function getTuningGroupOptions(tuningGroups)
                    {
                        let options = [];

                        for(let i = 0; i < tuningGroups.length; i++)
                        {
                            let tuningGroupOption = new Option("tuningGroupOption"),
                                tuningGroup = tuningGroups[i],
                                tuningOptionsArray = [];

                            for(var j = 0; j < tuningGroup.length; j++)
                            {
                                let tuningOption = new Option("tuningOption");

                                tuningOption.innerHTML = tuningGroup[j].name;
                                tuningOptionsArray.push(tuningOption);
                            }

                            tuningGroupOption.innerHTML = tuningGroup.name;
                            tuningGroupOption.tuningGroup = tuningGroup;
                            tuningGroupOption.tuningOptionsArray = tuningOptionsArray; // used to set the tuningSelect

                            options.push(tuningGroupOption);
                        }

                        return options;
                    }

                    let tuningGroupOptions = getTuningGroupOptions(synth.tuningGroups);
                    setOptions(tuningGroupSelect, tuningGroupOptions);
                    tuningGroupSelect.selectedIndex = 0;
                }

                function setA4FrequencySelect()
                {
                    let a4FrequencySelectCell = getElem("a4FrequencySelectCell"),
                        a4FrequencySelect = getElem("a4FrequencySelect"),
                        input = document.createElement("input"),
                        optionsArray = [];

                    for(var frequency = 440; frequency > 408; frequency -= 2)
                    {
                        let option = document.createElement("option"),
                            centsOffset = synth.tuningsFactory.getCents(440 / frequency);                       

                        option.innerHTML = frequency.toString();
                        option.centsOffset = Math.round(centsOffset);
                        optionsArray.push(option);

                        //console.log("centsOffset = " + option.centsOffset.toString());
                    }

                    setOptions(a4FrequencySelect, optionsArray);

                    input.type = "button";
                    input.className = "sendAgainButton";
                    input.value = "send again";
                    input.onclick = onTuningSelectChanged;
                    a4FrequencySelectCell.appendChild(input);
                }

                function setTuningSelect()
                {
                    function appendTuningSelect(tuningSelectCell, tuningOptionsArray)
                    {
                        var tuningSelect;

                        tuningSelect = document.createElement("select");
                        tuningSelect.id = "tuningSelect";
                        tuningSelect.className = "tuningSelect";
                        setOptions(tuningSelect, tuningOptionsArray);
                        tuningSelect.onchange = onTuningSelectChanged;
                        tuningSelectCell.appendChild(tuningSelect);
                    }

                    let tuningGroupSelect = getElem("tuningGroupSelect"),
                        tuningSelectCell = getElem("tuningSelectCell"),
                        tuningOptionsArray = tuningGroupSelect[tuningGroupSelect.selectedIndex].tuningOptionsArray;

                    appendTuningSelect(tuningSelectCell, tuningOptionsArray);
                }

                function setHostChannelStateFromLongControl(longControl, value)
                {
                    let channelSelect = getElem("channelSelect"),
                        hostChannelState = channelSelect.options[channelSelect.selectedIndex].hostState;

                    enableSettingsSelect(false);

                    if(hostChannelState !== undefined)
                    {
                        let longControlID = longControl.id;

                        switch(longControlID)
                        {
                            case "aftertouchLongControl":
                                hostChannelState.aftertouchValue = value;
                                break;
                            case "pitchWheelLongControl":
                                hostChannelState.pitchWheelValue = value;
                                break;
                            case "modWheelLongControl":
                                hostChannelState.modWheelValue = value;
                                break;
                            case "volumeLongControl":
                                hostChannelState.volumeValue = value;
                                break;
                            case "panLongControl":
                                hostChannelState.panValue = value;
                                break;
                            case "reverberationLongControl":
                                hostChannelState.reverberationValue = value;
                                break;
                            case "pitchWheelSensitivityLongControl":
                                hostChannelState.pitchWheelSensitivityValue = value;
                                break;
                            default:
                                console.assert(false, "Unknown long control");
                                break;
                        }
                    }
                }

                function setCommandsAndControlsDivs()
                {
                    // called by both commands and CCs
                    function getBasicLongInputControl(tr, name, defaultValue, infoString)
                    {
                        function getLongControlValue()
                        {
                            return this.rangeInputElem.valueAsNumber;
                        }

                        function getInputElemValue()
                        {
                            return this.valueAsNumber;
                        }

                        // sets synth and channel GUI state
                        function setLongControlValue(value)
                        {
                            this.rangeInputElem.value = value;
                            this.numberInputElem.value = value;

                            setHostChannelStateFromLongControl(this, value);

                            this.numberInputElem.onchange(); // sets synth
                        }

                        let nameStrTD = document.createElement("td");
                        tr.appendChild(nameStrTD);
                        nameStrTD.className = "left";
                        nameStrTD.innerHTML = name;

                        // this td contains the slider, number and button inputs
                        let longControlTD = document.createElement("td");
                        longControlTD.id = name + "LongControl";
                        tr.appendChild(longControlTD);

                        let rangeInputElem = document.createElement("input"),
                            numberInputElem = document.createElement("input"),
                            buttonInputElem = document.createElement("input");

                        rangeInputElem.getValue = getInputElemValue;
                        //rangeInputElem.onchange = "ResSynth.host.onLongControlComponentChanged()"; -- is set later
                        numberInputElem.getValue = getInputElemValue;
                        //numberInputElem.onchange = "ResSynth.host.onLongControlComponentChanged()"; -- is set later

                        longControlTD.appendChild(rangeInputElem);
                        longControlTD.appendChild(numberInputElem);
                        longControlTD.appendChild(buttonInputElem);

                        longControlTD.rangeInputElem = rangeInputElem;
                        longControlTD.numberInputElem = numberInputElem;
                        longControlTD.buttonInputElem = buttonInputElem;

                        longControlTD.getValue = getLongControlValue;
                        longControlTD.setValue = setLongControlValue;

                        // slider input                        
                        rangeInputElem.type = "range";
                        rangeInputElem.className = "midiSlider";
                        //rangeInputElem.id = name + "RangeInput";
                        rangeInputElem.twinInputElem = numberInputElem;
                        rangeInputElem.value = defaultValue;
                        rangeInputElem.defaultValue = defaultValue;
                        rangeInputElem.min = 0;
                        rangeInputElem.max = 127;

                        // number input                        
                        numberInputElem.type = "number";
                        numberInputElem.className = "number";
                        // numberInputElem.id = name + "NumberInput";
                        numberInputElem.twinInputElem = rangeInputElem;
                        numberInputElem.value = defaultValue;
                        numberInputElem.defaultValue = defaultValue;
                        numberInputElem.min = 0;
                        numberInputElem.max = 127;

                        // button input
                        buttonInputElem.type = "button";
                        buttonInputElem.className = "sendAgainButton";
                        buttonInputElem.value = "send again";
                        buttonInputElem.numberInputElem = numberInputElem;

                        let infoTD = document.createElement("td");
                        tr.appendChild(infoTD);
                        infoTD.innerHTML = infoString;

                        return longControlTD;
                    }

                    function setCommandsTable()
                    {
                        // sets the presetSelect and 
                        // returns an array of tr elements
                        function getCommandRows()
                        {
                            function getCommandInfos()
                            {
                                function getStandardCommandInfo(constants, cmdIndex)
                                {
                                    let info = {};

                                    info.name = constants.commandName(cmdIndex);
                                    info.defaultValue = constants.commandDefaultValue(cmdIndex);
                                    info.cmdIndex = cmdIndex;
                                    info.cmdString = "CMD " + cmdIndex.toString();

                                    return info;
                                }

                                let constants = ResSynth.constants,
                                    cmd = constants.COMMAND,
                                    aftertouch = getStandardCommandInfo(constants, cmd.AFTERTOUCH),
                                    pitchWheel = getStandardCommandInfo(constants, cmd.PITCHWHEEL),
                                    commandInfos = [];

                                commandInfos.push(aftertouch);
                                commandInfos.push(pitchWheel);

                                return commandInfos;
                            }

                            function setCommandRow(tr, name, defaultValue, cmdIndex, cmdString)
                            {
                                function baseSendCommand(cmdIndex, value)
                                {
                                    if(cmdIndex === ResSynth.constants.COMMAND.PITCHWHEEL)
                                    {
                                        // Note that:
                                        // 1. This function is called by the GUI controls, not by the EMU keyboard.
                                        // 2. The EMU keyboard generates different data1 values for the corresponding data2 values.
                                        // 3. The data1 values calculated here are such that
                                        //     a) if data2 is 64, data1 is 0.(MIDI Standard, same as EMU keyboard)
                                        //     b) data2 values are (differently) equidistant above and below data2=64.
                                        let data1 = 0,
                                            data2 = value; // default (for value === 64)

                                        if(data2 > 64)
                                        {
                                            data1 = data2;
                                        }
                                        else if(data2 < 64)
                                        {
                                            data1 = data2 * 2; // data1 is in range 0..126 for data2 0..63
                                        }

                                        //console.log("d1=" + data1 + " d2=" + data2);

                                        sendCommand(cmdIndex, data1, data2);
                                    }
                                    else if(cmdIndex === ResSynth.constants.COMMAND.AFTERTOUCH)
                                    {
                                        if(value > 0 && notesAreSounding)
                                        {
                                            // in this GUI, only the note in the notesDivIndexInput2 gets the aftertouch
                                            let noteIndex = getElem('notesDivIndexInput2').value;
                                            sendCommand(cmdIndex, noteIndex, value);
                                        }
                                    }
                                    else
                                    {
                                        // can only be AFTERTOUCH or PITCHWHEEL
                                        console.assert(false, "Error");
                                    }
                                }
                                function onCommandInputChanged(event)
                                {
                                    var target = (event === undefined) ? this : event.currentTarget,
                                        value = target.valueAsNumber,
                                        cmdIndex = target.cmdIndex;

                                    target.twinInputElem.value = value;

                                    setHostChannelStateFromLongControl(target.parentElement, value);

                                    baseSendCommand(cmdIndex, value);
                                }

                                function onSendCommandAgainButtonClick(event)
                                {
                                    var target = (event === undefined) ? this : event.currentTarget,
                                        numberInputElem = target.children[2],
                                        value = numberInputElem.valueAsNumber,
                                        cmdIndex = numberInputElem.cmdIndex;

                                    baseSendCommand(cmdIndex, value);
                                }

                                let longInputControlTD = getBasicLongInputControl(tr, name, defaultValue, cmdString);

                                longInputControlTD.cmdIndex = cmdIndex;
                                longInputControlTD.rangeInputElem.cmdIndex = cmdIndex;
                                longInputControlTD.numberInputElem.cmdIndex = cmdIndex;
                                longInputControlTD.rangeInputElem.onchange = onCommandInputChanged;
                                longInputControlTD.numberInputElem.onchange = onCommandInputChanged;
                                longInputControlTD.buttonInputElem.onchange = onSendCommandAgainButtonClick;

                                allLongInputControls.push(longInputControlTD);
                            }

                            let rval = [],
                                commandInfos = getCommandInfos();

                            for(let i = 0; i < commandInfos.length; ++i)
                            {
                                let commandInfo = commandInfos[i],
                                    name = commandInfo.name,
                                    defaultValue = commandInfo.defaultValue,
                                    cmdIndex = commandInfo.cmdIndex,
                                    cmdString = commandInfo.cmdString;

                                let tr = document.createElement("tr");
                                rval.push(tr);
                                setCommandRow(tr, name, defaultValue, cmdIndex, cmdString);
                            }

                            return rval;
                        }

                        let commandsTable = getElem("commandsTable"),
                            commandRows = getCommandRows();

                        for(let i = 0; i < commandRows.length; ++i)
                        {
                            let tr = commandRows[i];
                            commandsTable.appendChild(tr);
                        }
                    }

                    function setControlsTable()
                    {
                        // returns an array of tr elements
                        function getControlRows()
                        {
                            // 3-byte controls
                            function setLongControlRow(tr, name, defaultValue, ccIndex, regParam, ccString)
                            {
                                function onControlInputChanged(event)
                                {
                                    var target = (event === undefined) ? this : event.currentTarget,
                                        value = target.valueAsNumber,
                                        ccIndex = target.ccIndex;

                                    target.twinInputElem.value = value;

                                    setHostChannelStateFromLongControl(target.parentElement, value);

                                    sendLongControl(ccIndex, value);
                                }

                                function onPitchWheelSensitivityControlChanged(event)
                                {
                                    var target = (event === undefined) ? this : event.currentTarget,
                                        value = target.valueAsNumber,
                                        CONST = ResSynth.constants,
                                        pitchWheelSensitivityMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.PITCH_WHEEL_SENSITIVITY, value]);;

                                    target.twinInputElem.value = value;

                                    setHostChannelStateFromLongControl(target.parentElement, value);

                                    synth.send(pitchWheelSensitivityMsg);
                                }

                                function onSendControlAgainButtonClick(event)
                                {
                                    var numberInputElem = event.currentTarget.numberInputElem,
                                        ccIndex = numberInputElem.ccIndex,
                                        value = numberInputElem.valueAsNumber;

                                    sendLongControl(ccIndex, value);
                                }

                                function onPitchWheelSensitivityControlChangedAgain(event)
                                {
                                    var numberInputElem = event.currentTarget.numberInputElem,
                                        value = numberInputElem.valueAsNumber;

                                    synth.updatePitchWheelSensitivity(currentChannel, value);
                                }

                                let longInputControlTD = getBasicLongInputControl(tr, name, defaultValue, ccString);

                                if(ccIndex !== undefined)
                                {
                                    longInputControlTD.ccIndex = ccIndex;
                                    longInputControlTD.rangeInputElem.ccIndex = ccIndex;
                                    longInputControlTD.numberInputElem.ccIndex = ccIndex;

                                    longInputControlTD.rangeInputElem.onchange = onControlInputChanged;
                                    longInputControlTD.numberInputElem.onchange = onControlInputChanged;
                                    longInputControlTD.buttonInputElem.onclick = onSendControlAgainButtonClick;
                                }
                                else
                                {
                                    longInputControlTD.rangeInputElem.onchange = onPitchWheelSensitivityControlChanged;
                                    longInputControlTD.numberInputElem.onchange = onPitchWheelSensitivityControlChanged;
                                    longInputControlTD.buttonInputElem.onclick = onPitchWheelSensitivityControlChangedAgain;
                                }

                                allLongInputControls.push(longInputControlTD);
                            }

                            // 2-byte uControls
                            function setShortControlRow(tr, name, ccIndex, ccString)
                            {
                                var
                                    button,
                                    td = document.createElement("td");

                                function onSendShortControlButtonClick(event)
                                {
                                    sendShortControl(event.currentTarget.ccIndex);
                                }

                                tr.appendChild(td);
                                td.className = "left";
                                td.innerHTML = name;

                                td = document.createElement("td");
                                tr.appendChild(td);
                                button = document.createElement("input");
                                button.type = "button";
                                button.className = "sendButton";
                                button.value = "send";
                                button.ccIndex = ccIndex;
                                button.onclick = onSendShortControlButtonClick;
                                td.appendChild(button);

                                let node = document.createTextNode(ccString);
                                td.appendChild(node);
                            }

                            function getControlInfos()
                            {
                                function getStandardControlInfo(constants, ccIndex)
                                {
                                    let info = {};

                                    info.name = constants.controlName(ccIndex);
                                    info.defaultValue = constants.controlDefaultValue(ccIndex);
                                    info.ccIndex = ccIndex;
                                    info.ccString = "CC " + ccIndex.toString();

                                    return info;
                                }

                                let constants = ResSynth.constants,
                                    ctl = constants.CONTROL,
                                    modWheelData = getStandardControlInfo(constants, ctl.MODWHEEL),
                                    volumeData = getStandardControlInfo(constants, ctl.VOLUME),
                                    panData = getStandardControlInfo(constants, ctl.PAN),
                                    reverberationData = getStandardControlInfo(constants, ctl.REVERBERATION),
                                    allControllersOff = getStandardControlInfo(constants, ctl.ALL_CONTROLLERS_OFF),
                                    allSoundOff = getStandardControlInfo(constants, ctl.ALL_SOUND_OFF),
                                    pitchWheelSensitivityData = {name: "pitchWheelSensitivity", defaultValue: 2},
                                    controlInfos = [];

                                controlInfos.push(modWheelData);
                                controlInfos.push(volumeData);
                                controlInfos.push(panData);
                                controlInfos.push(reverberationData);
                                controlInfos.push(pitchWheelSensitivityData);
                                controlInfos.push(allControllersOff);
                                controlInfos.push(allSoundOff);

                                return controlInfos;
                            }

                            let rval = [],
                                controlInfos = getControlInfos();

                            for(let i = 0; i < controlInfos.length; ++i)
                            {
                                let c = ResSynth.constants,
                                    control = c.CONTROL,
                                    controlInfo = controlInfos[i],
                                    name = controlInfo.name,
                                    defaultValue = controlInfo.defaultValue,
                                    ccIndex = controlInfo.ccIndex,
                                    regParam = controlInfo.regParam, // can be undefined
                                    ccString = controlInfo.ccString,
                                    tr = document.createElement("tr");

                                rval.push(tr);

                                if(ccIndex === control.ALL_CONTROLLERS_OFF)
                                {
                                    name = name + " (set defaults)";
                                    setShortControlRow(tr, name, ccIndex, ccString);
                                }
                                else if(ccIndex === control.ALL_SOUND_OFF)
                                {
                                    setShortControlRow(tr, name, ccIndex, ccString);
                                }
                                else
                                {
                                    setLongControlRow(tr, name, defaultValue, ccIndex, regParam, ccString);
                                }
                            }

                            return rval;
                        }

                        let controlsTable = getElem("controlsTable"),
                            controlRows = getControlRows();

                        for(let i = 0; i < controlRows.length; ++i)
                        {
                            let tr = controlRows[i];
                            controlsTable.appendChild(tr);
                        }
                    }

                    allLongInputControls.length = 0;

                    setCommandsTable();

                    setControlsTable();

                    getElem("commandsAndControlsDiv").style.display = "block";

                    sendShortControl(ResSynth.constants.CONTROL.ALL_CONTROLLERS_OFF);
                }

                function setSettingsSelect()
                {
                    let settingsSelect = getElem("settingsSelect"),
                        hostSettings = ResSynth.hostSettings;

                    console.assert(hostSettings.length < 127);

                    for(var settingsIndex = 0; settingsIndex < hostSettings.length; settingsIndex++)
                    {
                        let option = new Option();

                        option.innerHTML = hostSettings[settingsIndex].name;
                        settingsSelect.options.add(option);
                    }

                    settingsSelect.selectedIndex = 0;
                }

                // The synth has a private array, parallel to the names, containing the MIDI recordings
                function setRecordingSelect()
                {
                    let recordingSelect = getElem("recordingSelect"),
                        recordings = synth.recordings;

                    for(var i = 0; i < recordings.length; i++)
                    {
                        let option = new Option();

                        option.innerHTML = recordings[i].name;

                        recordingSelect.options.add(option);
                    }

                    recordingSelect.selectedIndex = 0;
                }

                function getDefaultHostChannelStates()
                {
                    let channelOptions = getElem("channelSelect").options,
                        fontSelectIndex = getElem("webAudioFontSelect").selectedIndex,
                        presetSelectIndex = getElem("presetSelect").selectedIndex,
                        mixtureSelectIndex = getElem("mixtureSelect").selectedIndex,
                        tuningGroupSelectIndex = getElem("tuningGroupSelect").selectedIndex,
                        tuningSelectIndex = getElem("tuningSelect").selectedIndex,
                        a4FrequencySelectIndex = getElem("a4FrequencySelect").selectedIndex,
                        aftertouchValue = getElem("aftertouchLongControl").getValue(),
                        pitchWheelValue = getElem("pitchWheelLongControl").getValue(),
                        modWheelValue = getElem("modWheelLongControl").getValue(),
                        volumeValue = getElem("volumeLongControl").getValue(),
                        panValue = getElem("panLongControl").getValue(),
                        reverberationValue = getElem("reverberationLongControl").getValue(),
                        pitchWheelSensitivityValue = getElem("pitchWheelSensitivityLongControl").getValue();

                    triggerKey = parseInt(getElem("triggerKeyInput").value); // global, used by handleInputEvent()

                    for(let i = 0; i < channelOptions.length; i++)
                    {
                        let channelOption = channelOptions[i],
                            hostState = {};

                        hostState.fontSelectIndex = fontSelectIndex;
                        hostState.presetSelectIndex = presetSelectIndex;
                        hostState.mixtureSelectIndex = mixtureSelectIndex;
                        hostState.tuningGroupSelectIndex = tuningGroupSelectIndex;
                        hostState.tuningSelectIndex = tuningSelectIndex;
                        hostState.a4FrequencySelectIndex = a4FrequencySelectIndex;
                        hostState.triggerKey = triggerKey;
                        hostState.aftertouchValue = aftertouchValue;
                        hostState.pitchWheelValue = pitchWheelValue;
                        hostState.modWheelValue = modWheelValue;
                        hostState.volumeValue = volumeValue;
                        hostState.panValue = panValue;
                        hostState.reverberationValue = reverberationValue;
                        hostState.pitchWheelSensitivityValue = pitchWheelSensitivityValue;

                        channelOption.hostState = hostState;
                    }
                }

                let
                    webAudioFontDiv = getElem("webAudioFontDiv"),
                    tuningDiv = getElem("tuningDiv"),
                    triggersDiv = getElem("triggersDiv"),
                    recordingDiv = getElem("recordingDiv"),
                    webAudioFontSelect = getElem("webAudioFontSelect"),
                    presetSelect = getElem("presetSelect"),
                    mixtureSelect = getElem("mixtureSelect"),
                    tuningGroupSelect = getElem("tuningGroupSelect");

                console.assert(synth.name === "ResidentSynth", "Error: this app only uses the ResidentSynth");

                setWebAudioFontSelect(webAudioFontSelect);
                setPresetSelect(presetSelect, webAudioFontSelect);
                setMixtureSelect(mixtureSelect);

                webAudioFontDiv.style.display = "block";

                setTuningGroupSelect(tuningGroupSelect);
                setTuningSelect();
                setA4FrequencySelect();
                tuningDiv.style.display = "block";

                triggersDiv.style.display = "block";
                recordingDiv.style.display = "block";

                setCommandsAndControlsDivs();

                setSettingsSelect();
                setRecordingSelect();

                getDefaultHostChannelStates();

                // must be called after all the GUI controls have been set.
                // It calls all the synth's public control functions.
                onChannelSelectChanged();

                enableSettingsSelect(true);

                getElem("notesDiv").style.display = "block";
            }

            // Its important to call this function after user interaction with the GUI.
            synth.open();

            setInputDeviceEventListener(getElem("inputDeviceSelect"));

            getElem("continueAtStartButtonDiv").style.display = "none";

            // This function should initialize the synth with the (default) values of all the host's controls
            // by calling the corresponding functions in the synth's public interface.
            setPage2Display(synth);
        },

        // exported
        noteCheckboxClicked = function()
        {
            var
                note1Checkbox = getElem("sendNote1Checkbox"),
                note2Checkbox = getElem("sendNote2Checkbox");

            if((!note1Checkbox.checked) && (!note2Checkbox.checked))
            {
                note2Checkbox.checked = true;
            }
        },

        // exported
        doNotesOn = function()
        {
            function sendNoteOn(noteIndex, noteVelocity)
            {
                sendCommand(ResSynth.constants.COMMAND.NOTE_ON, noteIndex, noteVelocity);
            }

            var
                aftertouchValue = getElem('aftertouchLongControl').getValue(),
                note1Checkbox = getElem("sendNote1Checkbox"),
                note1Index = getElem("notesDivIndexInput1").valueAsNumber,
                note1Velocity = getElem("notesDivVelocityInput1").valueAsNumber,
                note2Checkbox = getElem("sendNote2Checkbox"),
                note2Index = getElem("notesDivIndexInput2").valueAsNumber,
                note2Velocity = getElem("notesDivVelocityInput2").valueAsNumber,
                holdCheckbox = getElem("holdCheckbox"),
                sendButton = getElem("sendButton");

            if(holdCheckbox.checked === true)
            {
                sendButton.disabled = true;
            }

            if(note1Checkbox.checked)
            {
                sendNoteOn(note1Index, note1Velocity);
            }
            if(note2Checkbox.checked)
            {
                sendNoteOn(note2Index, note2Velocity);
                // note that in this GUI, aftertouch is only applied to note2
                if(aftertouchValue > 0)
                {
                    sendCommand(ResSynth.constants.COMMAND.AFTERTOUCH, note2Index, aftertouchValue);
                }
            }
            notesAreSounding = true;
        },

        // exported
        doNotesOff = function()
        {
            function sendNoteOff(noteIndex, noteVelocity)
            {
                var
                    NOTE_ON = ResSynth.constants.COMMAND.NOTE_ON,
                    NOTE_OFF = ResSynth.constants.COMMAND.NOTE_OFF;

                if(synth.commands.indexOf(NOTE_OFF) >= 0)
                {
                    sendCommand(NOTE_OFF, noteIndex, noteVelocity);
                }
                else
                {
                    sendCommand(NOTE_ON, noteIndex, 0);
                }
            }

            var
                note1Checkbox = getElem("sendNote1Checkbox"),
                note1Index = getElem("notesDivIndexInput1").valueAsNumber,
                note1Velocity = getElem("notesDivVelocityInput1").valueAsNumber,
                note2Checkbox = getElem("sendNote2Checkbox"),
                note2Index = getElem("notesDivIndexInput2").valueAsNumber,
                note2Velocity = getElem("notesDivVelocityInput2").valueAsNumber;

            if(note1Checkbox.checked)
            {
                sendNoteOff(note1Index, note1Velocity);
            }
            if(note2Checkbox.checked)
            {
                sendNoteOff(note2Index, note2Velocity);
            }
            notesAreSounding = false;
        },

        // exported
        holdCheckboxClicked = function()
        {
            let holdCheckbox = getElem("holdCheckbox");

            doNotesOff();

            if(holdCheckbox.checked === false)
            {
                getElem("sendButton").disabled = false;
            }
        },

        init = function()
        {
            function setupInputDevice()
            {
                function setInputDeviceSelect(midiAccess)
                {
                    let iDevSelect = getElem("inputDeviceSelect"),
                        option;

                    iDevSelect.options.length = 0; // important when called by midiAccess.onstatechange 

                    option = document.createElement("option");
                    if(midiAccess !== null)
                    {
                        option.text = "choose a MIDI input device";
                        iDevSelect.add(option, null);
                        midiAccess.inputs.forEach(function(port)
                        {
                            //console.log('input id:', port.id, ' input name:', port.name);
                            option = document.createElement("option");
                            option.inputDevice = port;
                            option.text = port.name;
                            iDevSelect.add(option, null);
                        });
                        iDevSelect.disabled = false;
                    }
                    else
                    {
                        option.text = "There are no MIDI input devices available";
                        iDevSelect.add(option, null);
                        iDevSelect.disabled = true;
                    }

                    for(var i = iDevSelect.options.length - 1; i >= 0; --i)
                    {
                        iDevSelect.selectedIndex = i;
                        if(iDevSelect[iDevSelect.selectedIndex].text === "E-MU Xboard49")
                        {
                            inputDevice = iDevSelect[iDevSelect.selectedIndex].inputDevice;
                            break;
                        }
                    }
                }

                function onSuccessCallback(midiAccess)
                {
                    // Add the midiAccess.inputs to the inputDeviceSelect.
                    setInputDeviceSelect(midiAccess);
                }

                // This function will be called either
                // if the browser does not support the Web MIDI API,
                // or if the user refuses permission to use his hardware MIDI devices.
                function onErrorCallback()
                {
                    alert("Error getting midiAccess for the inputDevice.");
                }

                navigator.requestMIDIAccess().then(onSuccessCallback, onErrorCallback);
            }

            async function setAudioOutputDeviceSelect()
            {
                const permission = await navigator.permissions.query({name: "microphone"});
                if(permission.state == "prompt")
                {
                    alert("More audio outputs are available when user grants access to the mic");
                    // More audio outputs are available when user grants access to the mic.
                    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                    stream.getTracks().forEach((track) => track.stop());
                }

                const devices = await navigator.mediaDevices.enumerateDevices();
                const AudioOutputDevices = devices.filter(device => device.kind == "audiooutput");

                let audioOutputSelect = getElem("audioOutputSelect");
                for(let i = 0; i < AudioOutputDevices.length; i++)  
                {
                    let audioDev = AudioOutputDevices[i]
                    let option = document.createElement("option");
                    option.text = audioDev.label;
                    option.deviceId = audioDev.deviceId;
                    audioOutputSelect.add(option, null);
                }
            }

            function setInitialDivsDisplay()
            {
                getElem("loadingMsgDiv").style.display = "none";
                getElem("continueAtStartButtonDiv").style.display = "block";

                getElem("webAudioFontDiv").style.display = "none";
                getElem("tuningDiv").style.display = "none";
                getElem("commandsAndControlsDiv").style.display = "none";
                getElem("triggersDiv").style.display = "none";

                getElem("notesDiv").style.display = "none";
            }

            setupInputDevice();
            setAudioOutputDeviceSelect();
            synth = new ResSynth.residentSynth.ResidentSynth(); // loads definitions from synthConfig.
            setInitialDivsDisplay();
        },

        publicAPI =
        {
            onInputDeviceSelectChanged: onInputDeviceSelectChanged,
            onAudioOutputSelectChanged: onAudioOutputSelectChanged,

            onContinueAtStartClicked: onContinueAtStartClicked,

            webAudioFontWebsiteButtonClick: webAudioFontWebsiteButtonClick,

            onChannelSelectChanged: onChannelSelectChanged,
            onWebAudioFontSelectChanged: onWebAudioFontSelectChanged,
            onPresetSelectChanged: onPresetSelectChanged,
            onMixtureSelectChanged: onMixtureSelectChanged,
            onTuningGroupSelectChanged: onTuningGroupSelectChanged,
            onTuningSelectChanged: onTuningSelectChanged,
            onA4FrequencySelectChanged: onA4FrequencySelectChanged,

            onSettingsSelectChanged: onSettingsSelectChanged,
            onExportSettingsButtonClicked: onExportSettingsButtonClicked,
            onTriggerKeyInputChanged: onTriggerKeyInputChanged,

            onPlayRecordingButtonClicked: onPlayRecordingButtonClicked,
            onStartRecordingButtonClicked: onStartRecordingButtonClicked,
            onStopRecordingButtonClicked: onStopRecordingButtonClicked,

            noteCheckboxClicked: noteCheckboxClicked,
            holdCheckboxClicked: holdCheckboxClicked,

            doNotesOn: doNotesOn,
            doNotesOff: doNotesOff
        };
    // end var

    init();

    return publicAPI;

}(document));

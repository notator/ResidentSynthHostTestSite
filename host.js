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
        recording = undefined, // initialized by startRecording(), reset by stopRecording()
        triggerKey,
        playbackChannels = [], // used while playing back a recording

        // Put up an alert containing the message, then throw and catch a similar exception for display on the console
        stop = function(message)
        {
            try
            {
                let infoStr2 = "\n\n(Close the debugger, and keep clicking this message until it disappears.)";
                alert(message + infoStr2);
                throw (message);
            } catch(e)
            {
                console.error(e);
            };
        },

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
                case CMD.CONTROL_CHANGE:
                case CMD.PITCHWHEEL:
                    message = new Uint8Array([status, data1, data2]);
                    break;
                case CMD.PRESET:
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
            let settingsSelect = getElem("settingsSelect"),
                settings = settingsSelect.options[settingsIndex].settings,
                channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                settingsClone = {...settings};

            // decided _not_ to silence the synth while resetting all the controls.
            // sendShortControl(ResSynth.constants.CONTROL.ALL_SOUND_OFF);

            settingsClone.channel = channel;

            channelSelect.options[channel].hostSettings = settingsClone;
            onChannelSelectChanged();
        },
        setInputDeviceEventListener = function(inputDeviceSelect)
        {
            function handleInputMessage(e)
            {
                // Rectify performed velocities so that they are in range [6..127].
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
                    let settingsSelect = getElem("settingsSelect");

                    settingsSelect.selectedIndex = nextSettingsIndex;

                    setSettings(nextSettingsIndex); // sets the channel and its state in both the host and the synth

                    nextSettingsIndex = (nextSettingsIndex < (settingsSelect.options.length - 1)) ? nextSettingsIndex + 1 : 0;

                    setTriggersDivControls(channelSelect.options[currentChannel].hostSettings);

                    enableSettingsSelect(true); // disables the export settings button
                }

                let data = e.data,
                    CMD = ResSynth.constants.COMMAND,
                    command = data[0] & 0xF0,
                    msg = new Uint8Array([((command + currentChannel) & 0xFF), data[1], data[2]]),
                    now = performance.now();

                // Note that triggerKeys send normal noteOn messages while recording is in progress!
                // This is currently by design!
                if(triggerKey !== undefined && command === CMD.NOTE_ON && data[1] === triggerKey && recording === undefined)
                {
                    if(data[2] !== 0)
                    {
                        doTriggerAction();
                    }
                }
                else if(recording !== undefined)
                {
                    if(playbackChannels.includes(currentChannel) && command === CMD.NOTE_ON)
                    {
                        stop(
                            "New notes cannot be recorded while a recording that uses the same channel is playing back.\n" +
                            "In this situation, only commands and controls are recorded.\n" +
                            "New notes _can_ be recorded both before and after the playback.\n" +
                            "(Channels are restricted to being homophonic, so as to simplify the conversion to " +
                            "scores that can be read by the Assistant Performer.)");
                    }
                    msg.now = performance.now();
                    synth.send(msg, now);
                    recording.messages.push(msg);
                }
                else if(!(command === CMD.NOTE_OFF && data[1] === triggerKey)) // EMU never sends NOTE_OFF, but anyway...
                {
                    switch(command)
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
                        case CMD.CONTROL_CHANGE:
                            updateGUI_ControlsTable(data[1], data[2]);
                            //console.log("control change: " + getMsgString(data));
                            break;
                        case CMD.PRESET:
                            //console.log("preset: " + getMsgString(data));
                            break;
                        case CMD.PITCHWHEEL:
                            // This host uses pitchwheel values in range 0..127, so data[1] (the fine byte) is ignored here.
                            // But note that the residentSynth _does_ use both data[1] and data[2] when responding
                            // to PITCHWHEEL messages (including those that come from the E-MU keyboard), so PITCHWHEEL
                            // messages sent from this host's GUI use a data[1] value that is calculated on the fly.
                            updateGUI_CommandsTable(command, data[2]);
                            //console.log("pitchWheel: value=" + data[2]);
                            break;
                        default:
                            stop(
                                "Neither the residentSynth nor the residentSynthHost process\n" +
                                "SYSEX, AFTERTOUCH or CHANNEL_PRESSURE messages,\n" +
                                "so the input device (the keyboard or Assistant Performer)\n" +
                                "should not send them (at performance time).\n" +
                                "A separate editor could, of course, edit note velocities " +
                                "and add additional messages, of the types that _are_ implemented " +
                                "by the residentSynth, for use in the Assistant Performer.\n");
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
            function setAndSendFontDivControls(hostChannelSettings)
            {
                let fontSelect = getElem("webAudioFontSelect"),
                    presetSelect = getElem("presetSelect"),
                    mixtureSelect = getElem("mixtureSelect");

                fontSelect.selectedIndex = hostChannelSettings.fontIndex; // index in webAudioFontSelect

                // set the soundFont in the synth, and the presetSelect then call onPresetSelectChanged() (which calls onMixtureSelectChanged())
                onWebAudioFontSelectChanged(); 
            }

            function setAndSendTuningDivControls(hostChannelSettings)
            {
                let tuningGroupSelect = getElem("tuningGroupSelect"),
                    tuningSelect = getElem("tuningSelect"),
                    semitonesOffsetNumberInput = getElem("semitonesOffsetNumberInput"),
                    centsOffsetNumberInput = getElem("centsOffsetNumberInput");

                tuningGroupSelect.selectedIndex = hostChannelSettings.tuningGroupIndex;

                // set the tuningSelect then call onTuningtSelectChanged()
                // (which calls onSemitonesOffsetNumberInputChanged() and onCentsOffsetNumberInputChanged())
                onTuningGroupSelectChanged();
            }

            function setAndSendLongControls(hostChannelSettings)
            {
                let pitchWheelLC = getElem("pitchWheelLongControl"),
                    modWheelLC = getElem("modWheelLongControl"),
                    volumeLC = getElem("volumeLongControl"),
                    panLC = getElem("panLongControl"),
                    reverberationLC = getElem("reverberationLongControl"),
                    pitchWheelSensitivityLC = getElem("pitchWheelSensitivityLongControl");

                pitchWheelLC.setValue(hostChannelSettings.pitchWheel);
                modWheelLC.setValue(hostChannelSettings.modWheel);
                volumeLC.setValue(hostChannelSettings.volume);
                panLC.setValue(hostChannelSettings.pan);
                reverberationLC.setValue(hostChannelSettings.reverberation);
                pitchWheelSensitivityLC.setValue(hostChannelSettings.pitchWheelSensitivity);
            }

            let channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelSettings = channelSelect.options[channel].hostSettings;

            currentChannel = channel; // the global currentChannel is used by synth.send(...)

            setAndSendFontDivControls(hostChannelSettings);
            setAndSendTuningDivControls(hostChannelSettings);

            setTriggersDivControls(hostChannelSettings); // uses currentChannel

            setAndSendLongControls(hostChannelSettings);

            enableSettingsSelect(false);
        },

        // exported
        onWebAudioFontSelectChanged = function()
        {
            let webAudioFontSelect = getElem("webAudioFontSelect"),
                channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelSettings = channelSelect.options[channel].hostSettings,
                presetSelect = getElem("presetSelect"),
                selectedSoundFontOption = webAudioFontSelect[webAudioFontSelect.selectedIndex],
                soundFont = selectedSoundFontOption.soundFont,
                presetOptionsArray = selectedSoundFontOption.presetOptionsArray;

            synth.setSoundFont(soundFont, channel);

            setOptions(presetSelect, presetOptionsArray);

            presetSelect.selectedIndex = hostChannelSettings.presetIndex;
            onPresetSelectChanged();

            hostChannelSettings.fontIndex = webAudioFontSelect.selectedIndex;
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
                hostChannelSettings = channelSelect.options[channel].hostSettings,
                presetIndex = presetSelect.selectedIndex,
                presetMsg = getPresetMsg(channel, presetIndex);

            synth.send(presetMsg);

            mixtureSelect.selectedIndex = hostChannelSettings.mixtureIndex;
            onMixtureSelectChanged();

            hostChannelSettings.presetIndex = presetSelect.selectedIndex;
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
                hostChannelSettings = channelSelect.options[channel].hostSettings,
                mixtureIndex = mixtureSelect.selectedIndex,
                mixtureMessage = getMixtureMsg(channel, mixtureIndex);

            synth.send(mixtureMessage);

            hostChannelSettings.mixtureIndex = mixtureIndex;

            enableSettingsSelect(false);
        },

        // exported (c.f. onWebAudioFontSelectChanged() )
        onTuningGroupSelectChanged = function()
        {
            let channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelSettings = channelSelect.options[channel].hostSettings,
                tuningGroupSelect = getElem("tuningGroupSelect"),
                tuningSelect = getElem("tuningSelect"),
                selectedTuningGroupOption = tuningGroupSelect[tuningGroupSelect.selectedIndex],
                tuningOptionsArray = selectedTuningGroupOption.tuningOptionsArray;

            setOptions(tuningSelect, tuningOptionsArray);

            tuningSelect.selectedIndex = hostChannelSettings.tuningIndex;
            onTuningSelectChanged();

            hostChannelSettings.tuningGroupIndex = tuningGroupSelect.selectedIndex;
        },

        // exported
        onTuningSelectChanged = function()
        {
            let channelSelect = getElem("channelSelect"),
                tuningGroupIndex = getElem("tuningGroupSelect").selectedIndex,
                semitonesOffsetNumberInput = getElem("semitonesOffsetNumberInput"),
                centsOffsetNumberInput = getElem("centsOffsetNumberInput"),
                tuningSelect = getElem("tuningSelect"),
                tuningIndex = tuningSelect.selectedIndex,
                channel = channelSelect.selectedIndex,
                hostChannelSettings = channelSelect.options[channel].hostSettings,
                CONST = ResSynth.constants,
                setTuningGroupIndexMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.TUNING_GROUP_INDEX, tuningGroupIndex]),
                setTuningIndexMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.TUNING_INDEX, tuningIndex]);

            synth.send(setTuningGroupIndexMsg);
            synth.send(setTuningIndexMsg);

            semitonesOffsetNumberInput.value = hostChannelSettings.semitonesOffset;
            onSemitonesOffsetNumberInputChanged();

            centsOffsetNumberInput.value = hostChannelSettings.centsOffset;
            onCentsOffsetNumberInputChanged();

            hostChannelSettings.tuningIndex = tuningIndex;
        },

        // exported
        onSemitonesOffsetNumberInputChanged = function()
        {
            let CONST = ResSynth.constants,
                channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelSettings = channelSelect.options[channel].hostSettings,
                semitonesOffsetNumberInput = getElem("semitonesOffsetNumberInput"),
                semitonesOffset = parseInt(semitonesOffsetNumberInput.value),
                midiValue,                
                semitonesOffsetMsg;

            semitonesOffset = (semitonesOffset < -36) ? -36 : semitonesOffset;
            semitonesOffset = (semitonesOffset > 36) ? 36 : semitonesOffset;
            semitonesOffsetNumberInput.value = semitonesOffset;

            midiValue = semitonesOffsetNumberInput.midiValue(semitonesOffset);
            semitonesOffsetMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.SEMITONES_OFFSET, midiValue]);

            synth.send(semitonesOffsetMsg);

            hostChannelSettings.semitonesOffset = semitonesOffset;

            enableSettingsSelect(false);
        },
        // exported
        onCentsOffsetNumberInputChanged = function()
        {
            let CONST = ResSynth.constants,
                channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelSettings = channelSelect.options[channel].hostSettings,
                centsOffsetNumberInput = getElem("centsOffsetNumberInput"),
                centsOffset = parseInt(centsOffsetNumberInput.value),
                midiValue,
                centsOffsetMsg;

            centsOffset = (centsOffset < -50) ? -50 : centsOffset;
            centsOffset = (centsOffset > 50) ? 50 : centsOffset;
            centsOffsetNumberInput.value = centsOffset;

            midiValue = centsOffsetNumberInput.midiValue(centsOffset);                
            centsOffsetMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.CENTS_OFFSET, midiValue]);

            synth.send(centsOffsetMsg);

            hostChannelSettings.centsOffset = centsOffset;

            enableSettingsSelect(false);
        },

        // Throws an exception either if nextSettingsIndex is out of range,
        // or if the settings object has no name attribute.
        setTriggersDivControls = function(hostChannelSettings)
        {
            let settingsSelect = getElem("settingsSelect"),
                triggerKeyInput = getElem("triggerKeyInput"),
                settingsNameCell = getElem("settingsNameCell");

            triggerKeyInput.value = hostChannelSettings.triggerKey;
            onTriggerKeyInputChanged();

            if(nextSettingsIndex >= settingsSelect.length)
            {
                throw "Error: next settings preset index out of range.";
            }
            else
            {
                settingsNameCell.innerHTML = "next settings: " + settingsSelect.options[nextSettingsIndex].settings.name;
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
                hostChannelSettings = channelSelect.options[currentChannel].hostSettings,
                originalName = hostChannelSettings.name,
                exportName = "ch" + currentChannel.toString() + "_settings";

            hostChannelSettings.name = exportName;

            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([JSON.stringify(hostChannelSettings, null, "\t")], {type: "text/plain"}));
            a.setAttribute("download", exportName + ".json");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            hostChannelSettings.name = originalName;
        },

        // exported
        onTriggerKeyInputChanged = function()
        {
            let triggerKeyInput = getElem("triggerKeyInput"),
                channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelSettings = channelSelect.options[channel].hostSettings,
                CONST = ResSynth.constants,
                triggerKeyMsg;

            triggerKey = parseInt(triggerKeyInput.value); // also set global triggerKey (for convenience, used in handleInputMessage)
            triggerKeyMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.TRIGGER_KEY, triggerKey]);

            synth.send(triggerKeyMsg);            
            hostChannelSettings.triggerKey = triggerKey;

            enableSettingsSelect(false);
        },
        onPlayRecordingButtonClicked = async function()
        {
            function wait(delay)
            {
                return new Promise(resolve => setTimeout(resolve, delay));
            }

            function getPlaybackChannels(playbackRecording)
            {
                let settingsArray = playbackRecording.settingsArray,
                    channels = [];

                for(var i = 0; i < settingsArray.length; i++)
                {
                    channels.push(settingsArray[i].channel);
                }

                return channels;
            }

            function setSynthToPlaybackSettings(channelSelect, playbackSettingsArray)
            {
                function setSynthChannelToPlaybackSettings(playbackSettings)
                {
                    let channel = playbackSettings.channel;

                    // TODO: compare with onChannelSelectChanged()

                }

                for(var settingsIndex = 0; settingsIndex < playbackSettingsArray.length; settingsIndex++)
                {
                    let playbackSettings = playbackSettingsArray[settingsIndex];

                    setSynthChannelToPlaybackSettings(playbackSettings);
                    //channelSelect[channel].hostSettings = playbackSettings;
                    //onChannelSelectChanged();
                }
            }

            function restoreSynthToHostSettings(channelSelect)
            {
                for(var channel = 0; channel < 16; channel++)
                {
                    channelSelect.selectedIndex = channel;
                    onChannelSelectChanged();
                }
            }

            let channelSelect = getElem("channelSelect"),
                recordingSelect = getElem("recordingSelect"),
                settingsSelect = getElem("settingsSelect"),
                recordingIndex = recordingSelect.selectedIndex,
                playbackRecording = synth.recordings[recordingIndex],
                messages = playbackRecording.messages,
                originalHostChannelSettings = [],
                originalChannel = channelSelect.selectedIndex,
                originalSettingsSelectDisabled = settingsSelect.disabled;

            playbackChannels = getPlaybackChannels(playbackRecording); // playbackChannels is global in host.

            originalHostChannelSettings = setSynthToPlaybackSettings(channelSelect, playbackRecording.settingsArray);

            if(recording !== undefined)
            {
                let settingsArray = [];

                for(let channel = 0; channel < 16; channel++)
                {
                    let settings = playbackRecording.settingsArray.find(x => x.channel === channel);
                    if(settings !== undefined)
                    {
                        settingsArray.push(settings);
                    }
                    else if(recording.channel === channel)
                    {
                        settingsArray.push(recording.settingsArray[0]);
                    }
                }

                recording.settingsArray = settingsArray;
            }

            let prevMsPos = 0;
            for(var i = 0; i < messages.length; i++) 
            {
                let message = messages[i],
                    msg = message.msg,
                    thisMsPos = message.msPositionReRecording,
                    delay = thisMsPos - prevMsPos;

                await wait(delay);
                synth.send(msg);
                if(recording !== undefined) // echo msg to new recording
                {
                    msg.now = performance.now();
                    recording.messages.push(msg);
                }
                prevMsPos = thisMsPos;
            }

            restoreSynthToHostSettings(channelSelect, originalHostChannelSettings);

            channelSelect.selectedIndex = originalChannel;
            onChannelSelectChanged();

            playbackChannels.length = 0;
            enableSettingsSelect(!originalSettingsSelectDisabled);
        },
        // exported
        // This application can only record on a single channel.
        // It can, however play back multi-channel recordings that use the same recordings format.
        // Multichannel recordings can be created in other applications, by including the relevant
        // channel settings in the recording's settings array, and merging the message lists.
        onStartRecordingButtonClicked = function()
        {
            function disableSettingsDiv()
            {         
                let settingsTitle = getElem("settingsTitle"),
                    settingsSelect = getElem("settingsSelect"),
                    exportSettingsButton = getElem("exportSettingsButton"),
                    triggerKeyTitle = getElem("triggerKeyTitle"),
                    triggerKeyInput = getElem("triggerKeyInput"),
                    settingsNameCell = getElem("settingsNameCell");

                settingsTitle.style.color = "darkgray";
                settingsSelect.prevState = settingsSelect.disabled;
                settingsSelect.disabled = true;
                exportSettingsButton.prevState = exportSettingsButton.disabled;
                exportSettingsButton.disabled = true;

                triggerKeyTitle.style.color = "darkgray";
                triggerKeyInput.disabled = true;
                settingsNameCell.style.color = "darkgray";
            }

            let startRecordingButton = getElem("startRecordingButton"),
                stopRecordingButton = getElem("stopRecordingButton"),
                channelSelect = getElem("channelSelect"),
                channel = channelSelect.selectedIndex,
                hostChannelSettings = channelSelect.options[channel].hostSettings;

            // can't change channel while recording
            channelSelect.disabled = true;
            disableSettingsDiv();

            recording = {}; // global in host
            recording.name = "ch" + channelSelect.selectedIndex.toString() + "_recording";
            recording.settingsArray = [{...hostChannelSettings}]; // an array of settings, that contains a single settings clone
            recording.messages = [];

            startRecordingButton.style.display = "none";
            stopRecordingButton.style.display = "block";
        },
        // exported
        onStopRecordingButtonClicked = function()
        {
            function getStringArray(messages)
            {
                let rval = [],
                    startTime = messages[0].now,
                    nMessages = messages.length;

                for(let i = 0; i < nMessages; i++)
                {
                    let msg = messages[i],
                        msPositionReRecording = Math.round(msg.now - startTime),
                        str = msg[0].toString() + "," + msg[1].toString() + "," + msg[2].toString() + "," + msPositionReRecording.toString();

                    rval.push(str);
                }
                return rval;
            }

            function restoreSettingsDivState()
            {
                let settingsTitle = getElem("settingsTitle"),
                    settingsSelect = getElem("settingsSelect"),
                    exportSettingsButton = getElem("exportSettingsButton"),
                    triggerKeyTitle = getElem("triggerKeyTitle"),
                    triggerKeyInput = getElem("triggerKeyInput"),
                    settingsNameCell = getElem("settingsNameCell");

                settingsTitle.style.color = "black";
                settingsSelect.disabled = settingsSelect.prevState;
                settingsSelect.prevState = undefined;
                exportSettingsButton.disabled = exportSettingsButton.prevState;
                exportSettingsButton.prevState = undefined;

                triggerKeyTitle.style.color = "black";
                triggerKeyInput.disabled = false;
                settingsNameCell.style.color = "black";
            }

            let channelSelect = getElem("channelSelect"),
                startRecordingButton = getElem("startRecordingButton"),
                stopRecordingButton = getElem("stopRecordingButton"),
                rec = recording;

            if(rec.messages.length > 0)
            {
                rec.messages = getStringArray(rec.messages);

                const a = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([JSON.stringify(rec, null, "\t")], {
                    type: "text/plain"
                }));
                a.setAttribute("download", rec.name + ".json");
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            stopRecordingButton.style.display = "none";
            startRecordingButton.style.display = "block";

            restoreSettingsDivState()
            channelSelect.disabled = false;

            recording = undefined;
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
                                    presetOption.preset.mixtureIndex = 0;

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

                        console.assert(mixtures.length < 127);

                        for(var mixtureIndex = 0; mixtureIndex < mixtures.length; mixtureIndex++)
                        {
                            let option = new Option("mixtureOption");

                            option.innerHTML = mixtures[mixtureIndex].name;

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

                function setTuningSendAgainButton()
                {
                    let tuningSendAgainButtonCell = getElem("tuningSendAgainButtonCell"),
                        input = document.createElement("input");

                    input.type = "button";
                    input.className = "sendAgainButton";
                    input.value = "send again";
                    input.onclick = onTuningSelectChanged;
                    tuningSendAgainButtonCell.appendChild(input);
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

                function setSemitonesAndCentsControls()
                {
                    function getMidiValue(offsetValue)
                    {
                        return Math.round((offsetValue + 50) * 1.27);
                    }

                    let semitonesOffsetNumberInput = getElem("semitonesOffsetNumberInput"),
                        centsOffsetNumberInput = getElem("centsOffsetNumberInput");

                    semitonesOffsetNumberInput.midiValue = getMidiValue;
                    centsOffsetNumberInput.midiValue = getMidiValue;
                }

                function setHostSettingsFromLongControl(longControl, value)
                {
                    let channelSelect = getElem("channelSelect"),
                        hostChannelSettings = channelSelect.options[channelSelect.selectedIndex].hostSettings;

                    enableSettingsSelect(false);

                    if(hostChannelSettings !== undefined)
                    {
                        let longControlID = longControl.id;

                        switch(longControlID)
                        {
                            case "pitchWheelLongControl":
                                hostChannelSettings.pitchWheel = value;
                                break;
                            case "modWheelLongControl":
                                hostChannelSettings.modWheel = value;
                                break;
                            case "volumeLongControl":
                                hostChannelSettings.volume = value;
                                break;
                            case "panLongControl":
                                hostChannelSettings.pan = value;
                                break;
                            case "reverberationLongControl":
                                hostChannelSettings.reverberation = value;
                                break;
                            case "pitchWheelSensitivityLongControl":
                                hostChannelSettings.pitchWheelSensitivity = value;
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

                            setHostSettingsFromLongControl(this, value);

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

                    function setCommandsAndControlsTable()
                    {
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
                                    pitchWheel = getStandardCommandInfo(constants, cmd.PITCHWHEEL),
                                    commandInfos = [];

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
                                    else
                                    {
                                        // can only be PITCHWHEEL
                                        console.assert(false, "Error");
                                    }
                                }
                                function onCommandInputChanged(event)
                                {
                                    var target = (event === undefined) ? this : event.currentTarget,
                                        value = target.valueAsNumber,
                                        cmdIndex = target.cmdIndex;

                                    target.twinInputElem.value = value;

                                    setHostSettingsFromLongControl(target.parentElement, value);

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

                                    setHostSettingsFromLongControl(target.parentElement, value);

                                    sendLongControl(ccIndex, value);
                                }

                                function onPitchWheelSensitivityControlChanged(event)
                                {
                                    var target = (event === undefined) ? this : event.currentTarget,
                                        value = target.valueAsNumber,
                                        CONST = ResSynth.constants,
                                        pitchWheelSensitivityMsg = new Uint8Array([((currentChannel + CONST.COMMAND.CONTROL_CHANGE) & 0xFF), CONST.CONTROL.PITCH_WHEEL_SENSITIVITY, value]);;

                                    target.twinInputElem.value = value;

                                    setHostSettingsFromLongControl(target.parentElement, value);

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

                        let commandsAndControlsTable = getElem("commandsAndControlsTable"),
                            commandRows = getCommandRows(),
                            controlRows = getControlRows();

                        for(let i = 0; i < commandRows.length; ++i)
                        {
                            let tr = commandRows[i];
                            commandsAndControlsTable.appendChild(tr);
                        }

                        for(let i = 0; i < controlRows.length; ++i)
                        {
                            let tr = controlRows[i];
                            commandsAndControlsTable.appendChild(tr);
                        }
                    }

                    allLongInputControls.length = 0;

                    setCommandsAndControlsTable();

                    getElem("commandsAndControlsDiv").style.display = "block";

                    sendShortControl(ResSynth.constants.CONTROL.ALL_CONTROLLERS_OFF);
                }

                function setSettingsSelect()
                {
                    let settingsSelect = getElem("settingsSelect"),
                        settingsPresets = synth.settingsPresets;

                    console.assert(settingsPresets.length < 127);

                    for(var settingsIndex = 0; settingsIndex < settingsPresets.length; settingsIndex++)
                    {
                        let settingsPreset = settingsPresets[settingsIndex],
                            option = new Option();

                        option.innerHTML = settingsPreset.name;
                        option.settings = settingsPreset; // is frozen

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

                function setDefaultHostSettingsForEachChannel()
                {
                    let channelOptions = getElem("channelSelect").options;

                    for(let channel = 0; channel < channelOptions.length; channel++)
                    {
                        let hostChannelSettings = new ResSynth.settings.Settings("hostChannel" + channel.toString() + "Settings", channel);
                        // begin test code
                        //hostSettings.fontIndex = 6; // attributes are mutable, but new attributes are illegal
                        //hostSettings.test = ""; // fails (correctly)
                        // end test code
                        channelOptions[channel].hostSettings = hostChannelSettings;
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
                setSemitonesAndCentsControls();
                setTuningSendAgainButton();
                tuningDiv.style.display = "block";

                triggersDiv.style.display = "block";
                recordingDiv.style.display = "block";

                setCommandsAndControlsDivs();

                setSettingsSelect();
                setRecordingSelect();

                setDefaultHostSettingsForEachChannel();

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
            synth = new ResSynth.residentSynth.ResidentSynth(); // loads definitions from files in residentSynth/config.
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
            onSemitonesOffsetNumberInputChanged: onSemitonesOffsetNumberInputChanged,
            onCentsOffsetNumberInputChanged: onCentsOffsetNumberInputChanged,

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

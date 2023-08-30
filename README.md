## ResidentSynthHost and ResidentSynth
The _ResidentSynthHost_ is a [Web Audio application](https://james-ingram-act-two.de/open-source/ResidentSynthHost/host.html), written in HTML5 and Javascript, that hosts a GUI-less _ResidentSynth_ synthesizer.   
This repository contains two major branches:  
&nbsp;&nbsp;&nbsp;&nbsp;**main**: the current stable version, which can be used [here](https://james-ingram-act-two.de/open-source/ResidentSynthHost/host.html).  
&nbsp;&nbsp;&nbsp;&nbsp;**testSite**: the unstable development version, which can be tested [here](https://james-ingram-act-two.de/open-source/ResidentSynthHostTestSite/host.html).  

Software synthesizers like the _ResidentSynth_ can be used by any web application as a substitute 
for end-user hardware. I am intending, for example, also to install it as one of the available synthesizers in my _AssistantPerformer_ ([repository](https://github.com/notator/AssistantPerformerTestSite), [application](https://james-ingram-act-two.de/open-source/assistantPerformer/assistantPerformer.html)).  
The _ResidentSynth_ is intended to be configured for, and installed with, a web application that knows in advance which presets it needs. Loading time can therefore be minimized by not installing redundant presets. The synth uses a configurable [WebAudioFont](https://github.com/surikov/webaudiofont) that has at least one bank containing at least one preset. There can be up to 127 banks, each of which can contain up to 127 presets.  

Both the _ResidentSynthHost_ and _ResidentSynth_ are being developed in _this_ repository.  
Issues relating to either of them should be raised here.  
**Note that this page contains separate documentation for the _ResidentSynthHost_ and the <a href="#synthdoc">_ResidentSynth_.</a>** 

---

### ResidentSynthHost

This web application is best used with an attached MIDI input device such as a keyboard. This requires that the browser supports the Web MIDI 
[_MIDIInput_ interface](https://www.w3.org/TR/webmidi/#midiinput-interface).
All the major browsers now do this.  
  


![screenshot](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/images/ResidentSynthHost.png "screenshot")  

The GUI is divided into horizontal areas that group similar concepts:  
Top Level:  
![screenshot_Top](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/images/ResidentSynthHost_0_Top.png "screenshot_Top")  
Available MIDI input devices can be selected from the **Input Device** selector.  
Similarly, available audio outputs can be selected from the **Audio Output** selector.  
Changing the **channel** selector updates the whole GUI with the current settings for that channel.  
MIDI messages will be sent from the attached MIDI Input device to the 16-channel _ResidentSynth_ on a channel that is controlled by the keyboard **split**-string. See <a href="#keyboardSplit">below</a>
  
Sounds:  
![screenshot_Fonts](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/images/ResidentSynthHost_1_Sound.png "screenshot_Sound")  
Banks can be configured in the _ResidentSynth_, and selected from the **bank** selector.  
The **preset** selector always contains the presets available in the currently selected bank.  
Mixtures can also be configured in the _ResidentSynth_. They are selected from the **mixture** selector.  

Tuning:  
![screenshot_Tuning](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/images/ResidentSynthHost_2_Tuning.png "screenshot_Tuning")  
Tuning groups can be configured in the _ResidentSynth_, and selected from the **tuning group** selector.  
The **tuning** selector always contains the tunings available in the current tuning group.  
The two **offset** numerical inputs determine the tuning offset in semitones and cents respectively. The semitones input takes integer values in the range -36 to +36. The cents input takes values in the range -50 to +50.  

Commands and Controls:  
![screenshot_Commands&Controls](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/images/ResidentSynthHost_3_Commands&Controls.png "screenshot_Commands&Controls")  
Except for **reverberation** and **pitchWheelSensitivity**, these are standard MIDI commands and controls.  
Reverberation and pitchWheelSensitivity use non-standard MIDI control messages (CC 91 and CC 16 respectively).  
The top six controls can be changed either by dragging the sliders, or entering values in the numeric input fields. They also react to incoming MIDI messages: On my MIDI input device, they can also be set using the appropriate hardware wheels and knobs.  
The **allSoundOff** button silences the _ResidentSynth_.  
The **allControllersOff** button silences the _ResidentSynth_, and sets the six variable controls in this section to their default values.

<a id="keyboardSplit"/>

Keyboard Controls:  
![screenshot_Keyboard](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/images/ResidentSynthHost_4_Keyboard.png "screenshot_Keyboard")  
The **split** string input field can be used to assign a channel to each key on the input keyboard. The split-string can have up to 127 `<key>:<channel>;` substrings, separated by optional whitespace. The final ";" is optional.  
Each `<key>` is a number in range 0..127. `<key>` values must be in ascending order, and may not repeat.  
Each `<channel>` is a number in range 0..15. These values can be in any order, and can repeat within the split-string.
The default (empty) split-string is equivalent to the string "0:0", meaning that all keys send messages on channel 0.  
The split-string is parsed from left to right.
All keys greater than or equal to the `<key>` substring send on the substring's channel unless overridden by a substring further to the right.
Valid split-strings are "", "42:1;", "40:1; 50:2;", "40:1; 50:2; 60:1; 72:5" etc.

Ornaments can be configured in the _ResidentSynth_, and are described more fully in its <a href="#ornaments">_Ornaments_</a> documentation below.    
The **ornaments** string input field can be used here in the _ResidentSynthHost_ to assign particular ornaments to particular MIDI input key numbers. The input string can have up to 127 `<key>:<ornamentIndex>;` substrings, separated by optional whitespace. The final ";" is optional. For example: "60:0; 64:1; 72:0".  
The **velocityPitchSensitivity** input is a floating point value between 0 and 1. This value
raises an individual note's output pitch depending on its velocity. If this value is 0, the velocity has no effect
on the pitch. If this value is 1, the velocity has some maximum effect, depending on the current tuning.
In equal temperament tuning, with velocityPitchSensitivity set to 1, a velocity of 127 will raise the pitch by one semitone.  

Preset Settings:  
![screenshot_Settings](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/images/ResidentSynthHost_5_Settings.png "screenshot_Settings")  
Preset settings can be configured in the _ResidentSynth_, and selected from the **preset settings** selector. These settings are channel-independent. Selecting one only sets the settings for the current channel.  
If any individual control setting is subsequently changed in the GUI, the **export modified settings** button is activated, allowing the current channel settings to be saved in a JSON file in the user's _Downloads_ folder. The exported settings can then be copied to the _ResidentSynth_'s `settingsPresets.js` configuration file, and loaded into the **preset settings** selector when the app restarts.  
The **trigger key** is a note number whose NOTE_ON will trigger the following settings in the list in the **preset settings** selector, rather than play a note. The trigger key can be any number from 0 to 127.  

Recordings:  
![screenshot_Recording](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/images/ResidentSynthHost_6_Recordings.png "screenshot_Recording")  
The _ResidentSynthHost_ can record and save the MIDI messages it sends to the _ResidentSynth_. Such recordings are saved to the user's _Downloads_ folder, and can be copied from there to the _ResidentSynthHost_'s [recordings.js](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/recordings.js) file (in the application's root folder). The _ResidentSynthHost_ loads such recordings into its **recordings** selector on startup. The recordings.js file may be missing or empty. 
Clicking the **play recording** button plays the selected recording. (The button changes into a **cancel playback** button).  
The **start recording channel** button initiates recording of the current channel. (Its text includes the current channel index.) While recording, this button becomes a **stop recording channel** button, which, when clicked, saves the recording to the user's _Downloads_ folder.  
Note that while only one channel at a time can be recorded, it _is_ possible to simultaneously play back a recording of one or more other channels. These channels will then be included in the output recording. In other words, overdubbing is possible.

Simple Input:  
![screenshot_SimpleInput](https://github.com/notator/ResidentSynthHostTestSite/blob/keyboardSplit/images/ResidentSynthHost_7_SimpleInput.png "screenshot_SimpleInput")  
These controls can be used when no other MIDI Input device is attached to the computer.  
They can also be useful while debugging, since both hands can be kept free while holding a note.

---
<a id="synthdoc" />

### ResidentSynth 
The _ResidentSynth_ is a 16-channel MIDI Output device, written entirely in Javascript,
that can be installed and used on any website. It uses the Web Audio API, but does _not_ require
Web MIDI support from the browser since it implements the 
Web MIDI [_MIDIOutput_ interface](https://www.w3.org/TR/webmidi/#midioutput-interface) itself.  
In addition to implementing the most common MIDI messages, the _ResidentSynth_ uses some 
MIDI Controller messages for non-standard purposes. These are documented below.  

#### To use the _ResidentSynth_ in other web applications:

1. copy the 'residentSynth' folder to the application site
2. adjust the files in the contained 'config' folder as required (see below).
3. load the appropriate files in the application's main .html file (see, for example, the files included at the end of host.html).<br />Note that recordings.js is specific to the _ResidentSynthHost_ application. The synth does not itself implement recording functions.
4. call the synth's constructor: `let synth = new ResSynth.residentSynth.ResidentSynth();`
5. call `synth.open();`<br /> In order to comply with a web standard, this has to be done after a user interaction with the GUI.
6. send MIDI messages to the synth using `synth.send(midiMessage)`.<br /> The `midiMessage` is a 3-value `Uint8Array`. Messages are processed immediately. Timestamps are ignored. The application is shielded from lower-level interaction with the audio system because the synth uses a private WebAudioAPI `AudioContext` object.

#### Configuration
The _ResidentSynth_ can be configured by editing the files in its
'config' folder.  
This currently contains:  
&nbsp;&nbsp;&nbsp;&nbsp;presets (a folder containing clones of Surikov's preset files)  
&nbsp;&nbsp;&nbsp;&nbsp;webAudioFontDef.js (required)  
&nbsp;&nbsp;&nbsp;&nbsp;mixtureDefs.js (optional)  
&nbsp;&nbsp;&nbsp;&nbsp;ornamentDefs.js (optional)  
&nbsp;&nbsp;&nbsp;&nbsp;settingsPresets.js (optional)  
&nbsp;&nbsp;&nbsp;&nbsp;tuningDefs.js (optional)  
  
More complete instructions as to how to edit these files are given in the files themselves.

#### MIDI Messages
See the file residentSynth/constants.js

##### Commands
* <em>Implemented</em>:<br />
   NOTE_OFF (128, 0x80)  
   NOTE_ON (144, 0x90) <em><small>(A NOTE_ON with velocity 0 is also treated as a NOTE_OFF.)</small></em>  
   CONTROL_CHANGE (176, 0xB0)  
   PRESET(192, 0xC0)  
   PITCHWHEEL (224, 0xE0)

* <em>Not Implemented</em>:<br />
   AFTERTOUCH (160, 0xA0)   
   CHANNEL_PRESSURE (208, 0xD0)  
   SYSEX (240, 0xF0)<br />

##### Standard Controls
* <em>Implemented</em>:<br />
    BANK (CC 0, 0x0)  
	MODWHEEL (CC 1, 0x1)  
	VOLUME (CC 7, 0x7)  
	PAN (CC 10, 0xA)  
	EXPRESSION (CC 11, 0xB)  
	ALL_SOUND_OFF (CC 120, 0x78)  
	ALL_CONTROLLERS_OFF (CC 121, 0x79)

##### Non-standard Controls
* (See documentation below):<br />
	<a href="#nonstandardcontrols">REVERBERATION</a> (CC 91, 0x5B)    
	<a href="#nonstandardcontrols">PITCH_WHEEL_SENSITIVITY</a> (CC 16, 0x10)  
	<a href="#mixtures">MIXTURE_INDEX</a> (CC 17, 0x11)  
	<a href="#tunings">TUNING_GROUP_INDEX</a> (CC 18, 0x12)  
	<a href="#tunings">TUNING_INDEX</a> (CC 19, 0x13)  
	<a href="#pitchoffsets">SEMITONES_OFFSET</a> (CC 80, 0x50)  
	<a href="#pitchoffsets">CENTS_OFFSET</a> (CC 81, 0x51)  
	<a href="#settingspresets">SET_SETTINGS</a> (CC 82, 0x52)  
	<a href="#vpsensitivity">VELOCITY_PITCH_SENSITIVITY</a> (CC 83, 0x53)  
	<a href="#ornaments">SET_ORNAMENT</a> (CC 75, 0x4B)
	
##### WebAudioFontDef, Banks and Presets
The preset definitions used here can be found in
[Surikov's catalog](https://github.com/surikov/webaudiofont#catalog-of-instruments).  
To make a preset available, put a clone of its definition in the presets folder, and configure one or more bank/preset addresses for it in webAudioFontDef.js.  
Presets can then be activated using the standard BANK control and PRESET command messages.  
The WebAudioFont must contain between 1 and 127 banks, each of which contains between 1 and 127 presets.   
<a id="mixtures"/>
##### Mixtures
A _mixture_, defined in mixtureDefs.js, is a chord that plays when a single NOTE_ON message is sent to the synth.
Mixtures are like freely configurable [Organ stops](https://en.wikipedia.org/wiki/Mixture_(organ_stop)).  
Mixtures are set using their index in the file as the value in a MIXTURE_INDEX (CC 17) control message. By convention, index 0 is always defined to mean "no mixture".
##### Tunings
A _tuning_ associates each of the 127 MIDI keys with a pitch value (expressed as cents above MIDI C0).  
The following types of tuning can be created by the synth using the (configurable) definitions provided in tuningDefs.js: 
- constant factor : e.g. Equal temperament can be created using the 12th root of 2.
- Partch : tunings (on different root pitches) like Harry Partch's
- warped octaves : tunings containing internally warped octaves
- free keyboard : warped tunings in which the only restriction is that pitches ascend from left to right of the keyboard

To set a channel to a particular tuning in a channel, send the tuning group index in a TUNING_GROUP_INDEX (CC18) message, and the tuning index (in the group) in a TUNING_INDEX (CC 19) message. This provides the tuning's address in tuningDefs.js.  
<a id="pitchoffsets"/>
##### Pitch Offsets
The pitch set by the tuning can be additionally altered using the SEMITONES_OFFSET (CC 80) and CENTS_OFFSET (CC 81) messages: The `value` sent with either of these messages is converted to the semitones or cents offset using the following formula:  
&nbsp;&nbsp;&nbsp;&nbsp;`semitonesOffset = Math.round((value / 1.27) - 50);`  
So the effective range of these messages is -50..+50 semitones or cents. A `value` of 64 means "no offset".  
<a id="nonstandardcontrols"/>
##### Non-standard controls (sliders)
The REVERBERATION (CC 91) message takes a `value` in range 0..127, meaning zero to maximum reverberation.  
The PITCH_WHEEL_SENSITIVITY (CC 16) `value` is in range 0..127, and determines the maximum deviation produced by the PITCHWHEEL (CMD 224). 
<a id="ornaments"/>
##### Ornaments
An _ornament_ is a series of consecutive notes sent automatically when the synthesizer receives a NOTE_ON message.  
Note that, while ornaments can use mixtures, they are homophonic: An ornament turns notes off that are currently sounding in the channel, and are cut short by incoming NOTE_ONs in the same channel.  
There are two types of ornament: _non-repeating_ and _repeating_:  
When a _non-repeating_ ornament completes, its final note is sustained until the performed NOTE_ON's corresponding NOTE_OFF arrives. If the NOTE_OFF arrives before the ornament has completed, the ornament is simply cut short.   
The notes of a _repeating_ ornament are repeated continuously until the performed NOTE_ON's corresponding NOTE_OFF arrives, at which point the ornament stops.  
Ornaments are implemented in the _ResidentSynth_ using a non-standard SET_ORNAMENT (CC 75) control message that applies _only_ to the single, following NOTE_ON:      
To add an ornament to a NOTE_ON, send a SET_ORNAMENT control message (with the index of the required ornament) immediately before sending the NOTE_ON itself. After executing the ornament, the NOTE_ON command automatically resets the synth's state to "no ornament". The SET_ORNAMENT control message has to be sent again if required.
<a id="vpsensitivity"/>
##### Velocity Pitch Sensitivity
The VELOCITY_PITCH_SENSITIVITY (CC 83) message takes a `value` in range 0..127. This `value`
raises an individual note's output pitch depending on its velocity. If `value` is 0, the velocity has no effect on the pitch. If `value` is 127, the velocity has some maximum effect, depending on the current tuning.
In equal temperament tuning, with VELOCITY_PITCH_SENSITIVITY set to 127, a velocity of 127 will raise the pitch by one semitone.
<a id="settingspresets"/>
##### Settings Presets
Each settings preset, defined in settingsPresets.js, is a complete set of settings for a single channel. The creation of such presets is described in the above _ResidentSynthHost_ documentation. They can, of course also be edited manually.  
To set a settings preset in a MIDI channel, send the synth a SET_SETTINGS (CC 82) message with a value giving the required settings index in the settingsPresets.js file.

#### Acknowledgements
This synthesizer uses clones of freeware wavetables (=presets, instruments) found on 
[Sergey Surikov's WebAudioFont page](https://surikov.github.io/webaudiofontdata/sound/). These are organized into 
a custom WebAudioFont that can have 1-127 banks, each of which can contain 1-127 presets.  
For illustration and test purposes, the _ResidentSynthHost_ is configured to contain multiple banks and a large number of presets. Other installations would typically use less.  
On loading, the presets are automatically adjusted as follows:
- envelopes are tweaked
- where possible and meaningful, zones are extended to cover the full range of MIDI keys
- any errors in the wavetables are silently corrected

The _ResidentSynth_ inherits code from, and supercedes, my two previous synthesizers: the _Resident**WAF**Synth_ and _Resident**Sf2**Synth_. These are no longer being developed, but can still be used in the archived _WebMIDISynthHost_ 
([repository](https://github.com/notator/WebMIDISynthHost) and 
[application](https://james-ingram-act-two.de/open-source/WebMIDISynthHost/host.html)). The inherited code owes a lot to 
[Sergey Surikov's WebAudioFontPlayer](https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js). 
Not only is the code for loading and adjusting [WebAudioFont](https://github.com/surikov/webaudiofont) presets 
very similar to his `WebAudioFontLoader`, but the reverberation control is practically a clone of his
`WebAudioFontReverberator`. 


James Ingram  
August 2023  



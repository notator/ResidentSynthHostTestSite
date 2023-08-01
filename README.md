## ResidentSynthHost
This is a [Web Audio application](https://james-ingram-act-two.de/open-source/ResidentSynthHost/host.html),
written in HTML5 and Javascript, that hosts a GUI-less _ResidentSynth_ synthesizer.<br />
The application is best used with an attached MIDI input device such as a keyboard. This requires that the
browser supports the Web MIDI [_MIDIInput_ interface](https://www.w3.org/TR/webmidi/#midiinput-interface).
All the major browsers now do this.<br />
Software synthesizers like the _ResidentSynth_ can be included in any web application as a substitute for
end-user hardware. I am intending, for example, also to install it as one of the available synthesizers in my
[AssistantPerformer](https://james-ingram-act-two.de/open-source/assistantPerformer/assistantPerformer.html)
web application.<br />
Both the _ResidentSynthHost_ and _ResidentSynth_ are being developed in _this_ repository.
Issues relating to either of them should be raised here.
#### Screenshot
![screenshot](../images/ResidentSynthHost.png "screenshot")  
The _ResidentSynth_ is configurable, as described in the documentation below, but first here's a summary
of the _ResidentSynthHost_'s controls:

![screenshot_Top](../images/ResidentSynthHost_0_Top.png "screenshot_Top")  
On loading, the host searches for any available MIDI input devices, and lists them in the **Input Device** selector.  
Similarly, available audio outputs are listed in the **Audio Output** selector.  
Messages sent by the _ResidentSynthHost_ to the _ResidentSynth_ are sent, using the settings visible in its GUI,
on the channel set in the **ResidentSynth** channel selector.  
The _ResidentSynth_ is multi-channel. Changing the channel selector updates the GUI with the current settings
for that channel.

![screenshot_Fonts](../images/ResidentSynthHost_1_Font.png "screenshot_Fonts")  
WebAudioFonts can be configured in the _ResidentSynth_ (see below). On loading, the
_ResidentSynthHost_ adds their names to the **WebAudioFont** selector.  
The **preset** selector always contains the presets available in the current WebAudioFont.  
Mixtures can be configured in the _ResidentSynth_ (see below). They are available in the **mixture** selector.

![screenshot_Tuning](../images/ResidentSynthHost_2_Tuning.png "screenshot_Tuning")  
Tuning groups can be configured in the _ResidentSynth_ (see below). On loading, the
_ResidentSynthHost_ adds their names to the **Tuning group** selector.
The **tuning** selector always contains the tunings available in the current tuning group.  
The two **offset** numerical inputs determine the tuning offset in (equal temperament)
semitones and cents respectively. The semitones input takes integer values in the range -36 to +36.
The cents input takes values in the range -50 to +50.

![screenshot_Commands&Controls](../images/ResidentSynthHost_3_Commands&Controls.png "screenshot_Commands&Controls") 
Except for reverberation and pitchWheelSensitivity, these are standard MIDI commands and controls.  
Reverberation and pitchWheelSensitivity use non-standard MIDI control messages (CC 91 and CC17 respectively).  

![screenshot_Notes](../images/ResidentSynthHost_4_Notes.png "screenshot_Notes")  
Ornaments can be configured in the _ResidentSynth_ (see below).  
The _ResidentSynthHost_ can assign particular ornaments to particular MIDI input key numbers.
This is done in the **ornaments** string input field using a format like a CSS style string: up to 127 repeats 
of <code>\<key>:\<ornamentIndex>;</code> separated by whitespace. The final ";" is optional. For example: "60:0; 64:1; 72:0".  
An _ornament_ is a series of consecutive notes sent automatically when the synthesizer receives a NOTE_ON.   
When the ornament completes, its final note is sustained until the performed NOTE_ON's corresponding
NOTE_OFF (or NOTE_ON velocity 0) arrives. If the NOTE_OFF arrives before the ornament has completed,
the ornament is simply cut short.  
This is implemented in the _ResidentSynth_ using a non-standard SET_ORNAMENT control message that applies only to the single,
following NOTE_ON (as described further below).  
The **velocityPitchSensitivity** input is a floating point value between 0 and 1. This value
raises an individual note's output pitch depending on its velocity. If this value is 0, the velocity has no effect
on the pitch. If this value is 1, a velocity of 127 will raise the pitch by one (equal temperament) semitone.  

![screenshot_Settings](../images/ResidentSynthHost_5_Settings.png "screenshot_Settings")  
Preset settings can be configured in the _ResidentSynth_ (see below), and are channel independent.
On loading, these are added to the **Preset Settings** selector. Selecting one will only change the current
channel. If any setting is subsequently changed in the GUI, the **export channel settings** button is activated,
allowing the current channel settings to be saved in a JSON file in the user's _Downloads_ folder, from where
it can be copied to the _ResidentSynth_'s settingsPresets.js configuration file.
The **Trigger key** is the note number whose NOTE_ON will trigger the following settings in the list in the
**PresetSettings** selector, rather than play a note. The trigger key can be any number from 0 to 127. 

![screenshot_Recording](../images/ResidentSynthHost_6_Recordings.png "screenshot_Recording") 

![screenshot_SimpleInput](../images/ResidentSynthHost_7_SimpleInput.png "screenshot_SimpleInput") 



### ResidentSynth
The _ResidentSynth_ is a MIDI Output device, written entirely in Javascript,
that can be installed and used on any website. It uses Web Audio, but does _not_ require
Web MIDI support from the browser since it implements the 
Web MIDI [_MIDIOutput_ interface](https://www.w3.org/TR/webmidi/#midioutput-interface) itself.<br />
In addition to implementing the most common MIDI messages, the _ResidentSynth_ uses some 
MIDI Controller messages for non-standard purposes. These are documented below.<br />
#### Acknowledgements
This synthesizer uses clones of freeware wavetables (=presets, instruments) found on [Sergey Surikov's WebAudioFont page](https://surikov.github.io/webaudiofontdata/sound/). These are organised into custom sound fonts.<br />
For illustration and test purposes, the _ResidentSynthHost_ installs a deliberately large number of presets,
organising them into several different fonts. Other installations would typically use less.<br />
On loading, these presets are automatically adjusted as follows:
- envelopes are tweaked
- where possible and meaningful, zones are extended to cover the full range of MIDI keys
- any errors in the wavetables are silently corrected

The _ResidentSynth_ inherits code from, and supercedes, my two previous synthesizers: the _Resident**WAF**Synth_ and _Resident**Sf2**Synth_.<br />
These are no longer being developed, but can still be used in the archived _WebMIDISynthHost_ ([repository](https://github.com/notator/WebMIDISynthHost) and [application](https://james-ingram-act-two.de/open-source/WebMIDISynthHost/host.html)).<br />
The inherited code owes a lot to [Sergey Surikov's WebAudioFontPlayer](https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js). Not only is the code for loading and adjusting [WebAudioFont](https://github.com/surikov/webaudiofont) presets very similar to his `WebAudioFontLoader`, but the reverberation control is practically a clone of his `WebAudioFontReverberator`.<br />


#### MIDI Messages
See [constants.js](https://github.com/notator/ResidentSynthHostTestSite/blob/TestSite/residentSynth/constants.js).
##### Commands
* <em>Implemented</em>:

   NOTE_OFF (0x80)  
   NOTE_ON (0x90) <em><small>(A NOTE_ON with velocity 0 is also treated as a NOTE_OFF.)</small></em><br />
   CONTROL_CHANGE (0x80)  
   PRESET(0xC0)  
   PITCHWHEEL (0xE0)

* <em>Not Implemented</em>:

   AFTERTOUCH (0xA0)   
   CHANNEL_PRESSURE (0xD0)  
   SYSEX (0xF0)
##### Standard Controls
* <em>Implemented</em>:

	MODWHEEL (CC 1)  
	VOLUME (CC 7)  
	PAN (CC 10)  
	EXPRESSION (CC 11)  
	ALL_SOUND_OFF (CC 120)  
	ALL_CONTROLLERS_OFF (CC 121)

* <em>NB: Not Used</em>:

   BANK (CC 0)  
   ALL_NOTES_OFF (CC 123)

##### Non-standard Controls
* <em>Implemented</em> (See documentation below):

	REVERBERATION (CC 91)  
	SOUND_FONT_INDEX (CC 16)  
	PITCH_WHEEL_SENSITIVITY (CC 17)  
	MIXTURE_INDEX (CC 18)  
	TUNING_GROUP_INDEX (CC 19)  
	TUNING_INDEX (CC 80)  
	SEMITONES_OFFSET (CC 81)  
	CENTS_OFFSET (CC 82)  
	SET_SETTINGS (CC 83)  
	VELOCITY_PITCH_SENSITIVITY (CC 75)  
	SET_ORNAMENT (CC 76)

#### Configuration
The _ResidentSynth_ can be configured by editing the files in the
[residentSynth/config folder](https://github.com/notator/ResidentSynthHostTestSite/tree/TestSite/residentSynth/config).  
This currently contains:  
&nbsp;&nbsp;&nbsp;&nbsp;webAudioFontFiles : a folder containing the required preset definitions (clones of Surikov's files)  
&nbsp;&nbsp;&nbsp;&nbsp;mixtureDefs.js  
&nbsp;&nbsp;&nbsp;&nbsp;ornamentDefs.js  
&nbsp;&nbsp;&nbsp;&nbsp;recordings.js  
&nbsp;&nbsp;&nbsp;&nbsp;settingsPresets.js  
&nbsp;&nbsp;&nbsp;&nbsp;tuningDefs.js  
&nbsp;&nbsp;&nbsp;&nbsp;webAudioFontDefs.js  
   
More complete instructions as to how to edit the definitions are given in the respective files, but here's an overview:
##### Presets
The preset definitions used here can be found in
[Surikov's catalog](https://github.com/surikov/webaudiofont#catalog-of-instruments).<br />
To make a preset available, put a clone of its definition in the webAudioFontFiles folder, and configure one or more
soundFont/preset addresses for it in webAudioFontDefs.js.<br />
Use the SOUND_FONT_INDEX control and PRESET command to activate it. Note that the BANK control is not used.
##### Mixtures
A _mixture_, defined in mixtureDefs.js, is a chord that plays when a single noteOn is sent to the synth.
Mixtures are like freely configurable [Organ stops](https://en.wikipedia.org/wiki/Mixture_(organ_stop)).  
Mixtures are set using their index as the value in a MIXTURE_INDEX control message, whereby index 0 is always defined to mean
"no mixture".
##### Ornaments
An _ornament_, defined in ornamentDefs.js, is a series of consecutive notes sent automatically when the synthesizer receives
a NOTE_ON. When the ornament completes, its final note is sustained until a NOTE_OFF (or NOTE_ON velocity 0) is received.
Ornaments are simply cut short if the synthesizer receives a NOTE_OFF before they have completed.   
To add an ornament to a NOTE_ON, send a SET_ORNAMENT control message (with the index of the required ornament) immediately before
sending the NOTE_ON itself. The NOTE_ON command un-sets the ornament again.
In other words, SET_ORNAMENT sets an ornament that is only valid for one note. It must be sent again if required.
##### Recordings
The _ResidentSynthHost_ can record and save sequences of MIDI messages sent to the _ResidentSynth_.
The recordings are saved as JSON files in the user's _Downloads_ folder, from where they can be copied into the recordings.js file.  
If a recording is present in the recordings.js file when the _ResidentSynthHost_ starts up, it will appear in the recordings
selector and can be played back.
##### Settings Presets
Each settings preset, defined in settingsPresets.js, is a complete set of settings for the multichannel _ResidentSynth_.  
The current settings can be saved to the user's _Downloads_ folder, and copied from there to the settingsPresets.js file.
If a settings preset is present in the settingsPresets.js file when the _ResidentSynthHost_ starts up, it will appear in the
preset settings selector, which can be used to set the current settings.
##### Tunings
A _tuning_ associates each of the 127 MIDI keys with a pitch value (expressed as cents above MIDI C0).<br />
The following types of tuning can be created by the synth using the (configurable) definitions provided in tuningDefs.js: 
- constant factor : e.g. Equal temperament can be created using the 12th root of 2.
- Partch : tunings (on different root pitches) like Harry Partch's
- warped octaves : Tunings containing internally warped octaves
- free keyboard : warped tunings in which the only restriction is that pitches ascend from left to right of the keyboard

### Trigger Actions
A trigger is a MIDI key that sends predefined MIDI messsages to the synthesizer when pressed under certain circumstances.<br />
Such triggers are defined (in triggerDefs.js) for a particular _host_.
The triggers defined for this host can change the preset and/or the tuning. Triggers could also be defined to send sequences of MIDI messages.

The _ResidentSynth_ is also used by my _AssistantPerformer_ ([repository](https://github.com/notator/AssistantPerformer), [application](https://james-ingram-act-two.de/open-source/assistantPerformer/assistantPerformer.html)).

James Ingram<br />
May 2022<br />



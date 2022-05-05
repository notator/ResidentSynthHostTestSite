## ResidentSynthHost
This is a [Web Audio application](https://james-ingram-act-two.de/open-source/ResidentSynthHost/host.html), written in HTML5 and Javascript, that hosts a GUI-less _ResidentSynth_ synthesizer.<br />
The application uses the Web MIDI [_MIDIInput_ interface](https://www.w3.org/TR/webmidi/#midiinput-interface) so that an attached hardware MIDI input device can be used to control the _ResidentSynth_ in real time. It is therefore best used in a browser that supports the Web MIDI API.<br />

The _ResidentSynth_ is a MIDI Output device, written entirely in Javascript, that can be installed and used on any website. It uses Web Audio, but does _not_ require Web MIDI support from the browser since it implements the Web MIDI [_MIDIOutput_ interface](https://www.w3.org/TR/webmidi/#midioutput-interface) itself. Such software synths can be included in websites as a substitute for end-user hardware, so they should be especially useful on mobile devices.<br />
The _ResidentSynth_ is being developed in _this_ repository. All issues relating to it should be raised here.

### ResidentSynth
This software synthesizer uses clones of freeware wavetables (=presets, instruments) found on [Sergey Surikov's WebAudioFont page](https://surikov.github.io/webaudiofontdata/sound/). These are organised into custom sound fonts.<br />
For illustration purposes, the _ResidentSynthHost_ installs a deliberately large number of presets, organising them into several different fonts. Other installations would typically use less.<br />

The _ResidentSynth_ inherits code from, and supercedes, my two previous synthesizers: the _Resident**WAF**Synth_ and _Resident**Sf2**Synth_.<br />
These are no longer being developed, but can still be used in the archived _WebMIDISynthHost_ ([repository](https://github.com/notator/WebMIDISynthHost) and [application](https://james-ingram-act-two.de/open-source/WebMIDISynthHost/host.html)).<br />
The inherited code owes a lot to [Sergey Surikov's WebAudioFontPlayer](https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js). Not only is the code for loading and adjusting [WebAudioFont](https://github.com/surikov/webaudiofont) presets very similar to his `WebAudioFontLoader`, but the reverberation control is practically a clone of his `WebAudioFontReverberator`.<br />
Differences include:
- Implementation of the Web MIDI _MIDIOutput_ interface
- Presets may be modified after loading:
  - envelopes are tweeked
  - where possible and meaningful, zones are extended to cover the full range of MIDI keys
  - any errors in the wavetables are silently corrected
- Groups of presets are collected into custom, selectable sound fonts 
- Support for
  - mixtures (chords that are played when a single NoteOn message is received)
  - tunings (including microtones)
  - triggers (actions that are performed when a particular MIDI key is pressed)

#### Configuration
The _ResidentSynth_ can be configured by editing the files in the _synthConfig_ folder. This currently contains:<br />
- webAudioFontFiles : a folder containing the required preset definitions (clones of Surikov's files)
- webAudioFontDefs.js : a file that allocates the available presets to bank and preset addresses in the synth
- mixtureDefs.js : mixture definitions (see below)
- tuningDefs.js : tuning definitions (see below)
- triggerStackDefs.js : trigger stack definitions (see below)<br />

Precise instructions as to how to edit the definitions is given in the respective files, but here's an overview:
##### Presets
The preset definitions used here can be found in [Surikov's catalog](https://github.com/surikov/webaudiofont#catalog-of-instruments).<br />
To make a preset available, put a clone of its definition in the webAudioFontFiles folder, and configure one or more bank/preset addresses for it in webAudioFontDefs.js.<br />
The usual MIDI bank and preset messages can then be sent to the synth to activate it.
##### Mixtures
A _mixture_ is a chord that plays when a single noteOn is sent to the synth. Mixtures are like freely configurable [Organ stops](https://en.wikipedia.org/wiki/Mixture_(organ_stop)).<br>
Both abstract mixtures (that can be used with any preset) and predefined PresetMixtures can be defined in mixtureDefs.js.<br />
In the current host, PresetMixtures are added to the preset selector. Abstract mixtures can also be used in Trigger Stacks (see below).
##### Tunings
A _tuning_ associates each of the 127 MIDI keys with a pitch value (expressed as cents above MIDI C0).<br />
The following types of tuning can be created by the synth using the (configurable) definitions provided in tuningDefs.js: 
- constant factor : e.g. Equal temperament can be created using the 12th root of 2.
- Partch : tunings (on different root pitches) like Harry Partch's
- warped octaves : Tunings containing internally warped octaves
- free keyboard : warped tunings in which the only restriction is that pitches ascend from left to right of the keyboard

Internally, tunings are activated using MIDI RegisteredParameter and DataEntry controls (see host.js), but this detail is hidden from end-users by the GUI.
This host application provides a tuning selector, parallel to the preset selector.  

##### Trigger Stacks
A trigger is a MIDI key that changes the synth's configuration when pressed under certain circumstances.<br />
Currently, such triggers are defined (in triggerDefs.js) using their MIDI key number and a `fireOnHitNumber` attribute. The trigger is released when the key has been hit `fireOnHitNumber` times. Such trigger definitions can be put in a sequence (a stack) designed to be used with a particular score. And it doesn't matter if the score is being played live or automatically on a website...<br />

Currently, a trigger can change one or more of the following:
- preset (with or without mixture)
- tuning (the whole keyboard)
- tuning overlay (a section of the keyboard)

This synthesizer is still being developed. Please raise any issues, or make pull requests etc., here in this repository.<br />
The _ResidentSynth_ is also used by my _AssistantPerformer_ ([repository](https://github.com/notator/AssistantPerformer), [application](https://james-ingram-act-two.de/open-source/assistantPerformer/assistantPerformer.html)).

James Ingram<br />
May 2022<br />



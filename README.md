## ResidentSynthHost
This is a Web Audio application, written in HTML5 and Javascript, that hosts a GUI-less _ResidentSynth_ synthesizer.<br />
The _ResidentSynth_ is a MIDI Output device, written entirely in Javascript, that can be installed and used on any website. It does _not_ require Web MIDI support from the browser, since it implements the Web MIDI [_MIDIOutput_ interface](https://www.w3.org/TR/webmidi/#midioutput-interface) itself. Such software synths can be included in websites as a substitute for end-user hardware, so they should be especially useful on mobile devices.<br />
The _ResidentSynth_ uses configurable [WebAudioFont](https://github.com/surikov/webaudiofont) presets (see below). For illustration purposes, this host installs a deliberately large number of these. Other installations would typically use less.<br />
This _**ResidentSynthHost**_ uses the Web MIDI [_MIDIInput_ interface](https://www.w3.org/TR/webmidi/#midiinput-interface) so that an attached hardware MIDI input device can be used to control the _ResidentSynth_ in real time. This _does_ require the browser to support the Web MIDI API, and is recommended, but not absolutely necessary.<br />
The _ResidentSynth_ is used not only by this [_ResidentSynthHost_ application](https://james-ingram-act-two.de/open-source/ResidentSynthHost/host.html), but also by my [_AssistantPerformer_](https://james-ingram-act-two.de/open-source/assistantPerformer/assistantPerformer.html).

### ResidentSynth
The _ResidentSynth_ inherits code from, and supercedes, my two previous synthesizers: the _Resident**WAF**Synth_ and _Resident**Sf2**Synth_. These are no longer being developed, but are still installed in the archived _WebMIDISynthHost_ ([repository](https://github.com/notator/WebMIDISynthHost) and [application](https://james-ingram-act-two.de/open-source/WebMIDISynthHost/host.html)).<br />
The inherited code owes a lot to Sergey Surikov's [WebAudioFontPlayer](https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js). Not only is the code for loading and adjusting [WebAudioFont](https://github.com/surikov/webaudiofont) presets very similar to his `WebAudioFontLoader`, but the reverberation control is practically a clone of his `WebAudioFontReverberator`.<br />
#### Configuration
Apart from having a MIDI interface and support for both mixtures and microtones, the main difference between the ResidentSynth and Surikov's WebAudioFontPlayer is in the approach to note envelopes: The _ResidentSynth_ allows custom envelope settings to be provided for each preset zone.<br />

The synth is designed to be used both with an external, hardware MIDI Input device such as a keyboard, and for playing scores stored on a website (such as my _AssistantPerformer_ [3]).<br />
It can be configured by editing the files in the _synthConfig_ folder. This currently contains:<br />
- webAudioFontFiles : a folder containing the required preset definitions (javascript files)
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

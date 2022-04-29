### ResidentSynthHost
This is a Web Audio application, written in HTML5 and Javascript, within which the _ResidentSynth_ is being developed.<br />
It can be tried out at https://james-ingram-act-two.de/open-source/ResidentSynthHost/host.html <br />
The host uses the Web MIDI API's _Input Device_ interface so that an attached hardware MIDI input device can be used to control the synthesizer. This is, however, not absolutely necessary.<br />
For illustration purposes, this host uses a deliberately large number of [WebAudioFont](https://github.com/surikov/webaudiofont) presets. Other installations would typically use less.<br />
<br />
**ResidentSynth**<br />
This a GUI-less software synth, written entirely in Javascript, that uses the Web _Audio_ API to implement the Web _MIDI_ API's _Output Device_ interface. Such software synths can be included in websites as a substitute for end-user hardware MIDI Output devices, so they should be especially useful on mobile devices. Also, since they themselves provide the MIDI Output Device interface, they don't depend on browser implementations of the Web MIDI API.<br />
The _ResidentSynth_ inherits code from, and supercedes, both the _Resident**WAF**Synth_ and the _Resident**Sf2**Synth_. The latter synths are no longer being developed, but still exist as part of the archived _WebMIDISynthHost_ ([repository](https://github.com/notator/WebMIDISynthHost) and [application](https://james-ingram-act-two.de/open-source/WebMIDISynthHost/host.html)).<br />
The _ResidentSynth_'s inherited code owes a lot to Sergey Surikov's [WebAudioFontPlayer](https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js). Not only is the code for loading and adjusting [WebAudioFont](https://github.com/surikov/webaudiofont) presets very similar to his `WebAudioFontLoader`, but the reverberation control is practically a clone of his `WebAudioFontReverberator`.<br />

Apart from having a MIDI interface and support for both mixtures and microtones, the main difference between the ResidentSynth and Surikov's WebAudioFontPlayer is in the approach to note envelopes: The _ResidentSynth_ allows custom envelope settings to be provided for each preset zone.<br />
#### Configuration
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

#### Other Applications that use the ResidentWAFSynth:
1. [SimpleWebAudioFontSynthHost](https://james-ingram-act-two.de/open-source/SimpleWebAudioFontSynthHost/host.html): This is simple demo application, showing how to embed the synth in web pages.<br />
2. WebMIDISynthHost ([repository](https://github.com/notator/WebMIDISynthHost) and [application](https://james-ingram-act-two.de/open-source/WebMIDISynthHost/host.html)): This application began as a response to a discussion about software synths in [Web MIDI API issue 124](https://github.com/WebAudio/web-midi-api/issues/124).<br />
3. AssistantPerformer ([repository](https://github.com/notator/AssistantPerformer), [application](https://james-ingram-act-two.de/open-source/assistantPerformer/assistantPerformer.html)).

James Ingram<br />
August 2021<br />





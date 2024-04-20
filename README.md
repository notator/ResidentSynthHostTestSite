## ResidentSynth and ResidentSynth Host
The _ResidentSynthHost_ is a Web Audio application, written in HTML5 and Javascript, that uses a GUI-less _ResidentSynth_ synthesizer located on the same web site.  
These are separate, but related, pieces of code separated by a MIDI interface. They are being developed together here, in this repository. Issues relating to either should be raised here.

The repository has two major branches:  
&nbsp;&nbsp;&nbsp;&nbsp;**main**: the current [stable application](https://james-ingram-act-two.de/open-source/ResidentSynthHost/host.html).  
&nbsp;&nbsp;&nbsp;&nbsp;**testSite**: the [unstable development application](https://james-ingram-act-two.de/open-source/ResidentSynthHostTestSite/host.html).

The **testSite** has been fully merged into the **main** branch in April 2024, and the two online web applications are identical. There is, however, no guarantee that this state will persist. 

---

This project is designed to be an investigation of the concepts involved. It is not intended to be a finished product. Its top-level architecture and _what it does_ is much more important than the code itself (which is rather old-fashioned javascript). Both the host and synth are working _prototypes_ whose actual code could well be improved.

The _ResidentSynth_ does not require Web MIDI support from the browser. It uses the Web Audio API to implement the Web MIDI MIDIOutput interface. The _ResidentSynthHost_, on the other hand, is best used with a MIDI keyboard input device, which _does_ require the Web MIDI API.)

The _ResidentSynth_ is designed to be configured for, and installed with, a web application that knows in advance
  * which MIDI messages it supports. It can, and does, therefore use non-standard MIDI messages.
  * which presets it needs.  Loading time can therefore be minimized by not installing redundant presets.

Software synthesizers like the _ResidentSynth_ can be used by any web application. I am intending, for example, also to install it as one of the available synthesizers in my _AssistantPerformer_ ([repository](https://github.com/notator/AssistantPerformerTestSite), [application](https://james-ingram-act-two.de/open-source/assistantPerformer/assistantPerformer.html)).

**[Detailed documentation for both the ResidentSynth and the Host can be found here](https://james-ingram-act-two.de/open-source/aboutResidentSynthHost.html)**.

---

#### Acknowledgements

Many thanks to [Sergey Surikov](https://github.com/surikov):

  * The _ResidentSynth_ uses clones of freeware wavetables (=presets, instruments) found on 
[his WebAudioFont page](https://surikov.github.io/webaudiofontdata/sound/). These are organized into a custom WebAudioFont that can have 1-127 banks, each of which can contain 1-127 presets. For illustration and test purposes, the _ResidentSynthHost_ uses a _ResidentSynth_ that is configured to contain multiple banks and a large number of presets. Other installations would typically use less.

  * The code for loading the wavetables is very similar to that found in [Surikov's WebAudioFontPlayer](https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js).

  * The reverberation control is practically a clone of (a possibly old version of) his WebAudioFontReverberator.

The _ResidentSynth_ provides support for different tuning types (see the [documentation](https://james-ingram-act-two.de/open-source/aboutResidentSynthHost.html)):
Many thanks to Paul Poletti, who is the author of a table of Baroque tunings giving the offsets from Equal Temperament of each keyboard key in each tuning.    
 Poletti's table was downloaded from Just-Say-Do.com a few years ago, but the site is no longer available, and I have been unable to contact the author. Any help in finding Prof. Paul Poletti would be very welcome!

James Ingram  
April 2024 



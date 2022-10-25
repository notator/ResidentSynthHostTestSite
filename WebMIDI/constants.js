/*
 *  copyright 2015 James Ingram
 *  https://james-ingram-act-two.de/
 *
 *  Code licensed under MIT
 *
 *  The WebMIDI.constants namespace which defines read-only MIDI constants.
 *  ji: The CONTROL objects need to be extended to include other useful standard MIDI controls.
 *  (Not _all_ the standard MIDI controls are useful for software WebMIDISynths.)
 */

/*jslint bitwise, white */
/*global WebMIDI */

WebMIDI.namespace('constants');

WebMIDI.constants = (function()
{
	"use strict";

	var
	COMMAND = {},
	CONTROL = {},
	SYSEX = {},
	MISC = {},

	// These GM_PRESET_NAMES are written here exactly as defined at MIDI.org: 
	// http://midi.org/techspecs/gm1sound.php
	GM_PRESET_NAMES =
	[
		// Piano (1-8)
		"Acoustic Grand Piano", "Bright Acoustic Piano", "Electric Grand Piano", "Honky-tonk Piano", "Electric Piano 1",
		"Electric Piano 2", "Harpsichord", "Clavi",
		// Chromatic Percussion (9-16)
		"Celesta", "Glockenspiel", "Music Box", "Vibraphone", "Marimba", "Xylophone", "Tubular Bells", "Dulcimer",
		// Organ (17-24)
		"Drawbar Organ", "Percussive Organ", "Rock Organ", "Church Organ", "Reed Organ", "Accordion", "Harmonica",
		"Tango Accordion",
		// Guitar (25-32)
		"Acoustic Guitar (nylon)", "Acoustic Guitar (steel)", "Electric Guitar (jazz)", "Electric Guitar (clean)",
		"Electric Guitar (muted)", "Overdriven Guitar", "Distortion Guitar", "Guitar harmonics",
		// Bass (33-40)
		"Acoustic Bass", "Electric Bass (finger)", "Electric Bass (pick)", "Fretless Bass", "Slap Bass 1", "Slap Bass 2",
		"Synth Bass 1", "Synth Bass 2",
		// Strings (41-48)
		"Violin", "Viola", "Cello", "Contrabass", "Tremolo Strings", "Pizzicato Strings", "Orchestral Harp", "Timpani",
		// Ensemble (49-56)
		"String Ensemble 1", "String Ensemble 2", "SynthStrings 1", "SynthStrings 2", "Choir Aahs", "Voice Oohs", "Synth Voice",
		"Orchestra Hit",
		// Brass (57-64)
		"Trumpet", "Trombone", "Tuba", "Muted Trumpet", "French Horn", "Brass Section", "SynthBrass 1", "SynthBrass 2",
		// Reed (65-72)
		"Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax", "Oboe", "English Horn", "Bassoon", "Clarinet",
		// Pipe (73-80)
		"Piccolo", "Flute", "Recorder", "Pan Flute", "Blown Bottle", "Shakuhachi", "Whistle", "Ocarina",
		// Synth Lead (81-88)
		"Lead 1 (square)", "Lead 2 (sawtooth)", "Lead 3 (calliope)", "Lead 4 (chiff)", "Lead 5 (charang)", "Lead 6 (voice)",
		"Lead 7 (fifths)", "Lead 8 (bass + lead)",
		// Synth Pad (89-96)
		"Pad 1 (new age)", "Pad 2 (warm)", "Pad 3 (polysynth)", "Pad 4 (choir)", "Pad 5 (bowed)", "Pad 6 (metallic)",
		"Pad 7 (halo)", "Pad 8 (sweep)",
		// Synth Effects (97-104)
		"FX 1 (rain)", "FX 2 (soundtrack)", "FX 3 (crystal)", "FX 4 (atmosphere)", "FX 5 (brightness)",  "FX 6 (goblins)",
		"FX 7 (echoes)", "FX 8 (sci-fi)",
		// Ethnic (105-112)
		"Sitar", "Banjo", "Shamisen", "Koto", "Kalimba", "Bag pipe", "Fiddle", "Shanai",
		// Percussive (113-120)
		"Tinkle Bell", "Agogo", "Steel Drums", "Woodblock", "Taiko Drum", "Melodic Tom", "Synth Drum", "Reverse Cymbal",
		// Sound Effects (121-128)
		"Guitar Fret Noise", "Breath Noise", "Seashore", "Bird Tweet", "Telephone Ring", "Helicopter", "Applause",
		"Gunshot"
	],

	// These GM_PERCUSSION_NAMES are written here exactly as defined at MIDI.org: 
	// http://midi.org/techspecs/gm1sound.php
	GM_PERCUSSION_NAMES =
	[
		"Acoustic Bass Drum",// noteIndex 35
		"Bass Drum 1",   // 36
		"Side Stick",    // 37
		"Acoustic Snare",// 38
		"Hand Clap",     // 39
		"Electric Snare",// 40
		"Low Floor Tom", // 41
		"Closed Hi Hat", // 42
		"High Floor Tom",// 43
		"Pedal Hi-Hat",  // 44
		"Low Tom",       // 45
		"Open Hi-Hat",   // 46
		"Low-Mid Tom",   // 47
		"Hi-Mid Tom",    // 48
		"Crash Cymbal 1",// 49
		"High Tom",      // 50
		"Ride Cymbal 1", // 51
		"Chinese Cymbal",// 52
		"Ride Bell",     // 53
		"Tambourine",    // 54
		"Splash Cymbal", // 55
		"Cowbell",       // 56
		"Crash Cymbal 2",// 57
		"Vibraslap",     // 58
		"Ride Cymbal 2", // 59
		"Hi Bongo",      // 60
		"Low Bongo",     // 61
		"Mute Hi Conga", // 62
		"Open Hi Conga", // 63
		"Low Conga",     // 64
		"High Timbale",  // 65
		"Low Timbale",   // 66
		"High Agogo",    // 67
		"Low Agogo",     // 68
		"Cabasa",        // 69
		"Maracas",       // 70
		"Short Whistle", // 71
		"Long Whistle",  // 72
		"Short Guiro",   // 73
		"Long Guiro",    // 74
		"Claves",        // 75
		"Hi Wood Block", // 76
		"Low Wood Block",// 77
		"Mute Cuica",    // 78
		"Open Cuica",    // 79
		"Mute Triangle", // 80
		"Open Triangle"  // 81	 
	],

	commandName = function(command)
	{
		switch(command)
		{
			case COMMAND.NOTE_OFF:
				return ("noteOff");
			case COMMAND.NOTE_ON:
				return ("noteOn");
			case COMMAND.AFTERTOUCH:
				return ("aftertouch");
			case COMMAND.CONTROL_CHANGE:
				return ("controlChange");
			case COMMAND.PRESET:
				return ("preset");
			case COMMAND.CHANNEL_PRESSURE:
				return ("channelPressure");
			case COMMAND.PITCHWHEEL:
				return ("pitchWheel");
			default:
				console.warn("Bad argument");
				break;
		}
	},
	// Only AFTERTOUCH, PRESET, CHANNEL_PRESSURE and PITCHWHEEL have default values.
	commandDefaultValue = function(command)
	{
		switch(command)
		{
			case COMMAND.AFTERTOUCH:
			case COMMAND.PRESET:
			case COMMAND.CHANNEL_PRESSURE:
				return (0);
			case COMMAND.PITCHWHEEL:
				return (64);
			default:
				console.warn("Bad argument.");
				break;
		}
	},
	
	controlName = function(control)
	{
		switch(control)
		{
			case CONTROL.BANK:
				return ("bank");
			case CONTROL.MODWHEEL:
				return ("modWheel");
			case CONTROL.VOLUME:
				return ("volume");
			case CONTROL.PAN:
				return ("pan");
			case CONTROL.REVERBERATION:
				return ("reverberation");
			case CONTROL.ALL_SOUND_OFF:
				return ("allSoundOff");
			case CONTROL.ALL_CONTROLLERS_OFF:
				return ("allControllersOff");
			case CONTROL.ALL_NOTES_OFF:
			    return ("allNotesOff");
		    case CONTROL.REGISTERED_PARAMETER:
		        return ("registeredParameter");
		    case CONTROL.DATA_ENTRY:
		        return ("dataEntry");
		}
	},
	// Only 3-byte controls have default values.
	// The return value is undefined for 2-byte controls.
	controlDefaultValue = function(control)
	{
		switch(control)
		{
			case CONTROL.BANK:
			case CONTROL.MODWHEEL:
			case CONTROL.REVERBERATION:
				return (0);
			case CONTROL.VOLUME:
				return (100);
			case CONTROL.PAN:
				return (64);
			case CONTROL.MIXTURE_INDEX:
				return (127); // 127 is "no mixture"
		    case CONTROL.REGISTERED_PARAMETER:
		        return (0); // 0 is pitchWheelDeviation (=semitones)
		    case CONTROL.DATA_ENTRY:
		        return (2); // default pitchWheelDeviation is 2 semitones
			default:
				break;	// return undefined
		}
	},

	generalMIDIPresetName = function(presetIndex)
	{
		var presetName;
		if(presetIndex >= 0 && presetIndex <= GM_PRESET_NAMES.length)
		{
			presetName = GM_PRESET_NAMES[presetIndex];
		}
		else
		{
			console.warn("Bad argument");
		}
		return presetName;
	},

	generalMIDIPercussionName = function(noteIndex)
	{
		var
		percussionName,
		indexOfFirstPercussionName = 35,
		index = noteIndex - indexOfFirstPercussionName;

		if(index >= 0 && index <= GM_PERCUSSION_NAMES.length)
		{
			percussionName = GM_PERCUSSION_NAMES[index];
		}
		else
		{
			console.warn("Bad argument");
		}
		return percussionName;
	},

    API =
    {
        COMMAND: COMMAND,
		CONTROL: CONTROL,
		SYSEX: SYSEX,
		MISC: MISC,
        commandName: commandName,
        commandDefaultValue: commandDefaultValue,
        controlName: controlName,
        controlDefaultValue: controlDefaultValue,
        generalMIDIPresetName: generalMIDIPresetName,
        generalMIDIPercussionName: generalMIDIPercussionName
    };

	// COMMAND
    Object.defineProperty(COMMAND, "NOTE_OFF", { value: 0x80, writable: false });
    Object.defineProperty(COMMAND, "NOTE_ON", { value: 0x90, writable: false });
    Object.defineProperty(COMMAND, "AFTERTOUCH", { value: 0xA0, writable: false });
    Object.defineProperty(COMMAND, "CONTROL_CHANGE", { value: 0xB0, writable: false });
    Object.defineProperty(COMMAND, "PRESET", { value: 0xC0, writable: false });
    Object.defineProperty(COMMAND, "CHANNEL_PRESSURE", { value: 0xD0, writable: false });
	Object.defineProperty(COMMAND, "PITCHWHEEL", { value: 0xE0, writable: false });
	Object.defineProperty(COMMAND, "SYSEX", { value: 0xF0, writable: false });

    // CONTROL
	// Only the "coarse" versions of these controls are supported.
	// (Moritz does not write the "fine" versions either.)
    Object.defineProperty(CONTROL, "BANK", { value: 0, writable: false });
	Object.defineProperty(CONTROL, "MODWHEEL", { value: 1, writable: false });
	Object.defineProperty(CONTROL, "DATA_ENTRY", { value: 6, writable: false });
	Object.defineProperty(CONTROL, "VOLUME", { value: 7, writable: false });
	Object.defineProperty(CONTROL, "PAN", { value: 10, writable: false });
	Object.defineProperty(CONTROL, "EXPRESSION", {value: 11, writable: false});
	Object.defineProperty(CONTROL, "MIXTURE_INDEX", {value: 75, writable: false}); // Custom control: MIDI SOUND_CONTROL_6
	Object.defineProperty(CONTROL, "SET_CHANNEL_STATE", {value: 76, writable: false}); // Custom control: MIDI SOUND_CONTROL_7
	Object.defineProperty(CONTROL, "REVERBERATION", {value: 91, writable: false});
    Object.defineProperty(CONTROL, "REGISTERED_PARAMETER", { value: 101, writable: false });
    Object.defineProperty(CONTROL, "ALL_SOUND_OFF", { value: 120, writable: false });
    Object.defineProperty(CONTROL, "ALL_CONTROLLERS_OFF", { value: 121, writable: false });
	Object.defineProperty(CONTROL, "ALL_NOTES_OFF", { value: 123, writable: false });

	// SYSEX
	// byte 0 is COMMAND.SYSEX (= 0xF0)
	// byte 1
	Object.defineProperty(SYSEX, "REAL_TIME", { value: 0x7F, writable: false });
	Object.defineProperty(SYSEX, "NON_REAL_TIME", { value: 0x7E, writable: false });
	// DeviceID (1 or 3 bytes)
	Object.defineProperty(SYSEX, "THREE_BYTE_DEVICE_ID_BYTE0", { value: 0x00, writable: false });
	Object.defineProperty(SYSEX, "RESEARCH_DEVICE_ID", { value: 0x7D, writable: false });
	// MIDI Tuning#1 (byte following DeviceID)
	Object.defineProperty(SYSEX, "MIDI_TUNING", { value: 0x08, writable: false });
	// MIDI Tuning#2 (byte following Tuning#1 "MIDI_TUNING")
	Object.defineProperty(SYSEX, "MIDI_TUNING_NOTE_CHANGES_NON_REAL_TIME_BANK", { value: 0x07, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_BULK_DUMP_REQUEST", { value: 0x00, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_BULK_DUMP_REQUEST_BANK", { value: 0x03, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_BULK_DUMP_REPLY_REAL_TIME", { value: 0x09, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_BULK_DUMP_REPLY_NON_REAL_TIME", { value: 0x01, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_SCALE_OCTAVE_TUNING_DUMP_1BYTE_REAL_TIME", { value: 0x08, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_SCALE_OCTAVE_TUNING_DUMP_1BYTE_NON_REAL_TIME", { value: 0x05, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_SCALE_OCTAVE_TUNING_DUMP_2BYTE_REAL_TIME", { value: 0x09, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_SCALE_OCTAVE_TUNING_DUMP_2BYTE_NON_REAL_TIME", { value: 0x06, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_KEY-BASED_TUNING_DUMP", { value: 0x04, writable: false });
	Object.defineProperty(SYSEX, "MIDI_TUNING_NOTE_CHANGE", { value: 0x02, writable: false });	

	Object.defineProperty(SYSEX, "END_OF_MESSAGE", { value: 0xF7, writable: false });

	// MISC
	Object.defineProperty(MISC, "MIDI_0_FREQUENCY", { value: 8.1758, writable: false }); // Hertz
	Object.defineProperty(MISC, "MIDI_DEFAULT_PITCHWHEEL_SENSITIVITY", { value: 2, writable: false }); // semitones

	return API;
} ());

    

/*
 *  copyright 2015 James Ingram
 *  https://james-ingram-act-two.de/
 *
 *  Code licensed under MIT
 *
 *  The ResSynth.constants namespace which defines read-only MIDI constants.
 *  ji: The CONTROL objects need to be extended to include other useful standard MIDI controls.
 *  (Not _all_ the standard MIDI controls are useful for software WebMIDISynths.)
 */

/*jslint bitwise, white */
/*global ResSynth */

ResSynth.constants = (function()
{
	"use strict";

	var
		COMMAND = {},
		CONTROL = {},
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
				"FX 1 (rain)", "FX 2 (soundtrack)", "FX 3 (crystal)", "FX 4 (atmosphere)", "FX 5 (brightness)", "FX 6 (goblins)",
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
				case COMMAND.CONTROL_CHANGE:
					return ("controlChange");
				case COMMAND.PRESET:
					return ("preset");
				case COMMAND.PITCHWHEEL:
					return ("pitchWheel");
				default:
					console.warn("Bad argument");
					break;
			}
		},

		// Only PRESET and PITCHWHEEL have default values.
		commandDefaultValue = function(command)
		{
			switch(command)
			{
				case COMMAND.PRESET:
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
				case CONTROL.EXPRESSION:
					return ("expression");
				case CONTROL.REVERBERATION:
					return ("reverberation");
				case CONTROL.PITCH_WHEEL_SENSITIVITY:
					return ("pitchWheelSensitivity");
				case CONTROL.VELOCITY_PITCH_SENSITIVITY:
					return ("velocityPitchSensitivity");

				case CONTROL.REGISTERED_PARAMETER:
					return ("registeredParameter");
				case CONTROL.DATA_ENTRY:
					return ("dataEntry");

				case CONTROL.ALL_SOUND_OFF:
					return ("allSoundOff");
				case CONTROL.ALL_CONTROLLERS_OFF:
					return ("allControllersOff");
				case CONTROL.ALL_NOTES_OFF:
					return ("allNotesOff");
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
				case CONTROL.REGISTERED_PARAMETER:
				case CONTROL.REVERBERATION:
				case CONTROL.MIXTURE_INDEX:
				case CONTROL.TUNING_GROUP_INDEX:
				case CONTROL.TUNING_INDEX:
				case CONTROL.SEMITONES_OFFSET:
				case CONTROL.CENTS_OFFSET:
				case CONTROL.VELOCITY_PITCH_SENSITIVITY:
					return (0);
				case CONTROL.PITCH_WHEEL_SENSITIVITY:
				case CONTROL.DATA_ENTRY:
					return (2);
				case CONTROL.VOLUME:
				case CONTROL.EXPRESSION:
					return (100);
				case CONTROL.PAN:
					return (64);
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
			MISC: MISC,
			commandName: commandName,
			commandDefaultValue: commandDefaultValue,
			controlName: controlName,
			controlDefaultValue: controlDefaultValue,
			generalMIDIPresetName: generalMIDIPresetName,
			generalMIDIPercussionName: generalMIDIPercussionName
		};

	// COMMAND
	Object.defineProperty(COMMAND, "NOTE_OFF", {value: 0x80, writable: false});
	Object.defineProperty(COMMAND, "NOTE_ON", {value: 0x90, writable: false});
	Object.defineProperty(COMMAND, "CONTROL_CHANGE", {value: 0xB0, writable: false});
	Object.defineProperty(COMMAND, "PRESET", {value: 0xC0, writable: false});
	//Object.defineProperty(COMMAND, "AFTERTOUCH", { value: 0xA0, writable: false });
	//Object.defineProperty(COMMAND, "CHANNEL_PRESSURE", { value: 0xD0, writable: false });
	Object.defineProperty(COMMAND, "PITCHWHEEL", {value: 0xE0, writable: false});
	//Object.defineProperty(COMMAND, "SYSEX", { value: 0xF0, writable: false });

	// CONTROL
	Object.defineProperty(CONTROL, "BANK", {value: 0, writable: false});
	Object.defineProperty(CONTROL, "MODWHEEL", {value: 1, writable: false});
	Object.defineProperty(CONTROL, "DATA_ENTRY", {value: 6, writable: false}); // REGISTERED_PARAMETER value 0, data = pitchBendSensitivity
	Object.defineProperty(CONTROL, "VOLUME", {value: 7, writable: false});
	Object.defineProperty(CONTROL, "PAN", {value: 10, writable: false});
	Object.defineProperty(CONTROL, "EXPRESSION", {value: 11, writable: false});
	Object.defineProperty(CONTROL, "REGISTERED_PARAMETER", {value: 101, writable: false}); // only data = 0 is allowed (DATA_ENTRY data = pitchBendSensitivity)
	Object.defineProperty(CONTROL, "ALL_SOUND_OFF", {value: 120, writable: false});
	Object.defineProperty(CONTROL, "ALL_CONTROLLERS_OFF", {value: 121, writable: false});
	// Custom
	Object.defineProperty(CONTROL, "REVERBERATION", {value: 91, writable: false}); // MIDI Effects_level
	Object.defineProperty(CONTROL, "PITCH_WHEEL_SENSITIVITY", {value: 16, writable: false}); // MIDI General_purpose_slider_1. (value is semitones)	
	Object.defineProperty(CONTROL, "MIXTURE_INDEX", {value: 17, writable: false}); // MIDI General_purpose_slider_2 (value is the index of the mixture)
	Object.defineProperty(CONTROL, "TUNING_GROUP_INDEX", {value: 18, writable: false}); // MIDI General_purpose_slider_3 (value is the index of the tuning group)
	Object.defineProperty(CONTROL, "TUNING_INDEX", {value: 19, writable: false}); // MIDI General_purpose_slider_4  (value is the index of the tuning)	
	Object.defineProperty(CONTROL, "SEMITONES_OFFSET", {value: 80, writable: false}); // MIDI General_purpose_button_1. (sent value is semitonesOffset + 50)
	Object.defineProperty(CONTROL, "CENTS_OFFSET", {value: 81, writable: false}); // MIDI General_purpose_button_2. (sent value is centsOffset + 50)
	// MIDI General_purpose_button_3 (value 82) is currently unused
	Object.defineProperty(CONTROL, "VELOCITY_PITCH_SENSITIVITY", {value: 83, writable: false}); // MIDI General_purpose_button_4. (value is semitones / 127)
	Object.defineProperty(CONTROL, "SET_KEYBOARD_ORNAMENT_DEFS", {value: 75, writable: false}); // MIDI Sound Control 6. (value is ornament index)
	// use MIDI Sound Control 7, 8, 9, 10 (CC 77, 78, 79) for future controls

	return API;
}());



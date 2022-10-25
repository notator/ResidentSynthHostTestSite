console.log('load actionDefs.js');

WebMIDI.namespace('actionDefs');

// These definitions define states that can be set in particular channels by sending a specialised MIDI message:
//      setChannelStateMessage = [COMMAND.CONTROL_CHANGE+channel, SOUND_CONTROL_6, stateIndex];
// The channel argument is the channel to be set,
//     SOUND_CONTROL_6 is 75(= standard MIDI, defined in WebMIDI.constants),
//     stateIndex is the index of the state in the array defined here.
//
// In the ResidentSynth Host:
//		A state index is maintained independently for each channel.
//      When a designated keyboard key is pressed, the setChannelStateMessage is sent and the channel's current
//      stateIndex is incremented. When the index reaches the number of defined states, it is reset to 0.
// In the AssistantPerformer:
//		The setChannelStateMessage is written into the score, in the usual way, at the place where it is to be sent.
//
// Each stateDef must have a .name attribute. The other attributes are all optional.
// The full set of optional action attributes is (in the order they occur in the ResidentSynth Host GUI):
//		.fontIndex // executed before bankIndex and/or presetIndex, sets bankIndex=0, presetIndex=0
//		.bankIndex
//		.presetIndex
//      .mixtureIndex 
//		.tuningGroupIndex // executed before tuningIndex, sets tuningIndex=0
//		.tuningIndex
//		.pitchWheel (value in range 0..127)
//		.modWheel (value in range 0..127)
//		.volume (value in range 0..127)
//		.pan(value in range 0..127)
//		.reverberation (value in range 0..127)
//		.pitchWheelSensitivity (value in range 0..127)
//
// Before setting the above values, the setChannelStateMessage automatically
//     1. sets ALL_CONTROLLERS_OFF(the synth automatically sets ALL_SOUND_OFF)
//     2. sets fontIndex, bankIndex and presetIndex to 0
//     3. sets tuningGroupIndex and tuningIndex to 0 -- (usually setting 12-tone equal temperament) 
WebMIDI.stateDefs =
	[
		{
			name: "stateIndex 0: set fontIndex=1, tuningIndex=1",
			fontIndex: 1,
			tuningIndex: 1
		},
		{
			name: "stateIndex 1: set fontIndex=2, tuningIndex=2",
			fontIndex: 2,
			tuningIndex: 2
		},
		{
			name: "stateIndex 2: set fontIndex=3, presetIndex=3, tuningIndex=3",
			fontIndex: 3,
			presetIndex: 3,
			mixtureIndex: 1,
			tuningIndex: 3
		},
		{
			name: "stateIndex 3: set tuningGroupIndex=1",
			tuningGroupIndex: 1
		},
		{
			name: "stateIndex 4: set tuningGroupIndex=2, tuningIndex=1",
			tuningGroupIndex: 2,
			tuningIndex: 1
		},
		{
			name: "stateIndex 5: set pitchWheel=64,	modWheel=64, volume=64,	pan=0, reverberation=64, pitchWheelSensitivity=5",
			pitchWheel: 64,
			modWheel: 64,
			volume: 64,
			pan: 0,
			reverberation: 64,
			pitchWheelSensitivity: 5
		}
		// etc. more state definitions can be added here.
	];
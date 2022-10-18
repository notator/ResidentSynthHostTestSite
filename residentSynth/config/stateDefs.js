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
//		.bankIndex // executed before presetIndex, sets presetIndex=0
//		.presetIndex
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
//     2. sets fontIndex, bankIndex and presetIndex to 0 (often setting GrandPiano)
//     3. sets tuningGroupIndex and tuningIndex to 0 -- (usually setting 12-tone equal temperament) 
WebMIDI.stateDefs =
	[
		{
			name: "stateIndex 0: set preset index 1, tuning index 1",
			presetIndex: 1,
			tuningIndex: 1
		},
		{
			name: "stateIndex 1: set preset index 2, tuning index 2",
			presetIndex: 2,
			tuningIndex: 2
		},
		{
			name: "stateIndex 2: set preset index 3, tuning index 3",
			presetIndex: 3,
			tuningIndex: 3
		},
		{
			name: "stateIndex 3: set preset index 4, tuning index 4",
			presetIndex: 4,
			tuningIndex: 4
		},
		{
			name: "stateIndex 4: set preset index 5, tuning index 0",
			presetIndex: 5,
			tuningIndex: 0
		},
		{
			name: "stateIndex 5: set preset index 6, tuning index 1",
			presetIndex: 6,
			tuningIndex: 1
		},
		{
			name: "stateIndex 6: set preset index 7, tuning index 2",
			presetIndex: 7,
			tuningIndex: 2
		},
		{
			name: "stateIndex 7: set preset index 8, tuning index 3",
			presetIndex: 8,
			tuningIndex: 3
		},
		{
			name: "stateIndex 8: set preset index 9, tuning index 4",
			presetIndex: 9,
			tuningIndex: 4
		},
		{
			name: "stateIndex 9: set preset index 10, tuning index 0",
			presetIndex: 10,
			tuningIndex: 0
		},
		{
			name: "stateIndex 9: set preset index 11, tuning index 1",
			presetIndex: 11,
			tuningIndex: 1
		},
		{
			name: "stateIndex 9: set preset index 12, tuning index 2",
			presetIndex: 12,
			tuningIndex: 2
		},
		{
			name: "stateIndex 9: set preset index 13, tuning index 3",
			presetIndex: 13,
			tuningIndex: 3
		}
		// etc. more state definitions can be added here.
	];
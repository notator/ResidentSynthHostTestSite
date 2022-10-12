console.log('load actionDefs.js');

WebMIDI.namespace('actionDefs');

// These definitions define actions to be performed in particular channels when triggered in real time.
// In the ResidentSynth Host:
//		Actions are triggered in the current output channel when a designated keyboard key is pressed.
//		The performed action is the one pointed to by the apropriate nextActionIndex.
//		When the action has been performed, the nextActionIndex is incremented. When too large, nextActionIndex is reset to 0.
// In the AssistantPerformer:
//		An action will be triggered by writing it into the score at the place where it should occur (with the appropriate channel and index).
//
// Each action must have a .name attribute. The other attributes are all optional here.
// The full set of optional action attributes is (in the order they occur in the ResidentSynth Host GUI):
//		.fontIndex
//		.bankIndex
//		.presetIndex
//		.tuningGroupIndex
//		.tuningIndex
//		.triggerKey (value in range 0..127)
//		.aftertouch (value in range 0..127)
//		.pitchWheel14Bit (value in range 0..127)
//		.modWheel (value in range 0..127)
//		.volume (value in range 0..127)
//		.pan(value in range 0..127)
//		.reverberation (value in range 0..127)
//		.pitchWheelSensitivity (value in range 0..127)
//		.allControllersOff (boolean, works if defined as true)
//		.allSoundOff (boolean, works if defined as true)
//
// If an action attribute is undefined here, the action leaves the corresponding parameter as it is.
// An exception will be thrown when an action is triggered if:
//		either the channel has no defined actions.
//		or the channel has no defined action at the required index.
WebMIDI.actionDefs =
	[
		{
			channel: 0,
			nextActionIndex: 0,
			actions:
				[
					{
						name: "set preset index 1, tuning index 1",
						presetIndex: 1,
						tuningIndex: 1
					},
					{
						name: "set preset index 2, tuning index 2",
						presetIndex: 2,
						tuningIndex: 2
					}
					// etc. more Trigger Action definitions can be added here.
				]
		},
		{
			channel: 1,
			nextActionIndex: 0,
			actions:
				[
					{
						name: "set preset index 1, tuning index 1",
						presetIndex: 3,
						tuningIndex: 3
					},
					{
						name: "set preset index 2, tuning index 2",
						presetIndex: 4,
						tuningIndex: 4
					}
					// etc. more Trigger Action definitions can be added here.
				]
		},
		{
			channel: 2,
			nextActionIndex: 0,
			actions:
				[
					{
						name: "set preset index 1, tuning index 1",
						presetIndex: 5,
						tuningIndex: 5
					},
					{
						name: "set preset index 2, tuning index 2",
						presetIndex: 6,
						tuningIndex: 6
					}
					// etc. more Trigger Action definitions can be added here.
				]
		},
		{
			channel: 3,
			nextActionIndex: 0,
			actions:
				[
					{
						name: "set preset index 1, tuning index 1",
						presetIndex: 1,
						tuningIndex: 1
					},
					{
						name: "set preset index 2, tuning index 2",
						presetIndex: 2,
						tuningIndex: 2
					}
					// etc. more Trigger Action definitions can be added here.
				]
		},
		{
			channel: 4,
			nextActionIndex: 0,
			actions:
				[
					{
						name: "set preset index 1, tuning index 1",
						presetIndex: 1,
						tuningIndex: 1
					},
					{
						name: "set preset index 2, tuning index 2",
						presetIndex: 2,
						tuningIndex: 2
					}
					// etc. more Trigger Action definitions can be added here.
				]
		}
	];
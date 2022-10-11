console.log('load actionDefs.js');

WebMIDI.namespace('actionDefs');

// These definitions define actions to be performed in particular channels when triggered in real time.
// The ResidentSynth Host triggers actions in its current output channel when a designated keyboard key is pressed.
// The performed action is the one pointed to by the apropriate nextActionIndex,
// and the nextActionIndex is then incremented. When too large, nextActionIndex is reset to 0.
// In the AssistantPerformer, the actions defined here could simply be triggered by writing the action's
// channel and index into the score at the place where they should occur.
// The full set of possible action attributes is:
// If an attribute is undefined here, the action should set the corresponding parameter to its default value.
// If a non-existent (=undefined) action is triggered, an exception will be thrown.
WebMIDI.actionDefs =
	[
		{
			channel: 0,
			nextActionIndex: 0,
			actions:
				[
					{
						name: "set preset index 1, tuning index 1",
						presetSelectIndex: 1,
						tuningSelectIndex: 1
					},
					{
						name: "set preset index 2, tuning index 2",
						presetSelectIndex: 2,
						tuningSelectIndex: 2
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
						presetSelectIndex: 3,
						tuningSelectIndex: 3
					},
					{
						name: "set preset index 2, tuning index 2",
						presetSelectIndex: 4,
						tuningSelectIndex: 4
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
						presetSelectIndex: 5,
						tuningSelectIndex: 5
					},
					{
						name: "set preset index 2, tuning index 2",
						presetSelectIndex: 6,
						tuningSelectIndex: 6
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
						presetSelectIndex: 1,
						tuningSelectIndex: 1
					},
					{
						name: "set preset index 2, tuning index 2",
						presetSelectIndex: 2,
						tuningSelectIndex: 2
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
						presetSelectIndex: 1,
						tuningSelectIndex: 1
					},
					{
						name: "set preset index 2, tuning index 2",
						presetSelectIndex: 2,
						tuningSelectIndex: 2
					}
					// etc. more Trigger Action definitions can be added here.
				]
		}
	];
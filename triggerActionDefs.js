console.log('load triggerActionDefs.js');

WebMIDI.namespace('triggerActionDefs');

// These definitions define the options in the triggerActionsSelect.
// When the synth key selected in the triggerKeySelect is pressed on the synth,
// presetSelect.selectedIndex is set to triggerAction.presetSelectIndex, and
// tuningSelect.selectedIndex is set to triggerAction.tuningSelectIndex.
// The synth's selected preset and tuning are set accordingly.
WebMIDI.triggerActionDefs =
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
	];
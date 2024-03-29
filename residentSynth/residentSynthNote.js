/*
* Copyright 2015 James Ingram
* https://james-ingram-act-two.de/
*
* This code is based on the gree soundFont synthesizer at
* https://github.com/gree/sf2synth.js
*
* All this code is licensed under MIT
*/

ResSynth.residentSynthNote = (function()
{
    "use strict";

	var
		ResidentSynthNote = function(audioContext, zone, midi, channelControls, channelAudioNodes)
		{
			if(!(this instanceof ResidentSynthNote))
			{
				return new ResidentSynthNote(audioContext, noteGainNode, zone, midi);
			}

			let noteGainNode = audioContext.createGain(),
				channelInputNode = channelAudioNodes.inputNode;

			noteGainNode.connect(channelInputNode);

			this.audioContext = audioContext;
			this.noteGainNode = noteGainNode;
			this.channelInputNode = channelInputNode;
			this.zone = zone;

			this.keyKey = midi.keyKey; // the noteOff key that stops this note.
			this.keyPitch = midi.keyPitch;
			this.velocityFactor = midi.velocity / 127;

			this.pitchWheel14Bit = channelControls.pitchWheel14Bit; // a value in range [-8192..+8191]
			this.pitchWheelSensitivity = channelControls.pitchWheelSensitivity;

			this.velocityPitchValue14Bit = midi.velocityPitchValue14Bit;
			this.velocityPitchSensitivity = channelControls.velocityPitchSensitivity; // host sends range 0..0.6;

			if(channelAudioNodes.modNode !== undefined)
			{
				this.updateModWheel(channelAudioNodes.modNode, channelAudioNodes.modGainNode, channelControls.modWheel);
			}
		},

	API =
	{
		ResidentSynthNote: ResidentSynthNote // constructor
	};

	ResidentSynthNote.prototype.noteOn = function()
	{
		function setNoteEnvelope(gain, now, velocityFactor, vEnvData)
		{
			// Surikov's WebAudioFontPlayer only uses volumes greater than 0.000001.
			// I think this may be to compensate for an old Web Audio bug that
			// produced clicks in the output, but that has since been corrected.
			// Using zero volume no longer seems to be a problem.
			// Note too, that I am using a basic attack-hold-decay envelope, without
			// Surikov's custom envelope capability.

			let volume = velocityFactor, // volume is always 1 * velocityFactor
				attackEndTime = now + vEnvData.attack, // attack max volume time
				holdEndTime = attackEndTime + vEnvData.hold,
				decayEndTime = holdEndTime + vEnvData.decay;				

			gain.cancelScheduledValues(now);
			gain.setValueAtTime(0, now); // initialize volume
			gain.linearRampToValueAtTime(volume, attackEndTime); // attack
			gain.linearRampToValueAtTime(volume, holdEndTime); // hold
			gain.linearRampToValueAtTime(0, decayEndTime); // decay
		}

		function getBufferSourceNode(audioContext, keyPitch, zone)
		{
			let doLoop = (zone.loopStart < 1 || zone.loopStart >= zone.loopEnd) ? false : true,
				baseDetune = zone.originalPitch - 100.0 * zone.coarseTune - zone.fineTune,
				bufferSourceNode = audioContext.createBufferSource();

			bufferSourceNode.buffer = zone.buffer;
			if(doLoop === true)
			{
				bufferSourceNode.loop = true;
				bufferSourceNode.loopStart = zone.loopStart / zone.sampleRate + zone.delay;
				bufferSourceNode.loopEnd = zone.loopEnd / zone.sampleRate + zone.delay;
			}
			else
			{
				bufferSourceNode.loop = false;
			}

			bufferSourceNode.standardPlaybackRate = Math.pow(2, (100.0 * keyPitch - baseDetune) / 1200.0);

			return bufferSourceNode;
		}

		let	audioContext = this.audioContext,
			zone = this.zone,
			noteGainNode = this.noteGainNode,
			now = this.audioContext.currentTime;

		this.startTime = now; // used in updatePitchWheel

		this.envelopeDuration = zone.vEnvData.envelopeDuration; // used in setTimeout below, and in updatePitchWheel()
		this.noteOffReleaseDuration = zone.vEnvData.noteOffReleaseDuration; 
		setNoteEnvelope(noteGainNode.gain, now, this.velocityFactor, zone.vEnvData);

		this.bufferSourceNode = getBufferSourceNode(audioContext, this.keyPitch, zone);
		this.updatePitchWheel(this.pitchWheel14Bit);
		this.bufferSourceNode.onended = function()
		{
			// see https://stackoverflow.com/questions/46203191/should-i-disconnect-nodes-that-cant-be-used-anymore
			noteGainNode.disconnect(this.channelInputNode);
			//console.log("The note's bufferSourceNode has stopped, and its noteGainNode has been disconnected.");
		};
		this.bufferSourceNode.connect(noteGainNode);

		// see https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
		// N.B. zone.delay is defined/set to 0 when loading/adjusting the zone, and never changes.
		this.bufferSourceNode.start(now, zone.delay, this.envelopeDuration + 0.5);
	};

	ResidentSynthNote.prototype.noteOff = function()
	{
		let
			noteGainNode = this.noteGainNode,
			stopTime = this.audioContext.currentTime + this.noteOffReleaseDuration;

		noteGainNode.gain.cancelScheduledValues(0);
		noteGainNode.gain.linearRampToValueAtTime(0, stopTime);

		this.bufferSourceNode.stop(stopTime);

		return stopTime;
	};

	// This function is called when the bufferSourceNode has just been created, and
	// can be called again to shift the pitch while the note is still playing.
	ResidentSynthNote.prototype.updatePlaybackRate = function()
	{
		if((this.startTime + this.envelopeDuration) > this.audioContext.currentTime)
		{
			let pitchBend = this.pitchWheel14Bit,
				pitchBendFactor = Math.pow(Math.pow(2, 1 / 12), (this.pitchWheelSensitivity * (pitchBend / (pitchBend < 0 ? 8192 : 8191)))),
				velocityPitchValue = this.velocityPitchValue14Bit,
				velocityPitchChangeFactor = Math.pow(Math.pow(2, 1 / 12), (this.velocityPitchSensitivity * (velocityPitchValue / (velocityPitchValue < 0 ? 8192 : 8191)))),
				factor = pitchBendFactor * velocityPitchChangeFactor,
				bufferSourceNode = this.bufferSourceNode,
				newPlaybackRate = bufferSourceNode.standardPlaybackRate * factor;

			bufferSourceNode.playbackRate.setValueAtTime(newPlaybackRate, 0);
		}
	};

	// This function is called when the bufferSourceNode has just been created, and
	// can be called again to shift the pitch while the note is still playing.
	// The pitchWheel14Bit argument is a 14-bit int value (in range [-8192..+8191]).
	ResidentSynthNote.prototype.updatePitchWheel = function(pitchWheel14Bit)
	{
		this.pitchWheel14Bit = pitchWheel14Bit;
		this.updatePlaybackRate();
	};

	ResidentSynthNote.prototype.updateModWheel = function(modNode, modGainNode, value)
	{
		let modVal = value / 127,
			modulationFrequency = Math.pow(this.keyPitch, 1 + modVal) + modVal,
			modGain = modVal;

		modNode.frequency.setValueAtTime(modulationFrequency, this.audioContext.currentTime);
		modGainNode.gain.setValueAtTime(modGain, this.audioContext.currentTime);
	};

	return API;

}());

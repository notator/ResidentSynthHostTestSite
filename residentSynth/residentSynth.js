/* Copyright 2020 James Ingram, Sergey Surikov
 * https://james-ingram-act-two.de/
 * https://github.com/surikov
 *  
 * This code has been developed from the code for my original ResidentSf2Synth:
 * https://github.com/notator/WebMIDISynthHost/residentSf2Synth/residentSf2Synth.js.
 * It uses both javascript preset files, cloned from
 * https://surikov.github.io/webaudiofontdata/sound/, and
 * other code that originated in the following repository:
 * https://github.com/surikov/webaudiofont
 * 
 * All the code in this project is covered by an MIT license.
 * https://github.com/surikov/webaudiofont/blob/master/LICENSE.md
 * https://github.com/notator/WebMIDISynthHost/blob/master/License.md
 */

/* WebMIDI.residentSynth namespace containing a ResidentSynth constructor.
 * 
 * The original object of creating this code was to be able to discuss and improve the interface.
 * See the discussion at https://github.com/WebAudio/web-midi-api/issues/124
 */

WebMIDI.namespace('residentSynth');

WebMIDI.residentSynth = (function(window)
{
	"use strict";
	let
		audioContext,
		banks, // set in synth.setSoundFont
		channelAudioNodes = [], // initialized in synth.open
		channelControls = [], // initialized in synth.open
		mixtures = [], // initialized by getMixtures()
		tuningGroups = [],

		// returns a three character string representing the index
		getIndexString = function(index)
		{
			let iString = index.toString();
			while(iString.length < 3)
			{
				iString = "0" + iString;
			}
			return iString;
		},

		// Called by the constructor, which sets this.webAudioFonts to the return value of this function.
		// Creates all the WebAudioFonts defined in "config/webAudioFontDefs.js",
		// adjusting (=decoding) all the required WebAudioFontPresets.
		getWebAudioFonts = function(audioContext)
		{
			function adjustAllPresetVariables()
			{
				// Adapted from code in Sergey Surikov's WebAudioFontLoader
				function decodeAfterLoading(audioContext, variableName)
				{
					// ji: This function just waits until window[variableName] exists,
					// i.e. until the variable has loaded.
					function waitUntilLoaded(variableName, onLoaded)
					{
						if(window[variableName])
						{
							onLoaded();
						}
						else
						{
							setTimeout(function()
							{
								waitUntilLoaded(variableName, onLoaded);
							}, 111);
						}
					}

					// The presetName parameter has only been added for use in console.log when the preset adjustment is complete.
					function adjustPreset(audioContext, preset, presetName)
					{
						// 13.01.2020, ji: Added presetName and isLastZone arguments for console.log code
						function adjustZone(audioContext, zone, presetName, isLastZone)
						{
							function numValue(aValue, defValue)
							{
								if(typeof aValue === "number")
								{
									return aValue;
								} else
								{
									return defValue;
								}
							}

							// 13.01.2020 -- ji
							// The original preset files used by the ResidentSynth all have a zone.file attribute
							// but neither zone.buffer nor zone.sample attributes. I have therefore deleted the
							// original (Surikov) code for coping with those cases.
							// (This code creates and sets the zone.buffer attribute.)
							if(zone.file)
							{
								// 27.02.2020 -- ji
								// Added this nested condition since this code can now be revisited afer creating zone.buffer.
								if(zone.buffer === undefined)
								{
									// this code sets zone.buffer
									var datalen = zone.file.length;
									var arraybuffer = new ArrayBuffer(datalen);
									var view = new Uint8Array(arraybuffer);
									var decoded = atob(zone.file);
									var b;
									for(let i = 0; i < decoded.length; i++)
									{
										b = decoded.charCodeAt(i);
										view[i] = b;
									}
									// 12.01.2020, ji: Changed to Promise syntax.
									audioContext.decodeAudioData(arraybuffer).then(function(audioBuffer)
									{
										zone.buffer = audioBuffer;
										// 13.01.2020, ji: Added console.log code 
										if(isLastZone === true)
										{
											console.log("adjusted " + presetName);
										}
									});
								}
							}
							else // 13.01.2020 -- ji
							{
								throw "zone.file not found.";
							}
							// The value of zone.delay never changes in Surikov's code (as far as I can see).
							// It is the duration between calling bufferNode.start(...) and the time at which the attack phase begins.
							// For simplicity, it could be deleted.
							zone.delay = 0;
							zone.loopStart = numValue(zone.loopStart, 0);
							zone.loopEnd = numValue(zone.loopEnd, 0);
							zone.coarseTune = numValue(zone.coarseTune, 0);
							zone.fineTune = numValue(zone.fineTune, 0);
							zone.originalPitch = numValue(zone.originalPitch, 6000);
							zone.sampleRate = numValue(zone.sampleRate, 44100);
							// The zone.sustain attribute is defined but never used by Surikov (as far as I can see).
							// zone.sustain = numValue(zone.originalPitch, 0);
						}

						for(let zoneIndex = 0; zoneIndex < preset.zones.length; zoneIndex++)
						{
							let isLastZone = (zoneIndex === (preset.zones.length - 1));
							adjustZone(audioContext, preset.zones[zoneIndex], presetName, isLastZone);
						}
					}

					waitUntilLoaded(variableName, function()
					{
						adjustPreset(audioContext, window[variableName], variableName);
					});
				}

				let webAudioFontDefs = WebMIDI.webAudioFontDefs;
				for(let i = 0; i < webAudioFontDefs.length; i++)
				{
					let presetNamesPerBank = webAudioFontDefs[i].presetNamesPerBank;
					for(let bankIndex = 0; bankIndex < presetNamesPerBank.length; bankIndex++)
					{
						let presetNames = presetNamesPerBank[bankIndex];
						for(var nameIndex = 0; nameIndex < presetNames.length; nameIndex++)
						{
							let variable = presetNames[nameIndex];
							if(variable.includes("_tone_")) // "percussion" presets are decoded below.
							{
								decodeAfterLoading(audioContext, variable);
							}
						}
					}
				}

				if(WebMIDI.percussionPresets !== undefined)
				{
					let percussionPresets = WebMIDI.percussionPresets;
					for(let i = 0; i < percussionPresets.length; i++)
					{
						let presetKeys = percussionPresets[i].keys;
						for(let j = 0; j < presetKeys.length; j++)
						{
							let variable = presetKeys[j];
							decodeAfterLoading(audioContext, variable);
						}
					}
				}
			}

			// sets window[<percussionFontName>].zones
			//      each zone.midi to presetIndex
			function getPercussionPresets()
			{
				if(WebMIDI.percussionPresets === undefined)
				{
					return undefined;
				}
				else
				{
					let percussionPresets = [];

					for(var i = 0; i < WebMIDI.percussionPresets.length; i++)
					{
						let zones = [];
						let presetDef = WebMIDI.percussionPresets[i];
						for(var j = 0; j < presetDef.keys.length; j++)
						{
							let keyVariable = presetDef.keys[j],
								keyZone = window[keyVariable].zones[0];

							keyZone.midi = presetDef.presetIndex;
							zones.push(keyZone);
						}
						percussionPresets.push({name: presetDef.name, zones: zones});
					}
					return percussionPresets;
				}
			}

			function finalizeAllPresetsPerBank(webAudioFontDef, percussionPresets)
			{
				// returns a string of the form "000:000 - " + standardGMPresetName + " (" + soundFontSourceName + ")"
				// where the "000" groups are the bank and preset indices.
				function getPresetOptionName(presetName, bankIndex, originalPresetIndex, isPercussion)
				{
					function getIndex(str, substr, ind)
					{
						let len = str.length, i = -1;
						while(ind-- && i++ < len)
						{
							i = str.indexOf(substr, i);
							if(i < 0) break;
						}
						return i;
					}

					let presetOptionName = "error: illegal presetVariable",
						bankString = getIndexString(bankIndex),
						presetString = getIndexString(originalPresetIndex);

					if(isPercussion === true)
					{
						presetOptionName = bankString + ":" + presetString + " - " + presetName;
					}
					else
					{
						let truncStart = getIndex(presetName, "_", 3) + 1,
							truncEnd = getIndex(presetName, "_", 4);

						if(truncStart > 0 && truncEnd > 0 && truncEnd > truncStart)
						{
							let soundFontSourceName = presetName.slice(truncStart, truncEnd),
								gmName = WebMIDI.constants.generalMIDIPresetName(originalPresetIndex);

							presetOptionName = bankString + ":" + presetString + " - " + gmName + " (" + soundFontSourceName + ")";
						}

					}

					return presetOptionName;
				}

				let allPresetsPerBank = [];

				let presetNamesPerBank = webAudioFontDef.presetNamesPerBank;
				for(let bankIndex = 0; bankIndex < presetNamesPerBank.length; ++bankIndex)
				{
					let bankPresets = [],
						presetNames = presetNamesPerBank[bankIndex];

					for(var presetIndex = 0; presetIndex < presetNames.length; presetIndex++)
					{
						let isPercussion = false,
							presetName = presetNames[presetIndex],
							zones;

						if(window[presetName] === undefined)
						{
							if(percussionPresets !== undefined)
							{
								let percussionPreset = percussionPresets.find(preset => preset.name.localeCompare(presetName) === 0);
								zones = percussionPreset.zones;
								isPercussion = true;
							}
						}
						else
						{
							zones = window[presetName].zones;
						}
						let originalPresetIndex = zones[0].midi,
							presetOptionName = getPresetOptionName(presetName, bankIndex, originalPresetIndex, isPercussion);

						bankPresets.push({name: presetOptionName, originalPresetIndex: originalPresetIndex, zones: zones});
					}

					allPresetsPerBank.push(bankPresets);
				}

				return allPresetsPerBank;
			}

			function adjustForResidentSynth(webAudioFont)
			{
				function setZonesToMaximumRange(presetName, originalPresetIndex, zones)
				{
					let bottomZone = zones[0],
						topZone = zones[zones.length - 1],
						expanded = false;

					if(bottomZone.keyRangeLow !== 0)
					{
						bottomZone.keyRangeLow = 0;
						expanded = true;
					}
					if(topZone.keyRangeHigh !== 127)
					{
						topZone.keyRangeHigh = 127;
						expanded = true;
					}

					if(expanded)
					{
						let gmName = WebMIDI.constants.generalMIDIPresetName(originalPresetIndex);
						console.warn("WAFSynth: extended the pitch range of preset " + presetName + " (" + gmName + ").");
					}
				}

				function deleteZoneAHDSRs(zones)
				{
					for(var i = 0; i < zones.length; i++)
					{
						if(! delete zones[i].ahdsr)
						{
							console.warn("Failed to delete preset.ahdsr.");
						}
					}
				}

				function setZoneVEnvData(presetName, originalPresetIndex, zones)
				{
					// envTypes:
					// 0: short envelope (e.g. drum, xylophone, percussion)
					// 1: long envelope (e.g. piano)
					// 2: unending envelope (e.g. wind instrument, organ)
					const PRESET_ENVTYPE = {SHORT: 0, LONG: 1, UNENDING: 2},
						MAX_DURATION = 300000, // five minutes should be long enough...
						DEFAULT_NOTEOFF_RELEASE_DURATION = 0.2;

					function presetEnvType(isPercussion, originalPresetIndex)
					{
						const shortEnvs =
							[13,
								45, 47,
								55,
								112, 113, 114, 115, 116, 117, 118, 119,
								120, 123, 127
							],
							longEnvs = [
								0, 1, 2, 3, 4, 5, 6, 7,
								8, 9, 10, 11, 12, 14, 15,
								24, 25, 26, 27, 28, 29, 30, 31,
								46,
								32, 33, 34, 35, 36, 37, 38, 39,
								104, 105, 106, 107, 108, 109, 110, 111
							],
							unendingEnvs = [
								16, 17, 18, 19, 20, 21, 22, 23,
								40, 41, 42, 43, 44,
								48, 49, 50, 51, 52, 53, 54,
								56, 57, 58, 59, 60, 61, 62, 63,
								64, 65, 66, 67, 68, 69, 70, 71,
								72, 73, 74, 75, 76, 77, 78, 79,
								80, 81, 82, 83, 84, 85, 86, 87,
								88, 89, 90, 91, 92, 93, 94, 95,
								96, 97, 98, 99, 100, 101, 102, 103,
								121, 122, 124, 125, 126
							];

						if(isPercussion)
						{
							return PRESET_ENVTYPE.SHORT;
						}
						else if(shortEnvs.indexOf(originalPresetIndex) >= 0)
						{
							return PRESET_ENVTYPE.SHORT;
						}
						else if(longEnvs.indexOf(originalPresetIndex) >= 0)
						{
							return PRESET_ENVTYPE.LONG;
						}
						else if(unendingEnvs.indexOf(originalPresetIndex) >= 0)
						{
							return PRESET_ENVTYPE.UNENDING;
						}
						else
						{
							throw "presetIndex not found.";
						}
					}

					function checkDurations(envData)
					{
						// The following restrictions apply because setTimeout(..) uses a millisecond delay parameter:
						// ((envData.envelopeDuration * 1000) <= Number.MAX_VALUE), and
						// ((envData.noteOffReleaseDuration * 1000) + 1000) < Number.MAX_VALUE) -- see noteOff().
						// These should in practice never be a problem, but just in case...
						if(!((envData.envelopeDuration * 1000) <= Number.MAX_VALUE)) // see noteOn() 
						{
							throw "illegal envelopeDuration";
						}

						if(!(((envData.noteOffReleaseDuration * 1000) + 1000) < Number.MAX_VALUE)) // see noteOff()
						{
							throw "illegal noteOffReleaseDuration";
						}
					}

					function setSHORT_vEnvData(zones)
					{
						// Sets attack, hold, decay and release durations for each zone.
						for(var i = 0; i < zones.length; i++)
						{
							let vEnvData = {attack: 0, hold: 0.5, decay: 4.5, release: DEFAULT_NOTEOFF_RELEASE_DURATION}; // Surikov envelope
							vEnvData.envelopeDuration = 5; // zoneVEnvData.attack + zoneVEnvData.hold + zoneVEnvData.decay;
							vEnvData.noteOffReleaseDuration = DEFAULT_NOTEOFF_RELEASE_DURATION; // zoneVEnvData.release;
							zones[i].vEnvData = vEnvData;
						}
						checkDurations(zones[0].vEnvData);
					}

					function setLONG_vEnvData(presetName, originalPresetIndex, zones)
					{
						// Sets attack, hold, decay and release durations for each zone.
						// The duration values are set to increase logarithmically per pitchIndex
						// from the ..Low value at pitchIndex 0 to the ..High value at pitchIndex 127.
						// The values per zone are then related to the pitchIndex of zone.keyRangeLow,
						function setCustomLONGEnvData(zones, aLow, aHigh, hLow, hHigh, dLow, dHigh, rLow, rHigh)
						{
							let aFactor = (aHigh === 0 || aLow === 0) ? 1 : Math.pow(aHigh / aLow, 1 / 127),
								hFactor = (hHigh === 0 || hLow === 0) ? 1 : Math.pow(hHigh / hLow, 1 / 127),
								dFactor = (dHigh === 0 || dLow === 0) ? 1 : Math.pow(dHigh / dLow, 1 / 127),
								rFactor = (rHigh === 0 || rLow === 0) ? 1 : Math.pow(rHigh / rLow, 1 / 127);

							for(var i = 0; i < zones.length; i++)
							{
								let zone = zones[i],
									keyLow = zone.keyRangeLow,
									a = aLow * Math.pow(aFactor, keyLow),
									h = hLow * Math.pow(hFactor, keyLow),
									d = dLow * Math.pow(dFactor, keyLow),
									r = rLow * Math.pow(rFactor, keyLow);

								let vEnvData = {attack: a, hold: h, decay: d, release: r};
								vEnvData.envelopeDuration = a + h + d; // zoneVEnvData.attack + zoneVEnvData.hold + zoneVEnvData.decay;
								vEnvData.noteOffReleaseDuration = r; // zoneVEnvData.release;
								checkDurations(vEnvData);
								zone.vEnvData = vEnvData;
							}
						}

						// The following presetIndices have LONG envelopes:
						// 0, 1, 2, 3, 4, 5, 6, 7,
						// 8, 9, 10, 11, 12, 14, 15,
						// 24, 25, 26, 27, 28, 29, 30, 31,
						// 32, 33, 34, 35, 36, 37, 38, 39,
						// 46 (Harp)
						// 104, 105, 106, 107, 108, 109, 110, 111
						//
						// 02.2020: Except for Harpsichord, the following presetIndices
						// are all those used by the AssistantPerformer(GrandPiano + Study2)
						switch(originalPresetIndex)
						{
							case 0: // Grand Piano						
								setCustomLONGEnvData(zones, 0, 0, 0, 0, 25, 5, 1, 0.5);
								break;
							case 6: // Harpsichord -- not used by AssistantPerformer 02.2020
								setCustomLONGEnvData(zones, 0, 0, 0, 0, 15, 1, 0.5, 0.1);
								break;
							case 8: // Celesta
								setCustomLONGEnvData(zones, 0, 0, 0, 0, 8, 4, 0.5, 0.1);
								break;
							case 9: // Glockenspiel
								setCustomLONGEnvData(zones, 0, 0, 0.002, 0.002, 6, 1.5, 0.4, 0.1);
								break;
							case 10: // MusicBox
								setCustomLONGEnvData(zones, 0, 0, 0, 0, 8, 0.5, 0.5, 0.1);
								break;
							case 11: // Vibraphone
								setCustomLONGEnvData(zones, 0, 0, 0.4, 0.4, 10, 3, 0.5, 0.1);
								break;
							case 12: // Marimba
								setCustomLONGEnvData(zones, 0, 0, 0, 0, 9.5, 0.6, 0.5, 0.1);
								break;
							//case 13: // Xylophone -- used by AssistantPerformer, but does not have a LONG envelope.
							//	break;
							case 14: // Tubular Bells
								setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 20, 5, 0.5, 0.1);
								break;
							case 15: // Dulcimer
								setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 10, 0.4, 0.4, 0.04);
								break;
							case 24: // NylonGuitar
								setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 7, 0.3, 0.3, 0.05);
								break;
							case 25: // AcousticGuitar (steel)
								setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 7, 0.3, 0.3, 0.05);
								break;
							case 26: // ElectricGuitar (Jazz)
								setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 7, 0.3, 0.3, 0.05);
								break;
							case 27: // ElectricGuitar (clean)
								setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 7, 0.3, 0.3, 0.05);
								break;
							case 46: // Harp
								setCustomLONGEnvData(zones, 0, 0, 0.5, 0.5, 10, 0.4, 0.4, 0.04);
								break;
							default:
								console.warn("Volume envelope data has not been defined for preset " + originalPresetIndex.toString() + " (" + presetName + ").");
						}
					}

					function setUNENDING_vEnvData(zones)
					{
						// Sets attack, hold, decay and release durations for each zone.
						for(var i = 0; i < zones.length; i++)
						{
							let vEnvData = {attack: 0, hold: MAX_DURATION, decay: 0, release: DEFAULT_NOTEOFF_RELEASE_DURATION}; // Surikov envelope
							vEnvData.envelopeDuration = MAX_DURATION; // zoneVEnvData.attack + zoneVEnvData.hold + zoneVEnvData.decay;
							vEnvData.noteOffReleaseDuration = DEFAULT_NOTEOFF_RELEASE_DURATION; // zoneVEnvData.release;
							zones[i].vEnvData = vEnvData;
						}
						checkDurations(zones[0].vEnvData);
					}

					let isPercussion = presetName.includes("percussion"),
						envType = presetEnvType(isPercussion, zones[0].midi);

					// envTypes:
					// 0: short envelope (e.g. drum, xylophone, percussion)
					// 1: long envelope (e.g. piano)
					// 2: unending envelope (e.g. wind instrument, organ)
					switch(envType)
					{
						case PRESET_ENVTYPE.SHORT:
							setSHORT_vEnvData(zones);
							break;
						case PRESET_ENVTYPE.LONG:
							setLONG_vEnvData(presetName, originalPresetIndex, zones);
							break;
						case PRESET_ENVTYPE.UNENDING:
							setUNENDING_vEnvData(zones);
							break;
					}
				}

				let banks = webAudioFont.banks;

				for(var bankIndex = 0; bankIndex < banks.length; bankIndex++)
				{
					let presets = banks[bankIndex];
					for(var presetIndex = 0; presetIndex < presets.length; presetIndex++)
					{
						let preset = presets[presetIndex],
							presetName = preset.name,
							originalPresetIndex = preset.originalPresetIndex,
							zones = preset.zones;

						setZonesToMaximumRange(presetName, originalPresetIndex, zones);
						// The residentSynth is going to use the zone.vEnvData attributes
						//(which are set below) instead of the original zone.ahdsr attributes.
						// The zone.ahdsr attributes are deleted here to avoid confusion.
						deleteZoneAHDSRs(zones);
						setZoneVEnvData(presetName, originalPresetIndex, zones);

						// the originalPresetIndex attribute is not part of the ResidentSynth's API,
						// so should be deleted before it is exposed.
						delete preset.originalPresetIndex;
					}
				}

				return webAudioFont;
			}

			// See: https://stackoverflow.com/questions/758688/sleep-in-javascript-delay-between-actions
			function sleepUntilAllFontsAreReady(webAudioFonts)
			{
				function sleep(ms)
				{
					return new Promise(res => setTimeout(res, ms));
				}

				async function waitUntilWebAudioFontIsReady(webAudioFont)
				{
					while(!webAudioFont.isReady())
					{
						console.log('Sleeping');
						await sleep(100);
						console.log('Done sleeping');
					}
				}

				for(var i = 0; i < webAudioFonts.length; i++)
				{
					let webAudioFont = webAudioFonts[i];
					if(webAudioFont.isReady() === false)
					{
						waitUntilWebAudioFontIsReady(webAudioFont);
					}
				}
			}

			let webAudioFontDefs = WebMIDI.webAudioFontDefs, // defined in webAudioFonts/webAudioFonts.js
				webAudioFonts = [],
				percussionPresets = getPercussionPresets(); // undefined if there are no percussion presets

			adjustAllPresetVariables();

			for(let fontIndex = 0; fontIndex < webAudioFontDefs.length; ++fontIndex)
			{
				let webAudioFontDef = webAudioFontDefs[fontIndex],
					name = webAudioFontDef.name,
					allPresetsPerBank = finalizeAllPresetsPerBank(webAudioFontDef, percussionPresets),
					presetNamesPerBank = webAudioFontDef.presetNamesPerBank,
					webAudioFont = new WebMIDI.webAudioFont.WebAudioFont(name, allPresetsPerBank, presetNamesPerBank);

				// The webAudioFont's zone.file attributes need not have been completely adjusted (=unpacked) when
				// this function is called since neither the zone.file nor the binary zone.buffer attributes are accessed.
				let adjustedWebAudioFont = adjustForResidentSynth(webAudioFont);

				webAudioFonts.push(adjustedWebAudioFont);
			}

			sleepUntilAllFontsAreReady(webAudioFonts);

			return webAudioFonts;
		},

		getMixtures = function()
		{
			// There can be at most 256 [keyIncrement, velocityFactor] extraNotes components.
			// KeyIncrement components must be integers in range [-127..127].
			// VelocityFactor components are usually floats > 0 and < 1, but can be <= 100.0.
			function checkMixtures(mixtures)
			{
				let nIncrVels = 0;
				for(var i = 0; i < mixtures.length; i++)
				{
					console.assert(mixtures[i].name !== undefined);
					let extraNotes = mixtures[i].extraNotes;
					for(var k = 0; k < extraNotes.length; k++)
					{
						let keyVel = extraNotes[k],
							keyIncr = keyVel[0],
							velFac = keyVel[1];

						console.assert(keyVel.length === 2);
						console.assert(Number.isInteger(keyIncr) && keyIncr >= -127 && keyIncr <= 127);
						console.assert(velFac > 0 && velFac <= 100.0);

						nIncrVels++;
					}
				}

				console.assert(nIncrVels <= 256);
			}

			if(WebMIDI.mixtureDefs !== undefined)
			{
				mixtures = WebMIDI.mixtureDefs;
				checkMixtures(mixtures);
			}

			return mixtures; // can be empty
		},

		getTuningGroups = function(tuningsFactory)
		{
			let tuningGroupDefs = WebMIDI.tuningDefs,
				wmtg = WebMIDI.tuningConstructors;

			if(tuningGroupDefs === undefined || tuningGroupDefs.length === 0)
			{
				// default tuning
				let tuningGroup = [],
					tuning = tuningsFactory.getEqualTemperamentTuning();

				tuning.name = "Equal Temperament";
				tuningGroup.push(tuning);
				tuningGroups.push(tuningGroup);
			}
			else
			{
				for(var i = 0; i < tuningGroupDefs.length; i++)
				{
					let tuningGroupDef = tuningGroupDefs[i],
						tuningDefs = tuningGroupDef.tunings,
						tuningGroup = [];

					tuningGroup.name = tuningGroupDef.name;

					switch(tuningGroupDef.ctor)
					{
						case wmtg.FUNCTION_GET_TUNING_FROM_CONSTANT_FACTOR:
							{
								for(let k = 0; k < tuningDefs.length; k++)
								{
									let tuningDef = tuningDefs[k],
										root = tuningDef.root,
										factor = tuningDef.factor,
										tuning = tuningsFactory.getTuningFromConstantFactor(root, factor);

									tuning.name = tuningDef.name;
									tuningGroup.push(tuning);
								}
								break;
							}
						case wmtg.FUNCTION_GET_PARTCH_TUNING:
							{
								for(let k = 0; k < tuningDefs.length; k++)
								{
									let tuningDef = tuningDefs[k],
										root = tuningDef.root,
										tuning = tuningsFactory.getPartchTuning(root);

									tuning.name = tuningDef.name;
									tuningGroup.push(tuning);
								}
								break;
							}
						case wmtg.FUNCTION_GET_WARPED_OCTAVES_TUNING:
							{
								for(let k = 0; k < tuningDefs.length; k++)
								{
									let tuningDef = tuningDefs[k],
										keyValuesArray = tuningDef.keyValuesArray,
										tuning = tuningsFactory.getWarpedTuning(keyValuesArray, "octaves");

									tuning.name = tuningDef.name;
									tuningGroup.push(tuning);
								}
								break;
							}
						case wmtg.FUNCTION_GET_WARPED_GAMUT_TUNING:
							{
								for(let k = 0; k < tuningDefs.length; k++)
								{
									let tuningDef = tuningDefs[k],
										keyValuesArray = tuningDef.keyValuesArray,
										tuning = tuningsFactory.getWarpedTuning(keyValuesArray, "gamut");

									tuning.name = tuningDef.name;
									tuningGroup.push(tuning);
								}
								break;
							}
						case wmtg.FUNCTION_GET_BAROQUE_TUNING:
							{
								for(let k = 0; k < tuningDefs.length; k++)
								{
									let tuningDef = tuningDefs[k],
										offsets = tuningDef.offsets,
										tuning = tuningsFactory.getBaroqueTuning(offsets);

									tuning.name = tuningDef.name;
									tuningGroup.push(tuning);
								}
								break;
							}
						default:
							console.assert(false, "Unknown tuning type.");
					}

					tuningGroups.push(tuningGroup);
				}
			}
		},

		/*****************************************/
		/* Control Functions */

		// sets both channelControl.bankIndex and channelControl.presetIndex to 0.
		updateFontIndex = function(channel, fontIndex)
		{
			channelControls[channel].fontIndex = fontIndex;
			channelControls[channel].bankIndex = 0;
			channelControls[channel].presetIndex = 0;
		},
		// sets channelControl.presetIndex to 0.
		updateBankIndex = function(channel, bankIndex)
		{
			channelControls[channel].bankIndex = bankIndex;
			channelControls[channel].presetIndex = 0;
		},
		updatePresetIndex = function(channel, presetIndex)
		{
			channelControls[channel].presetIndex = presetIndex;
		},
		updateMixtureIndex = function(channel, mixtureIndex)
		{
			channelControls[channel].mixtureIndex = mixtureIndex; // for new noteOns (127 is "no mixture")
		},
		// sets channelControl.tuning to the first tuning in the group.
		updateTuningGroupIndex = function(channel, tuningGroupIndex)
		{
			channelControls[channel].tuningGroupIndex = tuningGroupIndex;
			channelControls[channel].tuning = tuningGroups[tuningGroupIndex][0];
		},
		updateTuning = function(channel, tuningIndex)
		{
			let tuningGroupIndex = channelControls[channel].tuningGroupIndex;

			channelControls[channel].tuning = tuningGroups[tuningGroupIndex][tuningIndex];
		},
		updateCentsOffset = function(channel, centsOffset)
		{
			channelControls[channel].centsOffset = centsOffset;
        },

		updateAftertouch = function(channel, key, value)
		{
			let currentNoteOns = channelControls[channel].currentNoteOns,
				noteIndex = currentNoteOns.findIndex(obj => obj.keyPitch === key),
				aftertouch14Bit = "undefined"; // will be set in range -8192..8191;

			if(noteIndex !== undefined)
			{
				if(value <= 64)
				{
					aftertouch14Bit = (128 * (value - 64)); // valueRange(0..64): -> range: 128*-64 (= -8192) .. 0
				}
				else
				{
					aftertouch14Bit = Math.floor((8191 / 63) * (value - 64)); // valueRange(65..127): -> range: 127..8191
				}

				currentNoteOns[noteIndex].updateAftertouch(aftertouch14Bit);
			}

			// channelControls[channel].aftertouch is not required because new noteOns always start with aftertouch=0.

			console.log("updateAftertouch() key: " + key + " value:" + value + " aftertouch14Bit=" + aftertouch14Bit);
		},
		updatePitchWheel = function(channel, data1, data2)
		{
			var pitchWheel14Bit = (((data2 & 0x7f) << 7) | (data1 & 0x7f)) - 8192,
				currentNoteOns = channelControls[channel].currentNoteOns;

			// data2 is the MSB, data1 is LSB.
			console.log("updatePitchWheel() data1: " + data1 + " data2:" + data2 + " pitchWheel14Bit=" + pitchWheel14Bit + " (should be in range -8192..+8191)");

			if(currentNoteOns !== undefined && currentNoteOns.length > 0)
			{
				let nNoteOns = currentNoteOns.length;
				for(let i = 0; i < nNoteOns; ++i)
				{
					currentNoteOns[i].updatePitchWheel(pitchWheel14Bit);
				}
			}

			channelControls[channel].pitchWheel14Bit = pitchWheel14Bit; // for new noteOns
		},
		updatePitchWheelSensitivity = function(channel, semitones)
		{
			let currentNoteOns = controls.currentNoteOns;
			if(currentNoteOns !== undefined && currentNoteOns.length > 0) // required for sounding notes
			{
				let pitchWheel14Bit = channelControls[channel].pitchWheel14Bit,
					nNoteOns = currentNoteOns.length;

				for(let i = 0; i < nNoteOns; ++i)
				{
					currentNoteOns[i].pitchWheelSensitivity = semitones; // 0..127 semitones
					currentNoteOns[i].updatePitchWheel(pitchWheel14Bit);
				}
			}

			channelControls[channel].pitchWheelSensitivity = semitones; // for new noteOns
		},
		// The value argument is in range [0..127], meaning not modulated to as modulated as possible.
		// The frequency of the modMode depends on the frequency of the note...
		updateModWheel = function(channel, value)
		{
			console.log("ResidentSynth: ModWheel channel:" + channel + " value:" + value);

			if(value === 0)
			{
				console.log("Temporary reminder: check that value===0 is innocuous.");
			}

			let currentNoteOns = channelControls[channel].currentNoteOns;
			if(currentNoteOns !== undefined && currentNoteOns.length > 0)
			{
				let nNoteOns = currentNoteOns.length;
				for(let i = 0; i < nNoteOns; ++i)
				{
					currentNoteOns[i].updateModWheel(channelAudioNodes[channel].modNode, channelAudioNodes[channel].modGainNode, value);
				}
			}

			channelControls[channel].modWheel = value; // for new noteOns
		},
		// The volume argument is in range [0..127], meaning muted to as loud as possible.
		updateVolume = function(channel, volume)
		{
			let volumeFactor = volume / 127;
			channelAudioNodes[channel].gainNode.gain.setValueAtTime(volumeFactor, audioContext.currentTime);
		},
		// The pan argument is in range [0..127], meaning completely left to completely right.
		updatePan = function(channel, pan)
		{
			let panValue = ((pan / 127) * 2) - 1; // panValue is in range [-1..1]
			channelAudioNodes[channel].panNode.pan.setValueAtTime(panValue, audioContext.currentTime);
		},

		// The reverberation argument is in range [0..127], meaning completely dry to completely wet.
		updateReverberation = function(channel, reverberation)
		{
			channelAudioNodes[channel].reverberator.setValueAtTime(reverberation, audioContext.currentTime);
		},

		// This function must always be called immediately before calling ResidentSynth.prototype.dataEntry(...)
		registeredParameterCoarse = function(channel, value)
		{
			channelControls[channel].registeredParameterCoarse = value;
		},
		registeredParameterFine = function(channel, value)
		{
			channelControls[channel].registeredParameterFine = value;
		},
		// ResidentSynth.prototype.registeredParameterCoarse must always be called immediately before calling this function.
		dataEntryCoarse = function(channel, value)
		{
			switch(channelControls[channel].registeredParameterCoarse)
			{
				case CTL.DATA_ENTRY_COARSE_PITCHWHEEL_SENSITIVITY:
					let semitones = value;
					updatePitchWheelSensitivity(channel, semitones);
					break;
				default:
					console.assert(false, "Unknown registered parameter.");
					break;
			}
		},
		dataEntryFine = function(channel, value)
		{
			//switch(channelControls[channel].registeredParameterFine)
			//{
			//	case REGPARAM_SET_PITCHWHEEL_SENSITIVITY:
			//		let semitones = value;
			//		updatePitchWheelSensitivity(channel, semitones);
			//		break;
			//	default:
			//		console.assert(false, "Unknown registered parameter.");
			//		break;
			//}
		},
		allSoundOff = function(channel)
		{
			function reconnectChannelInput()
			{
				// chanAudioNodes and audioContext are inherited
				chanAudioNodes.inputNode = audioContext.createStereoPanner();
				chanAudioNodes.panNode = chanAudioNodes.inputNode;
				chanAudioNodes.inputNode.connect(chanAudioNodes.reverberator.input);
			}

			var currentNoteOns = channelControls[channel].currentNoteOns,
				chanAudioNodes = channelAudioNodes[channel],
				inputNode = chanAudioNodes.inputNode,
				now = 0, stopTime = 0;

			inputNode.disconnect();
			while(currentNoteOns.length > 0)
			{
				now = audioContext.currentTime;
				stopTime = noteOff(channel, currentNoteOns[0].offKey);
			}
			setTimeout(reconnectChannelInput(), stopTime - now);
		},
		noteOn = function(channel, key, velocity)
		{
			function doNoteOn(midi)
			{
				let zone, note,
					preset = midi.preset,
					keyPitchBase = Math.floor(midi.keyPitch),
					keyPitchBaseStr, bankIndexStr, presetIndexStr, channelStr;

				zone = preset.zones.find(obj => (obj.keyRangeHigh >= keyPitchBase && obj.keyRangeLow <= keyPitchBase));
				if(!zone)
				{
					bankIndexStr = chanControls.bankIndex.toString(10);
					presetIndexStr = (chanControls.presetIndex).toString(10);
					channelStr = channel.toString(10);
					keyPitchBaseStr = keyPitchBase.toString(10);
					let warnString = "zone not found: bank=" + bankIndexStr + " presetIndex=" + presetIndexStr + " channel=" + channelStr + " key=" + keyPitchBaseStr;
					if(preset.name.includes("percussion"))
					{
						warnString += "\nThis is a percussion preset containing the following instrument indices:";
						for(var i = 0; i < preset.zones.length; i++)
						{
							warnString += " " + preset.zones[i].keyRangeLow.toString() + ",";
						}
						warnString = warnString.slice(0, -1);
					}
					console.warn(warnString);
					return;
				}

				// note on
				note = new WebMIDI.residentSynthNote.ResidentSynthNote(audioContext, zone, midi, chanControls, channelAudioNodes[channel]);
				note.noteOn();
				chanControls.currentNoteOns.push(note);
			}

			let chanControls = channelControls[channel],
				bank,
				preset,
				midi = {};

			bank = banks[chanControls.bankIndex];
			preset = bank[chanControls.presetIndex];

			console.assert(bank !== undefined);
			console.assert(preset !== undefined);

			if(velocity === 0)
			{
				let currentNoteOns = chanControls.currentNoteOns;
				let note = currentNoteOns.find(note => note.keyPitch === key);
				if(note !== undefined)
				{
					note.noteOff();
				}
				return;
			}

			midi.preset = preset;
			midi.offKey = key; // the note stops when the offKey's noteOff arrives
			midi.keyPitch = chanControls.tuning[key] - chanControls.centsOffset;
			midi.velocity = velocity;

			doNoteOn(midi);

			if(chanControls.mixtureIndex < 127) // 127 is "no mixture"
			{
				let extraNotes = mixtures[chanControls.mixtureIndex].extraNotes;
				for(var i = 0; i < extraNotes.length; i++)
				{
					let keyVel = extraNotes[i],
						newKey = key + keyVel[0],
						newVelocity = Math.floor(velocity * keyVel[1]);

					newKey = (newKey > 127) ? 127 : newKey;
					newKey = (newKey < 0) ? 0 : newKey;
					newVelocity = (newVelocity > 127) ? 127 : newVelocity;
					newVelocity = (newVelocity < 1) ? 1 : newVelocity;

					// midi.preset is unchanged
					midi.offKey = key; // the key that turns this note off (unchanged in mix)
					midi.keyPitch = chanControls.tuning[newKey] - chanControls.centsOffset;
					midi.velocity = newVelocity;

					doNoteOn(midi);
				}
			}
		},
		noteOff = function(channel, key) // velocity is unused
		{
			let currentNoteOns = channelControls[channel].currentNoteOns,
				stopTime = 0;

			for(var index = currentNoteOns.length - 1; index >= 0; index--)
			{
				if(currentNoteOns[index].offKey === key)
				{
					stopTime = currentNoteOns[index].noteOff();
					currentNoteOns.splice(index, 1);
				}
			}

			return stopTime;
		},

		/*****************************************/

		// This command sets the pitchWheel, pitchWheelSensitivity, modWheel, volume, pan and reverberation controllers
		// to their default values, but does *not* reset the current aftertouch or channelPressure.
		// Aftertouch and channelPressure start at 0, when each note is created. (channelPressure is not yet implemented.)
		setControllerDefaults = function(that, channel)
		{
			let constants = WebMIDI.constants,
				controlDefaultValue = constants.controlDefaultValue,
				pitchWheelDefaultValue = constants.commandDefaultValue(CMD.PITCHWHEEL);

			updateFontIndex(channel, 0); // sets both channelControl.bankIndex and channelControl.presetIndex to 0.
			updateTuningGroupIndex(channel, 0);  // sets channelControl.tuning to the first tuning in the group.
			updateCentsOffset(channel, 0); // centsOffset will be subtracted from the key's midiCents value in NoteOn. 

			updatePitchWheel(channel, pitchWheelDefaultValue, pitchWheelDefaultValue);
			updatePitchWheelSensitivity(channel, MISC.MIDI_DEFAULT_PITCHWHEEL_SENSITIVITY);

			updateMixtureIndex(channel, controlDefaultValue(CTL.MIXTURE_INDEX));
			updateModWheel(channel, controlDefaultValue(CTL.MODWHEEL));
			updateVolume(channel, controlDefaultValue(CTL.VOLUME));
			updatePan(channel, controlDefaultValue(CTL.PAN));
			updateReverberation(channel, controlDefaultValue(CTL.REVERBERATION));
		},

		// The stateIndex argument is in range [0..127], and is assumed to be in range of the configured stateDefs.
		updateChannelState = function(channel, stateIndex)
		{
			allSoundOff(channel);

			updateFontIndex(channel, 0); // sets both channelControl.bankIndex and channelControl.presetIndex to 0.
			updateTuningGroupIndex(channel, 0); // sets channelControl.tuning to the first tuning in the group.
			setControllerDefaults(this, channel);

			let state = WebMIDI.stateDefs[stateIndex];
			// set preset and tuning
			if(state.fontIndex !== undefined)
			{
				updateFontIndex(channel, state.fontIndex); // sets both channelControl.bankIndex and channelControl.presetIndex to 0.
			}
			if(state.bankIndex !== undefined)
			{
				updateBankIndex(channel, state.bankIndex); // sets channelControl.presetIndex to 0.
			}
			if(state.presetIndex !== undefined)
			{
				updatePresetIndex(channel, state.presetIndex);
			}
			if(state.mixtureIndex !== undefined)
			{
				updateMixtureIndex(channel, state.mixtureIndex);
			}
			if(state.tuningGroupIndex !== undefined)
			{
				updateTuningGroupIndex(channel, state.tuningGroupIndex); // sets channelControl.tuning to the first tuning in the group.
			}
			if(state.tuningIndex !== undefined)
			{
				updateTuning(channel, state.tuningIndex);
			}
			if(state.centsOffset !== undefined)
			{
				updateCentsOffset(channel, state.centsOffset);
            }

			// set controls set by setControllerDefaults() above
			if(state.pitchWheel !== undefined)
			{
				updatePitchWheel(channel, state.pitchWheel, state.pitchWheel); // 14bit?
			}
			if(state.pitchWheelSensitivity !== undefined)
			{
				updatePitchWheelSensitivity(channel, state.pitchWheelSensitivity);
			}
			if(state.modWheel !== undefined)
			{
				updateModWheel(channel, state.modWheel);
			}
			if(state.volume !== undefined)
			{
				updateVolume(channel, state.volume);
			}
			if(state.pan !== undefined)
			{
				updatePan(channel, state.pan);
			}
			if(state.reverberation !== undefined)
			{
				updateReverberation(channel, state.reverberation);
			}
		},

		CMD = WebMIDI.constants.COMMAND,
		CTL = WebMIDI.constants.CONTROL,
		MISC = WebMIDI.constants.MISC,

		// The commands and controls arrays are part of a standard WebMIDI synth's interface.
		commands =
			[
				CMD.NOTE_OFF,
				CMD.NOTE_ON,
				CMD.AFTERTOUCH,
				CMD.CONTROL_CHANGE,
				CMD.PRESET,
				//CMD.CHANNEL_PRESSURE,
				// It is very unlikely that this synth will ever need to implement CHANNEL_PRESSURE, so
                // CHANNEL_PRESSURE has been eliminated from the ResidentSynthHost development environment.
				CMD.PITCHWHEEL,
				CMD.SYSEX
			],

		controls =
			[
				// standard 3-byte controllers.

				// The WebMIDISynthHost GUI manages banks using the preset selector, so it does not provide a separate banks
				// control in the controls section of its GUI.
				// ResidentSynth.prototype.send(message, ignoredTimestamp) _does_, however, use the
				// WebMIDI.constants.CONTROL.BANK definition to call setBank(channel, data2) via handleControl(channel, data1, data2).
				// The bank can be set by other applications by sending the appropriate message.
				CTL.BANK,
				CTL.MODWHEEL,
				CTL.VOLUME,
				CTL.PAN,
				CTL.MIXTURE_INDEX, // custom control
				CTL.REVERBERATION,
				CTL.REGISTERED_PARAMETER_COARSE,
				CTL.DATA_ENTRY_COARSE,
				CTL.REGISTERED_PARAMETER_FINE,
				CTL.DATA_ENTRY_FINE,

				// standard 2-byte controllers.
				CTL.ALL_CONTROLLERS_OFF,
				CTL.ALL_SOUND_OFF
			],

		ResidentSynth = function()
		{
			if(!(this instanceof ResidentSynth))
			{
				return new ResidentSynth(midiConstants);
			}

			// WebMIDIAPI §4.6 -- MIDIPort interface
			// See https://github.com/notator/WebMIDISynthHost/issues/23
			// and https://github.com/notator/WebMIDISynthHost/issues/24
			Object.defineProperty(this, "id", { value: "ResidentSynth_v1", writable: false });
			Object.defineProperty(this, "manufacturer", { value: "james ingram (with thanks to sergey surikov)", writable: false });
			Object.defineProperty(this, "name", { value: "ResidentSynth", writable: false });
			Object.defineProperty(this, "type", { value: "output", writable: false });
			Object.defineProperty(this, "version", { value: "1", writable: false });
			Object.defineProperty(this, "ondisconnect", { value: null, writable: false }); // Do we need this at all? Is it correct to set it to null?

			/*** Is this necessary? See https://github.com/WebAudio/web-midi-api/issues/110 ***/
			/*** See also: disconnect() function below ***/
			Object.defineProperty(this, "removable", { value: true, writable: false });

			/*** Extensions for software synths ***/
			// The synth author's webpage hosting the synth. 
			Object.defineProperty(this, "url", { value: "https://github.com/notator/WebMIDISynthHost", writable: false });
			// The commands supported by this synth (see above).
			Object.defineProperty(this, "commands", { value: commands, writable: false });
			// The controls supported by this synth (see above).
			Object.defineProperty(this, "controls", { value: controls, writable: false });
			// If isMultiChannel is false or undefined, the synth ignores the channel nibble in MIDI messages
			Object.defineProperty(this, "isMultiChannel", { value: true, writable: false });
			// If isPolyphonic is false or undefined, the synth can only play one note at a time
			Object.defineProperty(this, "isPolyphonic", { value: true, writable: false });
			// If supportsGeneralMIDI is defined, and is true, then
			// 1. both COMMAND.PRESET and CONTROL.BANK MUST be defined.
			// 2. the presets can be usefully named using GM preset names.
			//    (GM preset names are returned by WebMIDI.constants.generalMIDIPresetName(originalPresetIndex). )
			// 3. in a percussion font, notes can be usefully named using the GM percussion names.
			//    (GM percussion names are returned by WebMIDI.constants.generalMIDIPercussionName(noteIndex). )
			// 4. the synth MAY define the function:
			//        void setSoundFont(soundFont)
			//    It is possible for a synth to support GM without using soundfonts.
			// 5. Clients should be sure that a preset is available before setting it.
			//    Whichever way it is set, the banks variable will contain all available banks and presets.
			Object.defineProperty(this, "supportsGeneralMIDI", { value: true, writable: false });

			/**********************************************************************************************/
			// attributes specific to this ResidentSynth
			let AudioContextFunc = (window.AudioContext || window.webkitAudioContext);

			audioContext = new AudioContextFunc();

			Object.defineProperty(this, "webAudioFonts", { value: getWebAudioFonts(audioContext), writable: false });
			Object.defineProperty(this, "mixtures", {value: getMixtures(), writable: false});
			Object.defineProperty(this, "tuningsFactory", {value: new WebMIDI.tuningsFactory.TuningsFactory(), writable: false});

			getTuningGroups(this.tuningsFactory);
			Object.defineProperty(this, "tuningGroups", {value: tuningGroups, writable: false});
		},

		API =
		{
			ResidentSynth: ResidentSynth // constructor
		};

	// end var

	ResidentSynth.prototype.setSoundFont = function(webAudioFont)
	{
		if(!webAudioFont.isReady())
		{
			throw "This function should not be called before the webAudioFont is ready!";
		}

		banks = [];
		for(var i = 0; i < webAudioFont.banks.length; i++)
		{
			let wafBank = webAudioFont.banks[i],
				bank = [];

			for(var j = 0; j < wafBank.length; j++)	
			{
				let preset = wafBank[j];
				bank[j] = preset;
			}
			banks.push(bank);
		}

		for(let channel = 0; channel < 16; ++channel)
		{
			// Set default bankIndex and presetIndex.
			// The mixture index is changed neither by this function, nor by setting the preset.
			let channelInfo = channelControls[channel];

			channelInfo.bankIndex = 0;
			channelInfo.presetIndex = 0;   // the presetIndex argument is the index in banks[0]
		}

		console.log("residentSynth WebAudioFont set.");
	};

	// WebMIDIAPI §4.6 -- MIDIPort interface
	// See https://github.com/notator/WebMIDISynthHost/issues/24
	// This is called after user interaction with the page.
	// This function sets internal default values for all the synth's commands, and controls in all channels.
	ResidentSynth.prototype.open = function()
	{
		// Create and connect the channel AudioNodes:
        function audioNodesConfig(audioContext, finalGainNode)
		{
			let channelInfo = {};			
			
			channelInfo.panNode = audioContext.createStereoPanner();
			channelInfo.reverberator = new WebMIDI.reverberator.Reverberator(audioContext);
			channelInfo.modNode = audioContext.createOscillator(),
			channelInfo.modGainNode = audioContext.createGain();
			channelInfo.gainNode = audioContext.createGain();
			channelInfo.inputNode = channelInfo.panNode;			

			channelInfo.panNode.connect(channelInfo.reverberator.input);
			channelInfo.reverberator.output.connect(channelInfo.gainNode);
			channelInfo.modNode.connect(channelInfo.modGainNode);
			channelInfo.modGainNode.connect(channelInfo.gainNode.gain);
			channelInfo.gainNode.connect(finalGainNode);

			channelInfo.modNode.type = 'sine';
			channelInfo.modNode.start();

            return channelInfo;
		}

		audioContext.resume().then(() => { console.log('AudioContext resumed successfully'); });

        channelAudioNodes.finalGainNode = audioContext.createGain();
        channelAudioNodes.finalGainNode.connect(audioContext.destination);

		for(var i = 0; i < 16; i++)
		{
			channelAudioNodes.push(audioNodesConfig(audioContext, channelAudioNodes.finalGainNode));

			let controlState = {};
			channelControls.push(controlState);
			setControllerDefaults(this, i);

			channelControls[i].currentNoteOns = [];
		}

		this.setSoundFont(this.webAudioFonts[0]);

		console.log("residentSynth opened.");
	};

	// WebMIDIAPI §4.6 -- MIDIPort interface
	// See https://github.com/notator/WebMIDISynthHost/issues/24
	ResidentSynth.prototype.close = function()
    {
        if(channelAudioNodes.length > 0)
        {
            for(var i = 0; i < 16; i++)
            {
                channelAudioNodes[i].panNode.disconnect();
                channelAudioNodes[i].reverberator.disconnect();
                channelAudioNodes[i].gainNode.disconnect();
            }
            channelAudioNodes.finalGainNode.disconnect();
            channelAudioNodes.length = 0;
            console.log("residentSynth closed.");
        }
	};

	// WebMIDIAPI MIDIOutput send()
	// This synth does not yet support timestamps (05.11.2015)
	ResidentSynth.prototype.send = function(messageData, ignoredTimestamp)
	{
		var
			command = messageData[0] & 0xF0,
			channel = messageData[0] & 0xF,
			data1 = messageData[1],
			data2 = messageData[2];

		function checkCommandExport(checkCommand)
		{
			if(checkCommand === undefined)
			{
                console.warn("Illegal command");
			}
			else
			{
				let cmd = commands.find(cmd => cmd === checkCommand);
				if(cmd === undefined)
				{
					console.warn("Command " + checkCommand.toString(10) + " (0x" + checkCommand.toString(16) + ") is not supported.");
				}
			}
		}
		function handleNoteOff(channel, data1)
		{
			checkCommandExport(CMD.NOTE_OFF);
			// console.log("residentSynth NoteOff: channel:" + channel + " note:" + data1 + " velocity:" + data2);
			noteOff(channel, data1);
		}
		function handleNoteOn(channel, data1, data2)
		{
			checkCommandExport(CMD.NOTE_ON);
			// console.log("residentSynth NoteOn: channel:" + channel + " note:" + data1 + " velocity:" + data2);
            if(data2 === 0)
            {
                noteOff(channel, data1);
            }
            else
            {
                noteOn(channel, data1, data2);
            }
		}
		// The AFTERTOUCH command can be sent from the ResidentSynthHost's GUI and, potentially,
		// from the AssistantPerformer, but it is never sent from my EMU keyboard.
		// It is implemented as a (single note) pitch bend parallel to the normal (channel) pitchWheel.
		function handleAftertouch(channel, key, value)
		{
			checkCommandExport(CMD.AFTERTOUCH);
			//console.log("residentSynth Aftertouch: channel:" + channel + " key:" + key + " value:" + value);
			updateAftertouch(channel, key, value);
        }
		function handleControl(channel, data1, data2)
		{
			function checkControlExport(control)
			{
				if(control === undefined)
				{
                    console.warn("Illegal control");
				}
				else
				{
					let ctl = controls.find(ctl => ctl === control);
					if(ctl === undefined)
					{
                        console.warn("Controller " + control.toString(10) + " (0x" + control.toString(16) + ") is not supported.");
					}
				}
			}
			function setBank(channel, value)
			{
				checkControlExport(CTL.BANK);

				channelControls[channel].bankIndex = value;
				// console.log("residentSynth Bank: channel:" + channel + " value:" + value);
			}
			function setModwheel(channel, value)
			{
				checkControlExport(CTL.MODWHEEL);
				// console.log("residentSynth ModWheel: channel:" + channel + " value:" + value);
				updateModWheel(channel, value);
			}
			function setVolume(channel, value)
			{
				checkControlExport(CTL.VOLUME);
				// console.log("residentSynth Volume: channel:" + channel + " value:" + value);
				updateVolume(channel, value);
			}
			function setPan(channel, value)
			{
				checkControlExport(CTL.PAN);
				// console.log("residentSynth Pan: channel:" + channel + " value:" + value);
				updatePan(channel, value);
			}
			function setMixtureIndex(channel, mixtureIndex)
			{
				checkControlExport(CTL.SET_CHANNEL_STATE);
				// console.log("residentSynth Pan: channel:" + channel + " value:" + value);
				updateMixtureIndex(channel, mixtureIndex);
			}
			function setChannelState(channel, stateIndex)
			{
				checkControlExport(CTL.SET_CHANNEL_STATE);
				// console.log("residentSynth Pan: channel:" + channel + " value:" + value);
				updateChannelState(channel, stateIndex);
			}

			function setReverberation(channel, value)
			{
				checkControlExport(CTL.REVERBERATION);
				// console.log("residentSynth Reverberation: channel:" + channel + " value:" + value);
				updateReverberation(channel, value);
			}

			function allControllersOff(channel)
			{
				checkControlExport(CTL.ALL_CONTROLLERS_OFF);
				// console.log("residentSynth AllControllersOff: channel:" + channel);

				allSoundOff(channel);
				setControllerDefaults(this, channel);
			}
			function setAllSoundOff(channel)
			{
				checkControlExport(CTL.ALL_SOUND_OFF);
				// console.log("residentSynth AllSoundOff: channel:" + channel);
				allSoundOff(channel);
			}

			// This function must always be called immediately before calling setDataEntry(...).
			function setRegisteredParameterCoarse(channel, value)
			{
				checkControlExport(CTL.REGISTERED_PARAMETER_COARSE);
				// console.log("residentSynth RegisteredParameter: channel:" + channel + " value:" + value);
				registeredParameterCoarse(channel, value);
			}
			function setRegisteredParameterFine(channel, value)
			{
				checkControlExport(CTL.REGISTERED_PARAMETER_FINE);
				// console.log("residentSynth RegisteredParameter: channel:" + channel + " value:" + value);
				registeredParameterFine(channel, value);
			}
			// setRegisteredParameter(...) must always be called immediately before calling this function.
			function setDataEntryCoarse(channel, value)
			{
				checkControlExport(CTL.DATA_ENTRY_COARSE);
				// console.log("residentSynth DataEntry: channel:" + channel + " value:" + semitones);
				dataEntryCoarse(channel, value);
			}
			function setDataEntryFine(channel, value)
			{
				checkControlExport(CTL.DATA_ENTRY_FINE);
				// console.log("residentSynth DataEntry: channel:" + channel + " value:" + semitones);
				dataEntryFine(channel, value);
			}

			checkCommandExport(CMD.CONTROL_CHANGE);

			switch(data1)
			{
				case CTL.BANK: // N.B. This is implemented for send, but is not an independent control in the WebMIDISynthHost's GUI
					setBank(channel, data2);
					break;
				case CTL.MODWHEEL:
					setModwheel(channel, data2);
					break;
				case CTL.VOLUME:
					setVolume(channel, data2);
					break;
				case CTL.PAN:
					setPan(channel, data2);
					break;
				case CTL.MIXTURE_INDEX:
					setMixtureIndex(channel, data2);
					break;
				case CTL.SET_CHANNEL_STATE:
					setChannelState(channel, data2);
					break;
				case CTL.REVERBERATION:
					setReverberation(channel, data2);
					break;
				case CTL.ALL_CONTROLLERS_OFF:
					allControllersOff(channel);
					break;
				case CTL.ALL_SOUND_OFF:
					setAllSoundOff(channel);
					break;
				// CTL.REGISTERED_PARAMETER_COARSE is always set immediately before setting CTL.DATA_ENTRY_COARSE.
				case CTL.REGISTERED_PARAMETER_COARSE:
					setRegisteredParameterCoarse(channel, data2);
					break;
				case CTL.REGISTERED_PARAMETER_FINE:
					setRegisteredParameterFine(channel, data2);
					break;
				// CTL.REGISTERED_PARAMETER_FINE is always set immediately before setting CTL.DATA_ENTRY_FINE.
				case CTL.DATA_ENTRY_COARSE:
					setDataEntryCoarse(channel, data2);
					break;
				case CTL.DATA_ENTRY_FINE:
					setDataEntryFine(channel, data2);
					break;

				default:
					// FINE versions of controllers are not supported (i.e. are ignored by) this synth.
                    console.warn(`Controller ${data1.toString(10)} (0x${data1.toString(16)}) is not supported.`);
			}
		}
		function handlePreset(channel, data1)
		{
			checkCommandExport(CMD.PRESET);

			channelControls[channel].presetIndex = data1;
		}
		// The CHANNEL_PRESSURE command can be sent from my EMU keyboard, but is never sent from the ResidentSynthHost GUI.
		// It could be implemented later, to do something different from the other controls.
		// When implemented, this function should, of course, have channel and data1 arguments.
		function handleChannelPressure()
		{
			//let warnMessage = "Channel pressure: channel:" + channel + " pressure:" + data1 +
			//	" (The ResidentSynth does not implement the channelPressure (0x" + CMD.CHANNEL_PRESSURE.toString(16) + ") command.)";
			//console.warn(warnMessage);
		}
		function handlePitchWheel(channel, data1, data2)
		{
			checkCommandExport(CMD.PITCHWHEEL);
			//console.log("residentSynth PitchWheel: channel:" + channel + " data1:" + data1 + " data2:" + data2);
			updatePitchWheel(channel, data1, data2);
		}

		switch(command)
		{
			case CMD.NOTE_OFF:
				handleNoteOff(channel, data1);
				break;
			case CMD.NOTE_ON:
				handleNoteOn(channel, data1, data2);
				break;
			case CMD.AFTERTOUCH:
				handleAftertouch(channel, data1, data2);
				break;
			case CMD.CONTROL_CHANGE:
				handleControl(channel, data1, data2);
				break;
			case CMD.PRESET:
				handlePreset(channel, data1);
				break;
			case CMD.CHANNEL_PRESSURE:
				handleChannelPressure();
				// handleChannelPressure(channel, data1);
				break;
			case CMD.PITCHWHEEL:
				handlePitchWheel(channel, data1, data2);
				break;
			case CMD.SYSEX:
				//handleSysEx(messageData);
				break;
			default:
				console.assert(false, "Illegal command.");
				break;
		}
	};

	// sets the channel's tuning to the tuning at tuningGroups[tuningGroupIndex][tuningIndex]
	ResidentSynth.prototype.setTuning = function(channel, tuningGroupIndex, tuningIndex)
	{
		if(tuningGroupIndex >= tuningGroups.length || tuningIndex >= tuningGroups[tuningGroupIndex].length)
		{
			throw "index out of range.";
		}

		channelControls[channel].tuning = tuningGroups[tuningGroupIndex][tuningIndex];
	};

	// sets the channel's centsOffset. centsOffset/100 will be subtracted from the tuning[key] value when executing noteOn.
	ResidentSynth.prototype.setCentsOffset = function(channel, centsOffset)
	{
		channelControls[channel].centsOffset = centsOffset / 100;
	};

	// see close() above...
	ResidentSynth.prototype.disconnect = function()
	{
		throw "Not implemented error.";
	};	

	return API;

}(window));

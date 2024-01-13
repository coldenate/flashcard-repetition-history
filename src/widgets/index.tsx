import {
	Card,
	declareIndexPlugin,
	ReactRNPlugin,
	RNPlugin,
	WidgetLocation,
} from '@remnote/plugin-sdk';

async function onActivate(plugin: ReactRNPlugin) {
	// settings

	await plugin.settings.registerBooleanSetting({
		id: 'debug-mode',
		title: 'Debug Mode (Flashcard History)',
		description: 'Enable debug mode',
		defaultValue: false,
	});

	await plugin.settings.registerBooleanSetting({
		id: 'show-past-Response',
		title: 'Show Past Response',
		description:
			'Show the past response of a flashcard by highlighting the corresponding response button when viewing the responses for a flashard.',
		defaultValue: true,
	});

	await plugin.settings.registerBooleanSetting({
		id: 'inherit-from-highlight-colors',
		title: 'Inherit Square Colors from Highlight Colors',
		description:
			'If enabled, the square colors will be inherited from the highlight colors. If disabled, the square colors will be the default colors or what you individually set them to.',
		defaultValue: true,
	});

	await plugin.settings.registerBooleanSetting({
		id: 'always-show-squares',
		title: 'Always Show Squares',
		description: 'Always show the squares for the responses',
		defaultValue: false,
	});

	// css settings

	await plugin.settings.registerStringSetting({
		id: 'square-again-color',
		title: 'Again Color',
		description: 'The color of the square for the "Again" response',
		defaultValue: '#c03c1c',
	});

	await plugin.settings.registerStringSetting({
		id: 'square-hard-color',
		title: 'Hard Color',
		description: 'The color of the square for the "Hard" response',
		defaultValue: '#D8A700',
	});

	await plugin.settings.registerStringSetting({
		id: 'square-good-color',
		title: 'Good Color',
		description: 'The color of the square for the "Good" response',
		defaultValue: '#B9D870',
	});

	await plugin.settings.registerStringSetting({
		id: 'square-easy-color',
		title: 'Easy Color',
		description: 'The color of the square for the "Easy" response',
		defaultValue: '#006344',
	});

	await plugin.settings.registerStringSetting({
		id: 'square-reset-color',
		title: 'Reset Color',
		description: 'The color of the square for the "Reset" response',
		defaultValue: 'purple',
	});

	await plugin.settings.registerStringSetting({
		id: 'square-too-early-color',
		title: 'Too Early Color',
		description: 'The color of the square for the "Too Early" response',
		defaultValue: 'gray',
	});

	await plugin.settings.registerStringSetting({
		id: 'square-viewed-as-leech-color',
		title: 'Viewed as Leech Color',
		description: 'The color of the square for the "Viewed as Leech" response',
		defaultValue: 'gray',
	});

	// events

	// plugin.event.addListener(AppEvents.QueueCompleteCard, undefined, async (data) => {});

	// widgets

	// commands

	plugin.track(async (reactivePlugin) => {
		const alwaysShowSquares = await reactivePlugin.settings.getSetting('always-show-squares');
		if (!alwaysShowSquares) {
			await plugin.app.registerWidget('ratingHistory', WidgetLocation.FlashcardUnder, {
				dimensions: {
					width: '100%',
					height: '100%',
				},
			});
			await plugin.app.unregisterWidget('ratingHistory', WidgetLocation.FlashcardUnder);
		} else if (alwaysShowSquares) {
			await plugin.app.registerWidget('ratingHistory', WidgetLocation.FlashcardUnder, {
				dimensions: {
					width: '100%',
					height: '100%',
				},
			});
			await plugin.app.unregisterWidget('ratingHistory', WidgetLocation.FlashcardUnder);
		}
		await isDebugMode(reactivePlugin).then(async (debugMode) => {
			if (debugMode) {
				plugin.app.toast('Debug Mode Enabled; Registering Debug Tools');
				await plugin.app.registerCommand({
					id: 'log-values',
					name: 'Log Values',
					description: 'Log the values of certain variables',
					quickCode: 'debug log',
					action: async () => {
						// log values
					},
				});
			}
		});
	});
}

async function isDebugMode(reactivePlugin: RNPlugin): Promise<boolean> {
	return await reactivePlugin.settings.getSetting('debug-mode');
}

export async function getMostRecentResponse(card: Card | undefined, plugin: ReactRNPlugin) {
	if (!card) throw new Error('Card not found');
	// last in array is most recent
	if (card.repetitionHistory === undefined) {
		if (await isDebugMode(plugin)) {
			plugin.app.toast('Card has no repetition history');
			throw new Error('Card has no repetition history');
		}
		return;
	}
	return card.repetitionHistory[card.repetitionHistory.length - 1].score;
}
async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);

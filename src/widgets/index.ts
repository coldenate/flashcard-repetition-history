import { declareIndexPlugin, ReactRNPlugin, RNPlugin } from '@remnote/plugin-sdk';

async function onActivate(plugin: ReactRNPlugin) {
	// settings

	await plugin.settings.registerBooleanSetting({
		id: 'show-past-Response',
		title: 'Show Past Response',
		description:
			'Show the past response of a flashcard by highlighting the corresponding response button when viewing the responses for a flashard.',
		defaultValue: true,
	});

	await plugin.settings.registerBooleanSetting({
		id: 'debug-mode',
		title: 'Debug Mode',
		description: 'Enables certain testing commands. Non-destructive.',
		defaultValue: false,
	});

	// commands

	plugin.track(async (reactivePlugin) => {
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

	async function isDebugMode(reactivePlugin: RNPlugin): Promise<boolean> {
		return await reactivePlugin.settings.getSetting('debug-mode');
	}
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);

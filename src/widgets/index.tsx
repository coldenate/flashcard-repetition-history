import {
	Card,
	declareIndexPlugin,
	ReactRNPlugin,
	WidgetLocation,
} from '@remnote/plugin-sdk';

async function onActivate(plugin: ReactRNPlugin) {
	// Register the main widget with auto-height for compatibility.
	await plugin.app.registerWidget('ratingHistory', WidgetLocation.FlashcardUnder, {
		dimensions: {
			width: '100%',
			height: '25rem',
		},
	});

	// --- SETTINGS ---
	await plugin.settings.registerDropdownSetting({
		id: 'mode',
		title: 'Display Mode',
		description: 'Choose between a simple view or an advanced view with more analytics.',
		options: [
			{ key: 'simple', label: 'Simple', value: 'simple' },
			{ key: 'advanced', label: 'Advanced', value: 'advanced' },
		],
		defaultValue: 'simple',
	});
	
	// NEW: Setting for grade label style.
	await plugin.settings.registerDropdownSetting({
		id: 'grade-label-style',
		title: 'Display Grade Names As',
		description: 'Choose between the default RemNote grade names or shorter Anki-style names.',
		options: [
			{ key: 'remnote', label: 'RemNote (longer; e.g. "Recalled with Effort")', value: 'remnote' },
			{ key: 'anki', label: 'Anki (shorter; e.g. "Good")', value: 'anki' },
		],
		defaultValue: 'remnote',
	});

	await plugin.settings.registerBooleanSetting({
		id: 'show-overdue-borders',
		title: '[Advanced] Show Overdue Borders',
		description: 'When in Advanced Mode, show a colored border on squares to indicate the overdue ratio.',
		defaultValue: true,
	});

	await plugin.settings.registerBooleanSetting({
		id: 'inherit-from-highlight-colors',
		title: 'Inherit Square Colors from Highlight Colors',
		defaultValue: true,
	});

	// The rest of the settings and CSS registration remain the same...
	const settingsToRegister = [
		{ id: 'square-forgot-color', title: 'Fill Color: Forgot', defaultValue: '#c03c1c' },
		{ id: 'square-hard-color', title: 'Fill Color: Hard', defaultValue: '#D8A700' },
		{ id: 'square-good-color', title: 'Fill Color: Good', defaultValue: '#B9D870' },
		{ id: 'square-easy-color', title: 'Fill Color: Easy', defaultValue: '#006344' },
		{ id: 'border-color-low', title: '[Advanced] Overdue Border: Low', defaultValue: '#8cb9de' },
		{ id: 'border-color-medium', title: '[Advanced] Overdue Border: Medium', defaultValue: '#f9d56e' },
		{ id: 'border-color-high', title: '[Advanced] Overdue Border: High', defaultValue: '#f2a65a' },
		{
			id: 'border-color-very-high',
			title: '[Advanced] Overdue Border: Very High',
			defaultValue: '#f78fb3',
		},
		{
			id: 'border-color-critical',
			title: '[Advanced] Overdue Border: Critical',
			defaultValue: '#d63447',
		},
	];

	for (const setting of settingsToRegister) {
		await plugin.settings.registerStringSetting(setting);
	}

	plugin.track(async (reactivePlugin) => {
		const squareForgotColor = (await plugin.settings.getSetting('square-forgot-color')) || '#c03c1c';
		const squareHardColor = (await plugin.settings.getSetting('square-hard-color')) || '#D8A700';
		const squareGoodColor = (await plugin.settings.getSetting('square-good-color')) || '#B9D870';
		const squareEasyColor = (await plugin.settings.getSetting('square-easy-color')) || '#006344';

		const borderColorLow = (await plugin.settings.getSetting('border-color-low')) || '#8cb9de';
		const borderColorMedium =
			(await plugin.settings.getSetting('border-color-medium')) || '#f9d56e';
		const borderColorHigh = (await plugin.settings.getSetting('border-color-high')) || '#f2a65a';
		const borderColorVeryHigh =
			(await plugin.settings.getSetting('border-color-very-high')) || '#f78fb3';
		const borderColorCritical =
			(await plugin.settings.getSetting('border-color-critical')) || '#d63447';

		const css = `
			:root {
				--square-forgot-color: ${squareForgotColor};
				--square-hard-color: ${squareHardColor};
				--square-good-color: ${squareGoodColor};
				--square-easy-color: ${squareEasyColor};
				--overdue-border-low: ${borderColorLow};
				--overdue-border-medium: ${borderColorMedium};
				--overdue-border-high: ${borderColorHigh};
				--overdue-border-very-high: ${borderColorVeryHigh};
				--overdue-border-critical: ${borderColorCritical};
			}
			.square-forgot { background-color: var(--square-forgot-color); }
			.square-hard { background-color: var(--square-hard-color); }
			.square-good { background-color: var(--square-good-color); }
			.square-easy { background-color: var(--square-easy-color); }
			.square-reset { background-color: purple; }
			.square-too-early { background-color: gray; }
			.square-viewed-as-leech { background-color: gray; }
		`;
		await plugin.app.registerCSS('ratingHistory-colors', css);
	});
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);

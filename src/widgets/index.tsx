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
		{ 
			id: 'square-forgot-color', 
			title: 'Fill Color: Forgot', 
			description: 'The color of the square for the "Forgot" response', 
			defaultValue: '#c03c1c' 
		},
		{ 
			id: 'square-hard-color', 
			title: 'Fill Color: Hard', 
			description: 'The color of the square for the "Hard" response', 
			defaultValue: '#D8A700' 
		},
		{ 
			id: 'square-good-color', 
			title: 'Fill Color: Good', 
			description: 'The color of the square for the "Good" response', 
			defaultValue: '#B9D870' 
		},
		{ 
			id: 'square-easy-color', 
			title: 'Fill Color: Easy', 
			description: 'The color of the square for the "Easy" response', 
			defaultValue: '#006344' 
		},
		{ 
			id: 'square-reset-color', 
			title: 'Fill Color: Reset', 
			description: 'The color of the square for the "Reset" response', 
			defaultValue: 'purple'	
		},
		{ 
			id: 'square-too-early-color', 
			title: 'Fill Color: Too Early', 
			description: 'The color of the square for the "Too Early" response', 
			defaultValue: '#fffd8d' 
		},
		{ 
			id: 'square-viewed-as-leech-color',
			title: 'Fill Color: Viewed as Leech',
			description: 'The color of the square for the "Viewed as Leech" response',
			defaultValue: 'gray', 
		},
		{ 
			id: 'border-color-low', 
			title: '[Advanced] Overdue Border: Low', 
			description: 'The border color of square for reviewed slightly late (up to 30% later than the interval)', 
			defaultValue: '#8cb9de' 
		},
		{ 
			id: 'border-color-medium', 
			title: '[Advanced] Overdue Border: Medium', 
			description: 'The border color of square for moderately overdue repetitions (30%-60% later than the interval)', 
			defaultValue: '#f9d56e' 
		},
		{ 
			id: 'border-color-high', 
			title: '[Advanced] Overdue Border: High', 
			description: 'The border color of square for highly overdue repetitions (60%-100% later than the interval)', 
			defaultValue: '#f2a65a' 
		},
		{
			id: 'border-color-very-high',
			title: '[Advanced] Overdue Border: Very High',
			description: 'The border color of square for very highly overdue repetitions (100%-200% later than the interval)', 
			defaultValue: '#f78fb3',
		},
		{
			id: 'border-color-critical',
			title: '[Advanced] Overdue Border: Critical',
			description: 'The border color of square for critically overdue repetitions (more than 3x the interval)', 
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
		const squareResetColor = (await plugin.settings.getSetting('square-reset-color')) || 'purple';
		const squareTooEarlyColor = (await plugin.settings.getSetting('square-too-early-color')) || '#fffd8d';
		const squareViewedAsLeechColor = (await plugin.settings.getSetting('square-viewed-as-leech-color')) || 'gray';

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
				--square-reset-color: ${squareResetColor};
				--square-too-early-color: ${squareTooEarlyColor};
				--square-viewed-as-leech-color: ${squareViewedAsLeechColor};
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
			.square-reset { background-color: var(--square-reset-color); }
			.square-too-early { background-color: var(--square-too-early-color); }
			.square-viewed-as-leech { background-color: var(--square-viewed-as-leech-color); }
		`;
		await plugin.app.registerCSS('ratingHistory-colors', css);
	});
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);

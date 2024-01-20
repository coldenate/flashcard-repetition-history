import {
	RNPlugin,
	WidgetLocation,
	renderWidget,
	usePlugin,
	useRunAsync,
} from '@remnote/plugin-sdk';
import { useEffect, useState } from 'react';

let cachedStyles;

function scoreToStringClassMatch(score: number, pretty: boolean = false) {
	if (pretty) {
		switch (score) {
			case 0:
				return 'Again';
			case 1:
				return 'Good';
			case 0.5:
				return 'Hard';
			case 1.5:
				return 'Easy';
			case 3:
				return 'Reset';
			case 0.01:
				return 'Too Early';
			case 2:
				return 'Viewed as Leech';
		}
	}

	let stringScore = '';
	switch (score) {
		case 0:
			stringScore = 'again';
			break;
		case 1:
			stringScore = 'good';
			break;
		case 0.5:
			stringScore = 'hard';
			break;
		case 1.5:
			stringScore = 'easy';
			break;
		case 3:
			stringScore = 'reset';
			break;
		case 0.01:
			stringScore = 'too-early';
			break;
		case 2:
			stringScore = 'viewed-as-leech';
			break;
	}

	return 'square-' + stringScore;
}

function scoreToColorClassMatch(score: number) {
	let stringColor = '';

	switch (score) {
		case 0:
			stringColor = 'red';
			break;
		case 1:
			stringColor = 'green';
			break;
		case 0.5:
			stringColor = 'orange';
			break;
		case 1.5:
			stringColor = 'blue';
			break;
		case 3:
			stringColor = 'purple';
			break;
		case 0.01:
			stringColor = 'yellow';
			break;
		case 2:
			return 'square-viewed-as-leech';
	}

	return 'highlight-color--' + stringColor;
}

function RatingHistoryWidget() {
	const plugin = usePlugin();

	const [loading, setLoading] = useState(true);
	const inheritFromHighlightColors = useRunAsync(async () => {
		const result = await plugin.settings.getSetting('inherit-from-highlight-colors');
		return result;
	}, []);

	const repetitionHistory = useRunAsync(async () => {
		const widgetContext = await plugin.widget.getWidgetContext<WidgetLocation.FlashcardUnder>();
		const card = await plugin.card.findOne(widgetContext?.cardId);
		if (!card) {
			console.error('card not found');
		}
		return card?.repetitionHistory;
	}, []);

	useEffect(() => {
		if (repetitionHistory) {
			setLoading(false);
		}
	}, [repetitionHistory]);

	if (loading || !repetitionHistory) {
		return <></>;
	}

	return (
		<div id="legend-container">
			<div id="legend">
				<div id="squares">
					{/* for each repetition history, build a square accordingly */}
					{repetitionHistory.map((history) => {
						let className: string = '';
						let tooltipText = scoreToStringClassMatch(history.score, true);

						if (inheritFromHighlightColors) {
							className = scoreToColorClassMatch(history.score);
						} else {
							className = scoreToStringClassMatch(history.score);
						}

						return (
							<div className={className} key={history.date}>
								<span className="tooltiptext">{tooltipText}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
renderWidget(RatingHistoryWidget);

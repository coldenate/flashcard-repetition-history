import { useEffect, useState } from 'react';
import {
	RNPlugin,
	WidgetLocation,
	renderWidget,
	usePlugin,
	useRunAsync,
} from '@remnote/plugin-sdk';
import './../App.css';

enum Score {
	Forgot = 0,
	RecalledWithEffort = 1,
	PartiallyRecalled = 0.5,
	EasilyRecalled = 1.5,
	Reset = 3,
	TooEarly = 0.01,
	ViewedAsLeech = 2,
}

enum Color {
	Red = 0,
	Green = 1,
	Orange = 0.5,
	Blue = 1.5,
	Purple = 3,
	Yellow = 0.01,
}

function scoreToStringClassMatch(score: number, pretty: boolean = false) {
	const scoreToStringMap: { [key: number]: string } = {
		[Score.Forgot]: 'Forgot',
		[Score.RecalledWithEffort]: 'Recalled with Effort',
		[Score.PartiallyRecalled]: 'Partially Recalled',
		[Score.EasilyRecalled]: 'Easily Recalled',
		[Score.Reset]: 'Reset',
		[Score.TooEarly]: 'Too Early',
		[Score.ViewedAsLeech]: 'Viewed as Leech',
	};

	if (pretty) {
		return scoreToStringMap[score] || '';
	}

	const stringScore = scoreToStringMap[score] || '';
	return 'square-' + stringScore.toLowerCase().replace(/\s+/g, '-');
}

function scoreToColorClassMatch(score: number) {
	const colorToStringMap: { [key: number]: string } = {
		[Color.Red]: 'red',
		[Color.Green]: 'green',
		[Color.Orange]: 'orange',
		[Color.Blue]: 'blue',
		[Color.Purple]: 'purple',
		[Color.Yellow]: 'yellow',
	};

	const stringColor = colorToStringMap[score] || '';
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
						// const className = inheritFromHighlightColors
						// 	? scoreToColorClassMatch(history.score)
						// 	: scoreToStringClassMatch(history.score);

						const className = scoreToColorClassMatch(history.score);

						return (
							<div className={`tooltip square ${className}`} key={history.date}>
								<span className="tooltiptext">
									<div className="widget-container">
										<div className="widget-item">
											<p className="widget-value">
												{scoreToStringClassMatch(history.score, true)}
											</p>
											<h4 className="widget-title">Pressed</h4>
										</div>
										<div className="widget-item">
											<p className="widget-value">
												{Math.round(history.responseTime / 1000)} seconds
											</p>
											<h4 className="widget-title">Response Time</h4>
										</div>
										<div className="widget-item">
											<p className="widget-value">
												{new Date(history.date).toLocaleDateString()}
											</p>
											<h4 className="widget-title">Practice Date</h4>
										</div>
									</div>
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

renderWidget(RatingHistoryWidget);

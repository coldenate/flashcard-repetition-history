import {
	RNPlugin,
	WidgetLocation,
	renderWidget,
	usePlugin,
	useRunAsync,
} from '@remnote/plugin-sdk';
import { useEffect, useState } from 'react';

let cachedStyles;

function scoreToStringClassMatch(score: number) {
	let stringScore = '';
	switch (score) {
		case 0:
			stringScore = 'again';
			break;
		case 1:
			stringScore = 'good';
			break;
		case 0.5:
			stringScore = 'easy';
			break;
		case 1.5:
			stringScore = 'hard';
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
			stringColor = 'blue';
			break;
		case 0.5:
			stringColor = 'orange';
			break;
		case 1.5:
			stringColor = 'green';
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
	applyCSS(plugin); // Enumeration: QueueInteractionScore

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

	if (loading) {
		return <></>;
	}

	return (
		<div id="legend-container">
			<div id="legend">
				<div id="squares">
					{/* for reach repetition history, build a square accordingly
           <div class="square square-{score} tooltip">
            <span class="tooltiptext">{score}</span>
          </div> */}

					{repetitionHistory.map((history) => {
						return (
							<div
								className={`square ${
									inheritFromHighlightColors
										? scoreToColorClassMatch(history.score)
										: scoreToStringClassMatch(history.score)
								} tooltip`}
								key={history.date}
							>
								<span className="tooltiptext">{history.score}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
renderWidget(RatingHistoryWidget);

function applyCSS(plugin: RNPlugin) {
	if (cachedStyles === null) {
		fetch(`${plugin.rootURL}App.css`)
			.then((response) => response.text())
			.then((css) => {
				cachedStyles = css;
			})
			.catch((error) => {
				console.error('Failed to fetch CSS file:', error);
			});
	}

	const styles = cachedStyles;

	const extraCSS = useRunAsync(async () => {
		return `
			.square-again {
				background-color: ${await plugin.settings.getSetting('square-again-color')};
			}
			.square-easy {
				background-color: ${await plugin.settings.getSetting('square-easy-color')};
			}
			.square-good {
				background-color: ${await plugin.settings.getSetting('square-good-color')};
			}
			.square-hard {
				background-color: ${await plugin.settings.getSetting('square-hard-color')};
			}
			.square-reset {
				background-color: purple;
			}
			.square-too-early {
				background-color: gray;
			}
			.square-viewed-as-leech {
				background-color: gray;
			}
			`;
	}, []);

	// if styles are already applied in style element, add the extra css to the existing style element
	const styleElement = document.querySelector('style');
	if (styleElement) {
		styleElement.innerHTML += extraCSS;
	} else {
		const styleElement = document.createElement('style');

		styleElement.innerHTML = styles + extraCSS;
		document.head.appendChild(styleElement);
	}

	// // Add the styles to the head of the document
	// const styleElement = document.createElement('style');

	// styleElement.innerHTML = styles + extraCSS;
	// document.head.appendChild(styleElement);
}

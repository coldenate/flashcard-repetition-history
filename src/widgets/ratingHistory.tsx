import { useEffect, useState, useRef } from 'react';
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

// Helper to get a typed setting value from a settings object with a fallback
function getSetting<T>(settings: Record<string, unknown>, key: string, defaultValue: T): T {
	return (settings[key] as T) ?? defaultValue;
}

// Returns the RemNote highlight class, e.g., 'highlight-color--green'
function scoreToHighlightColorClass(score: number): string {
	const colorMap = {
		[Color.Red]: 'red',
		[Color.Green]: 'green',
		[Color.Orange]: 'orange',
		[Color.Blue]: 'blue',
		[Color.Purple]: 'purple',
		[Color.Yellow]: 'yellow',
	};
	return 'highlight-color--' + (colorMap[score] || '');
}

// Returns the user's custom color HEX code from settings
function scoreToFillColor(score: number, settings: Record<string, unknown>): string {
	const scoreMap = {
		[Score.Forgot]: 'square-forgot-color',
		[Score.PartiallyRecalled]: 'square-hard-color',
		[Score.RecalledWithEffort]: 'square-good-color',
		[Score.EasilyRecalled]: 'square-easy-color',
	};
	const settingId = scoreMap[score];
	if (!settingId) {
		return 'gray';
	}
	return getSetting(settings, settingId, 'gray');
}

// Chooses between RemNote and Anki-style labels based on settings
function scoreToLabel(score: number, gradeLabelStyle: string): string {
	const remnoteLabelMap = {
		[Score.Forgot]: 'Forgot',
		[Score.RecalledWithEffort]: 'Recalled with Effort',
		[Score.PartiallyRecalled]: 'Partially Recalled',
		[Score.EasilyRecalled]: 'Easily Recalled',
		[Score.Reset]: 'Reset',
		[Score.TooEarly]: 'Too Early',
		[Score.ViewedAsLeech]: 'Viewed as Leech',
	};

	const ankiLabelMap = {
		[Score.Forgot]: 'Forgot',
		[Score.RecalledWithEffort]: 'Good',
		[Score.PartiallyRecalled]: 'Hard',
		[Score.EasilyRecalled]: 'Easy',
		[Score.Reset]: 'Reset',
		[Score.TooEarly]: 'Too Early',
		[Score.ViewedAsLeech]: 'Viewed as Leech',
	};

	const labelMap = gradeLabelStyle === 'anki' ? ankiLabelMap : remnoteLabelMap;
	return labelMap[score] || '';
}

function formatInterval(ms: number): string {
	const MS_IN_DAY = 1000 * 60 * 60 * 24;
	const DAYS_IN_MONTH = 30.44;
	const DAYS_IN_YEAR = 365.25;
	const totalDays = Math.round(ms / MS_IN_DAY);
	if (totalDays >= DAYS_IN_YEAR) {
		const y = Math.floor(totalDays / DAYS_IN_YEAR);
		const m = Math.floor((totalDays % DAYS_IN_YEAR) / DAYS_IN_MONTH);
		return `${y}y` + (m > 0 ? ` ${m}m` : '');
	}
	if (totalDays > 30) {
		const m = Math.floor(totalDays / DAYS_IN_MONTH);
		const d = Math.round(totalDays % DAYS_IN_MONTH);
		return `${m}m` + (d > 0 ? ` ${d}d` : '');
	}
	return `${totalDays}d`;
}

// Returns a border color HEX code from settings based on the overdue ratio
function getOverdueBorderColor(ratio: number, settings: Record<string, unknown>): string {
	if (ratio <= 1) return 'transparent';
	if (ratio < 1.3) return getSetting(settings, 'border-color-low', '#8cb9de');
	if (ratio < 1.6) return getSetting(settings, 'border-color-medium', '#f9d56e');
	if (ratio < 2.0) return getSetting(settings, 'border-color-high', '#f2a65a');
	if (ratio < 3.0) return getSetting(settings, 'border-color-very-high', '#f78fb3');
	return getSetting(settings, 'border-color-critical', '#d63447');
}

// Returns a fill color HEX code from settings based on the overdue ratio
function getOverdueFillColor(ratio: number, settings: Record<string, unknown>): string {
	if (ratio <= 1) return getSetting(settings, 'border-color-low', '#8cb9de');
	if (ratio < 1.3) return getSetting(settings, 'border-color-low', '#8cb9de');
	if (ratio < 1.6) return getSetting(settings, 'border-color-medium', '#f9d56e');
	if (ratio < 2.0) return getSetting(settings, 'border-color-high', '#f2a65a');
	if (ratio < 3.0) return getSetting(settings, 'border-color-very-high', '#f78fb3');
	return getSetting(settings, 'border-color-critical', '#d63447');
}

type TooltipState = {
	visible: boolean;
	content: React.ReactNode | null;
	top: number;
	left: number;
};

function RatingHistoryWidget() {
	const plugin = usePlugin();
	const [loading, setLoading] = useState(true);
	const [tooltip, setTooltip] = useState<TooltipState>({
		visible: false,
		content: null,
		top: 0,
		left: 0,
	});
	const tooltipRef = useRef<HTMLDivElement>(null);

	const settings = useRunAsync(async () => {
		const settingIds = [
			'mode',
			'grade-label-style',
			'inherit-from-highlight-colors',
			'show-overdue-borders', // Fetch the new setting
			'square-forgot-color',
			'square-hard-color',
			'square-good-color',
			'square-easy-color',
			'border-color-low',
			'border-color-medium',
			'border-color-high',
			'border-color-very-high',
			'border-color-critical',
		];
		const settingsMap: Record<string, any> = {};
		for (const id of settingIds) {
			settingsMap[id] = await plugin.settings.getSetting(id);
		}
		return settingsMap;
	}, []);

	const card = useRunAsync(async () => {
		const ctx = await plugin.widget.getWidgetContext<WidgetLocation.FlashcardUnder>();
		return ctx?.cardId ? await plugin.card.findOne(ctx.cardId) : null;
	}, []);

	useEffect(() => {
		if (card && settings) {
			setLoading(false);
		}
	}, [card, settings]);

	if (loading || !card || !settings) {
		return <></>;
	}

	const mode = getSetting(settings, 'mode', 'simple');
	const inheritColors = getSetting(settings, 'inherit-from-highlight-colors', true);
	const gradeLabelStyle = getSetting(settings, 'grade-label-style', 'remnote');
	const showOverdueBorders = getSetting(settings, 'show-overdue-borders', true);

	let currentNextIntervalMs = 0;
	let currentDelayMs = 0;
	let totalReviews = 0;
	let totalReviewTimeMs = 0;
	let currentUsedIntervalMs = 0;
	let currentOverdueRatio = 1;
	let overdueFillColor = '';
	let overdueBorderColor = '';

	if (card.repetitionHistory && card.repetitionHistory.length > 0) {
		totalReviews = card.repetitionHistory.length;
		totalReviewTimeMs = card.repetitionHistory.reduce((s, h) => s + h.responseTime, 0);

		if (card.nextRepetitionTime) {
			const last = card.repetitionHistory[card.repetitionHistory.length - 1];
			currentNextIntervalMs = card.nextRepetitionTime - last.date;
			const now = new Date().getTime();
			if (now > card.nextRepetitionTime) {
				currentDelayMs = now - card.nextRepetitionTime;
			}
			currentUsedIntervalMs = currentNextIntervalMs + currentDelayMs;
			currentOverdueRatio =
				currentNextIntervalMs > 0 ? currentUsedIntervalMs / currentNextIntervalMs : 1;
			overdueFillColor = getOverdueFillColor(currentOverdueRatio, settings);
			overdueBorderColor = getOverdueBorderColor(currentOverdueRatio, settings);
		}
	}

	const handleMouseEnter = (
		event: React.MouseEvent<HTMLDivElement>,
		tooltipContent: React.ReactNode
	) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const tooltipWidth = tooltipRef.current?.offsetWidth || 0;
		const windowWidth = window.innerWidth;

		let left = rect.left + rect.width / 2 - tooltipWidth / 2;

		if (left + tooltipWidth > windowWidth - 20) {
			left = windowWidth - tooltipWidth - 20;
		}
		if (left < 20) {
			left = 20;
		}

		setTooltip({
			visible: true,
			content: tooltipContent,
			top: rect.bottom + 10,
			left: left,
		});
	};

	const handleMouseLeave = () => {
		setTooltip((prev) => ({ ...prev, visible: false }));
	};

	return (
		<>
			<div
				ref={tooltipRef}
				className={`floating-tooltip ${tooltip.visible ? 'visible' : ''}`}
				style={{ top: `${tooltip.top}px`, left: `${tooltip.left}px` }}
			>
				{tooltip.content}
			</div>

			<div id="legend-container">
				<div id="legend">
					<div id="squares">
						{card.repetitionHistory?.map((history, index, array) => {
							const isLast = index === array.length - 1;
							const nextHistory = isLast ? null : array[index + 1];
							const nextIntervalMs = isLast
								? card.nextRepetitionTime
									? card.nextRepetitionTime - history.date
									: 0
								: nextHistory?.scheduled
								? nextHistory.scheduled - history.date
								: 0;

							const isFirst = index === 0;
							const prevHistory = isFirst ? null : array[index - 1];
							const calculatedIntervalMs =
								!isFirst && prevHistory ? history.scheduled - prevHistory.date : 0;
							const reviewDelayMs =
								history.scheduled && history.date > history.scheduled
									? history.date - history.scheduled
									: 0;
							const usedIntervalMs =
								!isFirst && prevHistory ? history.date - prevHistory.date : 0;
							const overdueRatio =
								calculatedIntervalMs > 0 ? usedIntervalMs / calculatedIntervalMs : 1;
							const uFactor = usedIntervalMs > 0 ? nextIntervalMs / usedIntervalMs : 0;

							const style: React.CSSProperties = {
								borderColor:
									mode === 'advanced' && showOverdueBorders
										? getOverdueBorderColor(overdueRatio, settings)
										: 'transparent',
							};

							let fillClassName = '';
							if (inheritColors) {
								fillClassName = scoreToHighlightColorClass(history.score);
							} else {
								style.backgroundColor = scoreToFillColor(history.score, settings);
							}

							const tooltipContent = (
								<div
									className={`widget-container ${
										mode === 'advanced' ? 'advanced-mode' : ''
									}`}
								>
									<div className="widget-item">
										<p className="widget-value">
											{scoreToLabel(history.score, gradeLabelStyle)}
										</p>
										<h4 className="widget-title">Pressed</h4>
									</div>
									<div className="widget-item">
										<p className="widget-value">
											{new Date(history.date).toLocaleDateString()}
										</p>
										<h4 className="widget-title">Practice Date</h4>
									</div>
									<div className="widget-item">
										<p className="widget-value">
											{Math.round(history.responseTime / 1000)}s
										</p>
										<h4 className="widget-title">Response Time</h4>
									</div>
									{nextIntervalMs > 0 && (
										<div className="widget-item">
											<p className="widget-value">{formatInterval(nextIntervalMs)}</p>
											<h4 className="widget-title">Next Interval</h4>
										</div>
									)}
									{mode === 'advanced' && !isFirst && (
										<>
											<div className="widget-item">
												<p className="widget-value">{formatInterval(reviewDelayMs)}</p>
												<h4 className="widget-title">Review Delay</h4>
											</div>
											<div className="widget-item">
												<p className="widget-value">{formatInterval(usedIntervalMs)}</p>
												<h4 className="widget-title">Used Interval</h4>
											</div>
											<div className="widget-item">
												<p className="widget-value">{`${Math.round(
													overdueRatio * 100
												)}%`}</p>
												<h4 className="widget-title">Overdue Ratio</h4>
											</div>
											{uFactor > 0 && (
												<div className="widget-item">
													<p className="widget-value">{`${uFactor.toFixed(2)}x`}</p>
													<h4 className="widget-title">U-Factor</h4>
												</div>
											)}
										</>
									)}
								</div>
							);

							return (
								<div
									className={`square ${fillClassName}`}
									style={style}
									key={history.date}
									onMouseEnter={(e) => handleMouseEnter(e, tooltipContent)}
									onMouseLeave={handleMouseLeave}
								/>
							);
						})}

						{card.nextRepetitionTime && (
							<div
								className={`square square-current-distinct`}
								style={{
									backgroundColor: overdueFillColor,
									borderColor:
										mode === 'advanced' && showOverdueBorders
											? overdueBorderColor
											: overdueFillColor,
								}}
								onMouseEnter={(e) =>
									handleMouseEnter(
										e,
										<div
											className={`widget-container ${
												mode === 'advanced' ? 'advanced-mode' : ''
											}`}
										>
											{mode === 'simple' && (
												<>
													<div className="widget-item">
														<p className="widget-value">{totalReviews}</p>
														<h4 className="widget-title">Total Reviews</h4>
													</div>
													<div className="widget-item">
														<p className="widget-value">
															{`${Math.round(totalReviewTimeMs / 60000)} min`}
														</p>
														<h4 className="widget-title">Total Review Time</h4>
													</div>
													<div className="widget-item">
														<p className="widget-value">
															{new Date(
																card.nextRepetitionTime
															).toLocaleDateString()}
														</p>
														<h4 className="widget-title">Scheduled Date</h4>
													</div>
													{currentDelayMs > 0 && (
														<div className="widget-item">
															<p className="widget-value">
																{formatInterval(currentDelayMs)}
															</p>
															<h4 className="widget-title">Current Delay</h4>
														</div>
													)}
												</>
											)}
											{mode === 'advanced' && (
												<>
													<div className="widget-item">
														<p className="widget-value">{totalReviews}</p>
														<h4 className="widget-title">Total Reviews</h4>
													</div>
													<div className="widget-item">
														<p className="widget-value">
															{`${Math.round(totalReviewTimeMs / 60000)} min`}
														</p>
														<h4 className="widget-title">Total Review Time</h4>
													</div>
													<div className="widget-item">
														<p className="widget-value">
															{formatInterval(currentNextIntervalMs)}
														</p>
														<h4 className="widget-title">Next Interval</h4>
													</div>
													<div className="widget-item">
														<p className="widget-value">
															{formatInterval(currentUsedIntervalMs)}
														</p>
														<h4 className="widget-title">Used Interval</h4>
													</div>
													<div className="widget-item">
														<p className="widget-value">{`${Math.round(
															currentOverdueRatio * 100
														)}%`}</p>
														<h4 className="widget-title">Overdue Ratio</h4>
													</div>
													{currentDelayMs > 0 && (
														<div className="widget-item">
															<p className="widget-value">
																{formatInterval(currentDelayMs)}
															</p>
															<h4 className="widget-title">Current Delay</h4>
														</div>
													)}
												</>
											)}
										</div>
									)
								}
								onMouseLeave={handleMouseLeave}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

renderWidget(RatingHistoryWidget);

<h1 align="center">
<img src="https://raw.githubusercontent.com/coldenate/flashcard-repetition-history/main/public/logo.png" alt="Flashcard Repetition History Logo" height="200px">
</h1>

<h3 align="center">
📚 Flashcard Repetition History: Visualize your learning progress! 📖
</h3>
<p align="center"> and turn Your Learning Intuition into Data!</p>


<p align="center">
<a href="https://github.com/coldenate/flashcard-repetition-history/stargazers"><img src="https://img.shields.io/github/stars/coldenate/flashcard-repetition-history?colorA=363a4f&colorB=b7bdf8&style=for-the-badge" alt="GitHub Stars"></a>
<a href="https://github.com/coldenate/flashcard-repetition-history/issues"><img src="https://img.shields.io/github/issues/coldenate/flashcard-repetition-history?colorA=363a4f&colorB=f5a97f&style=for-the-badge" alt="GitHub Issues"></a>
<a href="https://github.com/coldenate/flashcard-repetition-history/contributors"><img src="https://img.shields.io/github/contributors/coldenate/flashcard-repetition-history?colorA=363a4f&colorB=a6da95&style=for-the-badge" alt="GitHub Contributors"></a>
</p>

<p align="center">
<img src="assets/simplemode.gif" alt="Simple Mode">
</p>

## 🤔 Why You Should Use This Plugin
Ever felt like you were "getting the hang of" a topic? Or that you were constantly forgetting a specific card? This plugin transforms those feelings into concrete, visual data. It provides an at-a-glance history of your flashcard performance, empowering you to understand your learning patterns, identify difficult cards, and build a more effective study routine. Stop guessing and start seeing your progress.

## ✨ Simple vs. Advanced Mode
To provide the best experience for everyone, this plugin operates in two modes, which can be selected in the settings:

  * __Simple Mode (Default):__ A clean, minimalist view that shows your performance history at a glance. It's perfect for daily reviews without overwhelming you with data.

  * __Advanced Mode:__ Unlocks a powerful suite of analytics for users who want to dive deeper into their spaced repetition metrics. It reveals detailed statistics and new visual cues to help you truly understand your memory's behavior.

<p align="center">
<img src="assets/advancedmode.gif" alt="Advanced Mode">
</p>

## 🎨 How It Works: The Visuals
The plugin displays a row of squares for each flashcard. Each square is a time capsule of a single review session, giving you information through two visual cues: its fill color and its border color.

### Fill Color = Your Performance

The color that fills each square tells you how you graded that card. This helps you quickly spot patterns of difficulty.

### Border Color = Your Punctuality (Advanced Mode)

In Advanced Mode, the border of each square tells you how overdue the card was when you reviewed it.

Overdueness is a measure of how late you are for a scheduled review. It's calculated as a ratio: the actual time that passed (```Used Interval```) divided by the time that should have passed (```Calculated Interval```). A high ratio means you were very late.

🔵 Blue Border: Reviewed on time or slightly late.

🟡 Yellow Border: Moderately overdue (e.g., 30%-60% later than the interval).

🟠 Orange Border: Highly overdue.

🔴 Light Red Border: Very highly overdue.

⚫ Dark Red Border: Critically overdue (e.g., more than 3x the interval).

<img src="assets/overduebordercolors.png" alt="A legend showing the border colors for overdue flashcards" height="300">

__A Quick Caveat:__ To avoid confusion, remember this simple rule:

 * __Fill Color = How well you remembered.__

 * __Border Color = How on-time you were.__

This allows you to spot interesting patterns. For example, do cards with red borders (reviewed late) also tend to have red fills (forgotten)? If so, it's a strong sign that punctuality is key for that topic!

## Hovering for Details: The Analytics
Hovering over any square reveals a detailed breakdown of that review session.

### Simple Mode Tooltip

Displays the essential information for a quick overview:

 * __Pressed:__ The grade you gave the card (e.g., "Good").

 * __Practice Date:__ The date of the review.

 * __Response Time:__ How long it took you to answer.

 * __Next Interval:__ The new waiting period calculated by the SRS algorithm after that review.

### Advanced Mode Tooltip

Unlocks a full suite of SRS analytics:

 * All of the Simple Mode stats, plus:

* __Review Delay:__ How late you were for that specific review.

* __Used Interval:__ The actual time that passed between this review and the previous one.

* __Overdue Ratio:__ (Used Interval / Old Calculated Interval) shown as a percentage.

* __U-Factor (Used Interval Increase):__ A powerful metric that shows how much the __New Interval__ you got after rating the card grew compared to the __last Used Interval__ (time between your previous repetition and that specific repetition).

#### Deep Dive: What is U-Factor?

The concept of an interval increase factor is central to spaced repetition. The authors of __SuperMemo__ define __U-Factor__ as:

> "number associated with each memorized element. It equals to the ratio of the current interval and the previously used interval. ... The greater the U-Factor the greater the increase of the interval between repetitions. ... U in U-Factor stands for _used interval increase_"

This is a measure of the __stabilization__ of your __memory traces__ due to successful recall, as measured by your Spaced Repetition System (SRS) algorithm's memory model. Each time you successfully recall a flashcard, your memory traces get stronger, making them take longer to fade away. The slope of your __memory forgetting curve__ decreases, so you don't have to review that item as soon.

In simple terms, the __U-Factor__ is a measure of the empowerment your memory gained from that review, as calculated by your SRS algorithm. It's the ratio of the __new interval__ divided by the __last used interval__.

 * A __high U-Factor (e.g., 3x)__ means you are remembering the information well, and the algorithm decided you could wait much longer before the next review.

 * A __low U-Factor (e.g., 1.2x)__ means you are struggling, and the algorithm is being cautious, only slightly increasing the interval.

## 🔬 When to Check the Stats: Use-Cases
Wondering when to switch to Advanced Mode and dig into the numbers? Here are a few questions the detailed stats can help you answer:

### "Why do I keep forgetting this specific card?"

Check the Next Interval and U-Factor on your "Good" reviews. If the U-Factor is consistently high (e.g., > 3.0x), maybe the intervals are growing too quickly for this piece of information.

### "Does it really matter if I miss a day of reviews?"

Look at your history. Do you see a pattern where squares with orange or red colored borders (high overdueness) are often followed by squares with red or orange fills (poor grades)? This provides direct visual feedback on how sensitive your memory is to delays.

### "Am I actually learning, or just memorizing for the short term?"

A healthy learning pattern shows the Next Interval growing steadily over time. If your intervals for a card are stuck at a low number (e.g., 1d, 3d, 10d), it might be a "leech" card that needs to be rephrased or broken down.

## ⚙️ User Configuration
This plugin is highly customizable via the ```Settings > Plugin Settings``` menu:

 1. __Display Mode:__ Switch between the __Simple__ and __Advanced__ UI.

 2. __Display Grade Names As:__ Choose between default RemNote labels ("Recalled with Effort") or shorter, Anki-style labels ("Good").

 3. __Inherit Square Colors:__ If enabled, the fill color of the squares will match your RemNote theme's highlight colors. If disabled, you can set your own custom colors.

 4. __Custom Colors:__ In the settings, you can customize all fill colors and the overdue border colors to your liking.

## Glossary of Terms
| Term | Definition |
| :--- | :--- |
| **Next Interval** | The ideal waiting time calculated by the SRS algorithm after a review. |
| **Review Delay** | How late a specific review was, compared to its scheduled date. |
| **Used Interval** | The actual time that passed between two reviews (**Old Calculated Interval** + **Review Delay**). |
| **Overdue Ratio** | A percentage comparing the **Used Interval** to the **Old Calculated Interval**. >100% means you were on time. >200% means you took twice as long as you should have. |
| **U-Factor** | "Used Interval Increase." The ratio of the new **Next Interval** divided by the last **Used Interval**. Measures how fast the interval (and your memory stability) is growing. |
| **Stability of Memory** | How long a memory can last if not retrieved. |


## 🚧 Known Issues
 * In __multi-line cards__, where RemNote now stores sub-card info (a specific schedule record for each sub-item), the row of squares becomes somewhat cluttered and maybe not as meaningful.
 * When used with the __Incremental Everything plugin__, the history widget may be hidden on the back of the card after pressing "Show Answer." This is due to a plugin conflict that we are working to resolve.

<p align="center">
📆 Copyright &copy; 2023 <a href="https://github.com/coldenate" target="_blank">coldenate / Nathan Solis</a>
</p>

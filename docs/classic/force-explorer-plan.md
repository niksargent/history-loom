# Force Explorer Plan

## Purpose

Replace the weak `Force in focus` detail-panel card with a dedicated visual relationship surface.

The goal is to let users see:
- which force is being examined
- how strong it is in the selected period
- how it behaves across the field
- which events in the selected period it touches

## Why this exists

The old card relied too much on explanatory text:
- unclear dots
- a cramped middle `Through` block
- event relationships described rather than shown

That made it feel like narrated analytics instead of a revealing visual surface.

## Interaction model

### Left side
- force list
- grouped by polarity and ranked by selected-period strength
- selecting a force updates the explorer immediately

### Right side
- large force read for the active force
- one clear field trace across all periods
- clickable period nodes on the trace
- selected-period date-range marker
- padded trace endpoints so the first and last nodes sit cleanly inside the chart
- a stable score/date read anchored at the top-right of the explorer
- flashpoints for the selected period shown as full-width reading cards, with metadata beneath rather than in a competing side column

## What it replaces

It replaces the current detail-panel `Force in focus` card.

The detail panel should not keep a second, weaker explanation of the same relationship.

## Geography rule

Until non-Britain maps are real, geography should be:
- shown only for Britain
- suppressed for USA and France

That is better than showing the wrong map.

## Success condition

This feature is successful if:
- users can understand a force without reading several explanatory labels
- event relationships feel visibly connected to the selected force
- the main page feels more analytical in a visual sense, not just more verbose

## Next step after this

After Force Explorer:
- design `In motion` as a separate secondary view
- keep cross-dataset compare off

## Status

Implemented now:
- Force Explorer replaces the old detail-panel force card
- force selection now drives a dedicated field trace plus flashpoint surface
- the field trace can now switch periods directly from the explorer
- the selected period is marked by its date range rather than an ambiguous `current` label
- the trace now has padded endpoints so the edge periods do not clip at the chart boundary
- the score and selected date range are now held in a stable top-right position within the explorer
- flashpoints now read as full-width cards with title and summary first, then metadata pills underneath
- the Britain-specific geography inset is now hidden for USA and France until real dataset-specific maps exist

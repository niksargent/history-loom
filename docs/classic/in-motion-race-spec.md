# In Motion Race Spec

## Purpose

Define the first shippable mode of `In motion`.

`Race` is the first implementation because it is the clearest way to make force movement legible through time without adding more text to the main experience.

This is a motion-first exhibit surface, not a dashboard chart.

## Locked product decisions

- Surface type: expansive modal, following the `Compare` interaction pattern
- Dataset scope for v1: one dataset at a time
- Playback: automatic by period with smoother interpolation between period states
- Force scope: all forces visible, with one pinned force option
- Visual grammar: ranked pills, not bars
- Entry point for now: header button beside `Hide pressure lines`

## Product role

The main Loom remains the reading surface.

`Race` should answer:
- which forces lead
- which ones rise or fall sharply
- how the ordering changes through time
- whether a pinned force is surging, fading, or holding position

It should feel like:
- watching the field reorder itself
- not reading another explanation of the same data

## Visual model

### Core composition

The stage should be organised around:
- time moving left to right
- rank moving top to bottom
- active force pills aligned on the right edge
- trails extending left behind them as time advances

This means the user sees:
- the current order at the right
- the recent movement history trailing behind each force

### Why pills, not bars

Bars make this feel like a generic analytics chart.

Pills are a better fit because:
- they match the existing product language
- they can carry colour and label cleanly
- they feel more like moving entities than measured rectangles
- they support a more broadcast-style presentation

## Motion model

### Playback

Playback should advance automatically period by period, but the visible movement should interpolate at higher granularity.

That means:
- underlying keyframes remain period-based
- rendering interpolates between adjacent periods
- movement feels continuous rather than snapping at boundaries

Practical effect:
- pills slide smoothly vertically as ranks change
- trails curve or ease rather than stepping abruptly
- the current time readout progresses smoothly across the span

### Time interpolation

For v1, interpolation should be derived from the period data already available.

Recommended model:
- treat each adjacent period pair as one motion segment
- interpolate force values between them during playback
- expose this as finer-grained animation steps, visually closer to years or decades

This is a rendering strategy, not a claim that the underlying data exists yearly.

## Required features

### 1. All-force race

The race must display all forces by default.

No top-N truncation in the default state.

### 2. Pinned force

One force can be pinned.

Pinning should:
- keep that force visually stronger
- make its trail more prominent
- preserve easy tracking even when it falls in rank

### 3. Trails

Trails are required.

The race is not acceptable without them.

The trail should:
- show recent movement history
- make momentum visible
- help the eye follow a force through rank shifts

Preferred v1 treatment:
- a continuous trail extending left from the current pill position
- subtle for unpinned forces
- stronger for the pinned force

### 4. Scrub and transport

Controls should include:
- play
- pause
- restart
- scrub timeline
- speed control if needed, but only if it stays clean

### 5. Family filtering

Not mandatory for first interaction, but strongly recommended if the stage gets crowded.

Preferred filter:
- All
- Stress
- Stabiliser

## Modal structure

### Header

Minimal and operational:
- title: `In motion`
- dataset label
- close button
- concise one-line orientation only

### Main stage

Dominant area of the modal.

Should contain:
- right-edge ranked pills
- leftward trails
- current time marker / range readout
- subtle rank guides if needed

### Lower control rail

Should contain:
- play/pause
- scrubber
- pin-force selector
- optional family filter

### Supporting readout

Sparse only.

Useful candidates:
- current period title
- current date range
- pinned force name and current rank

No large explanatory cards.

## Interaction details

### On open

The modal should open focused on:
- the currently selected dataset
- the currently selected period if practical
- the currently selected pressure as the initial pinned force if one exists

If no force is selected, start unpinned.

### On play

The race should:
- begin from the start of the selected dataset’s lens
- animate forward through the whole sequence
- keep the final state visible when playback ends

### On scrub

Scrubbing should:
- move the current time immediately
- re-rank the pills without lag
- preserve the pinned force state

### On pin

Pinning should not remove other forces.
It should only change emphasis.

## Architecture requirements

`Race` must be designed so it can later compare datasets covering the same time span.

Examples:
- Britain vs United States
- Britain vs France
- United States vs France

This comparison is not for v1, but the architecture must not block it.

### Required future-proofing

- the time axis must be abstracted, not hardcoded to one dataset’s period count
- the modal state should allow one or two active datasets later
- rendering code should not assume one fixed set of periods or one fixed span width
- the pinned-force model should work whether one dataset or two are active

### Open later comparison options

Do not decide this yet, but leave room for both:
- one shared-force comparison on a single combined stage
- all forces shown on two synced race stages side by side

That decision should wait until the single-dataset `Race` view is proven.

## What not to decide yet

Do not lock the exact `Tension` chart form from this spec.

That remains a later decision.

Do not lock the eventual multi-dataset race comparison layout either.

## Success condition

`Race` is successful if:
- the user can follow force ranking changes without reading much
- the pinned force is easy to track across the whole sequence
- the trails make momentum visible
- the modal feels like a real second mode of thinking, not a novelty overlay
- the implementation leaves a clean path to later same-time-range dataset comparison

## Recommended next step

From this spec, the next implementation task should be:
- define the `Race` modal state model
- then build only the first single-dataset mode

Do not begin `Tension` or `Network` implementation until `Race` has been tested in use.

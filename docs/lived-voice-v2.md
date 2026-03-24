# Lived Voice v2

## Purpose

Make the lived layer feel more like real people in daily life and less like structural summary rewritten in first person.

## What changed

Lived voice v2 now:
- supports multiple voices inside one period snapshot
- renders as tabs in the detail panel
- defaults to three positions where the content can support them:
  - `Woman`
  - `Man`
  - `Public`

This is not meant to imply exhaustive social representation.
It is a practical exhibit layer that gives users more than one human angle into the same structural field.

## Content rule

Each voice should:
- feel like a plausible person rather than a narrator
- name everyday stakes
- connect large structure to work, food, family, safety, belonging, or obligation
- stay concise enough to scan quickly

Each voice should avoid:
- costume-drama pastiche
- invented proper names or overly detailed fake biography
- abstract structural language unless translated into lived consequences

## Model rule

Snapshots now support:
- legacy single-voice fields for fallback
- a `voices` array for lived voice v2

The UI should:
- prefer `voices` where present
- fall back to legacy `response` fields where older content still exists

## Current implementation state

Implemented now:
- Britain lived voice v2 pass
- USA lived voice v2 pass
- France lived voice v2 pass
- tabbed persona switching in the detail panel

This is a first strong pass, not the final authored form.

## What remains

The next quality gains are:
- selective refinement where a voice still feels too generic
- stronger differences between the three positions when a period can support them
- future image or audio compatibility

## Future media direction

Lived voice should stay compatible with later exhibit media such as:
- generated portraits
- voice playback
- waveform or transcript-led presentation

That future layer should grow from the current tabbed persona model rather than replace it outright.

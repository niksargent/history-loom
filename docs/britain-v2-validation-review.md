# Britain v2 Validation Review

## Purpose

Record the current validation posture of Britain v2 additions so the dataset can be frozen responsibly and future datasets can follow the same review model.

## Validation categories

### Seed content
- original project seed content
- treated as current baseline content

### Model-authored draft additions
- require later research-backed review before they should be treated as fully trusted

Current event ids:
- `e27`
- `e28`
- `e29`
- `e30`
- `e31`
- `e32`
- `e33`
- `e34`
- `e35`

Current echo ids:
- `x13`
- `x14`
- `x15`
- `x16`
- `x17`
- `x18`
- `x19`

### Source-backed draft additions
- added under the research-gated path
- stronger than model-only drafts, but still not treated as fully finalized

Current event ids:
- `e36`
- `e37`
- `e38`
- `e39`
- `e40`

## Review judgment

The validation boundary is now explicit enough for Britain to be frozen as a template dataset once the project accepts the following:
- some content remains draft-scoped
- source-backed draft content is still different from fully reviewed canonical content
- future datasets should use the same registry-based distinction from the start

## Remaining validation work

1. Review model-authored events for whether they should be:
   - source-validated later
   - kept as draft-only
   - removed if not worth the review burden
2. Review draft echoes for whether they are:
   - genuinely structurally useful
   - too adjacent or too repetitive
   - strong enough to survive into the frozen template dataset
3. Keep the registry in place as a permanent workflow tool rather than a temporary clean-up device

## Close-out implication

Britain does not need every draft item fully validated before dataset 2 planning begins.

It does need:
- a clear validation boundary
- a documented review model
- discipline about what counts as draft versus trusted content

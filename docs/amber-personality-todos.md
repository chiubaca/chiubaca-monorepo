# Amber Journal: personality todos

## Context: Alex’s aura

Alex’s feedback: the theme is missing the “whimsy creative and curious side of my aura”.

The site should reflect warmth, curiosity, creativity, reflection, and family-centred life. Alex is a software engineer and dad who learns by making things, follows unexpected interests, and keeps unfinished thoughts alongside considered writing. The design should leave room for that playful, exploratory side without turning it into a developer stereotype or a novelty interface.

Amber currently captures the calm, warm, reflective side. Its restraint also makes it feel too much like a finished publication. The missing ingredient is evidence of a person actively noticing, experimenting, and making things.

**Direction: a calm journal with a curious notebook’s edges.** Keep reading quiet; put personality into annotations, discovery, and small interactions. These are proposals to prototype and review, not approved production changes.

## First prototype

- [ ] **Notebook marginalia.** Try a reusable annotation pattern beside a section: a genuinely authored observation such as “currently tinkering” or “still thinking about this”. Start with Newsreader italics, an amber mark, and slightly informal placement rather than adding another font. Stack annotations naturally on mobile. Do not manufacture observations just to decorate the page.
- [ ] **“Something unexpected” discovery link.** Let visitors open an older fleeting note and encounter an interest they might not otherwise find. Keep the destination a real link with a useful no-JavaScript fallback. The interaction should reveal actual writing, not produce a novelty effect.
- [ ] **A playful amber dot.** Prototype a small, one-shot hop or wink on the wordmark dot when its link is hovered or keyboard-focused. Keep the home link’s behaviour unchanged. No looping animation, sound, or essential information conveyed by motion; use a static treatment with reduced motion.
- [ ] **Review the trio together.** Show the real Astro patterns in Storybook and the Amber homepage/notes views. Compare light/dark modes and desktop/mobile layouts; exercise keyboard, touch, and reduced-motion behaviour. Ask whether the result feels like Alex’s working notebook rather than a generic whimsical theme before expanding it.

## Follow-up ideas

- [ ] **“Follow this thread” links.** At the end of a note, offer another entry sharing a meaningful topic. Make curiosity useful through related writing. Exclude the current note and generic collection tags; avoid inventing relationships or implying an authored recommendation where there is none.
- [ ] **“On my workbench” corner.** Explore a compact, manually maintained glimpse of something Alex is making, learning, or puzzling over. It should feel alive without becoming another hero section, a dashboard, or a fake live status.
- [ ] **Ink-like link treatments.** Try slightly imperfect underlines or restrained marks on selected navigation/discovery links. Preserve recognisable links, contrast, and visible focus. Do not animate every prose link or disturb the reading rhythm.

## Design-system work

- [ ] Add a small expressive layer to the existing foundations: annotation typography, ink-mark treatments, and named motion duration/easing tokens. Reuse the semantic colours and spacing instead of introducing scattered one-off values.
- [ ] Turn successful experiments into meaningful shared Astro patterns, keeping document concerns in `JournalLayout.astro` and navigation/footer behaviour in `JournalShell.astro`. Avoid wrappers for every decorative detail.
- [ ] Document when expressive treatments belong and when to leave them out. Marginalia should be occasional; not every section needs a remark, flourish, or motion effect.
- [ ] Add stories for the accepted patterns, including long/absent annotation content, both colour modes, narrow screens, keyboard focus, and reduced motion. Keep the real site and Storybook on the same implementation.

## Guardrails

- Preserve the existing warmth, readable typography, calm prose, and responsive layouts.
- Keep the earlier constraints: no introductory hero headline or illustrations. Retain article titles and accessible page headings.
- Express family life through authentic writing and observations, not stock parenting jokes or manufactured “sleep-deprived developer” copy.
- Keep important content visible without hovering; support touch and keyboard interaction.
- Maintain light/dark/System appearance, contrast, focus visibility, and graceful no-JavaScript behaviour.
- Make discovery lead somewhere worthwhile. Avoid confetti, custom cursors, ambient animation, and hidden essential controls.
- Review a small prototype before a wider rollout. Do not replace the production homepage, commit, or deploy as part of capturing this plan.

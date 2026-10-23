# Homepage design studies — throwaway

**Question:** What does a calm, focused personal blog look like when its character is warm, curious, and grounded in family life?

**Current constraints:** No introductory headline or illustrations. The writing leads; character comes from type, colour, and spacing. Navigation remains available at small widths, side rails and editorial columns collapse, and navigation targets are at least 44px tall.

Run from the workspace root:

```sh
vp run --filter chiubaca.com dev
```

Compare the three versions of the existing homepage:

- `/?variant=amber` — warm paper, Newsreader and DM Sans, one reading column.
- `/?variant=midnight` — soft navy, Cormorant Garamond and DM Sans, a personal side rail.
- `/?variant=daybreak` — chalk and sage, Manrope and Newsreader, an open editorial layout.

The floating switcher and left/right arrow keys cycle through the variants. The URL survives reloads; × returns to the unchanged original homepage. Real published posts and the latest note come from the existing homepage's content queries. Introductory copy is exploratory.

The prototype is dynamically imported only in development. Its styles, fonts, and controls are not part of the production homepage. Fonts are self-hosted; their SIL Open Font Licenses are next to the font files.

**Selected direction: Amber Journal.** Its fonts, tokens, typography, and journal styles now live in `src/design-system/` and are shared with Storybook. The other studies remain available for reference during design-system review. The original production homepage is still unchanged; archive the studies when the selected design is rolled out.

Amber supports Light, Dark, and System through the footer’s Appearance control. Explicit preferences are saved locally; System follows the operating system, including live changes. Review both palettes together in Storybook under Colour / Light And Dark.

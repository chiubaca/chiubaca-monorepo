# A notebook for all the little things

Some days it’s a link. Other days it’s a code snippet, a list, or something I’m still trying to understand. This specimen checks the Markdown those notes need—not just paragraphs and titles.

## Text, emphasis, and links

A plain paragraph should be comfortable to read. There’s room for **a strong opinion**, _an unfinished thought_, _**a bit of both**_, and ~~an idea I’ve changed my mind about~~. Inline `const curiosity = true` belongs comfortably in a sentence.

A [descriptive link](https://developer.mozilla.org/) and a [reference-style link][astro] should be easy to find without competing with the writing. An automatic link works too: <https://astro.build/>.

A deliberate line break keeps these lines together:\
Make something small.\
See what happens.

## Heading level two

This begins a new section of the note.

### Heading level three

A smaller thread within that section.

#### Heading level four

A signpost when the details need their own label.

##### Heading level five

A more specific observation.

###### Heading level six

The deepest heading still needs clear spacing and readable type.

## Lists and things to try

- Keep the interesting link.
- Write down why it caught your attention.
  - A nested thought should stay connected to its parent.
  - Another detail, with **emphasis** and `inline code`.
- Come back when there’s time to experiment.

1. Start with a question.
2. Build the smallest useful example.
   1. Try one change.
   2. Keep a record of what happened.
3. Share what you learned.

These tasks are a record, not interactive form controls:

- [x] Capture the idea.
- [x] Make a tiny prototype.
- [ ] Follow the next thread.

## Quotations

> A notebook is somewhere to put a thought before you know what to do with it.
>
> A second paragraph should have room to breathe.
>
> > Sometimes a quoted thought contains another thought worth keeping.

## Code blocks

A TypeScript example uses the same syntax highlighter as published notes:

```ts
type Discovery = {
  title: string;
  worthKeeping: boolean;
};

function keepTheInterestingBits(notes: Discovery[]) {
  // Small experiments count, too.
  return notes.filter((note) => note.worthKeeping);
}

const notebook = keepTheInterestingBits([
  { title: "A browser inside a terminal", worthKeeping: true },
]);
```

Shell commands should be just as readable:

```sh
vp run storybook
vp run storybook:build
```

Structured data keeps its syntax highlighting:

```json
{
  "title": "A deliberately long entry to check local horizontal scrolling",
  "interests": ["software", "learning", "making things", "family life"],
  "status": "still figuring it out"
}
```

An unlabelled fence is useful for output and quick sketches:

```
idea → small experiment → notes → another question
```

A long line scrolls inside its block rather than widening the page:

```text
GET https://example.com/notebook/a-deliberately-long-reference/with-enough-detail-to-exercise-horizontal-scrolling/without-changing-the-reading-measure/or-pushing-the-rest-of-the-page-sideways HTTP/1.1
```

Indented code is supported as well:

    one more idea
    one more thing to try

## Tables

| Format           | Useful for                    |    Keep it |
| :--------------- | :---------------------------- | ---------: |
| A fleeting note  | A discovery while it’s fresh  |        Yes |
| A code snippet   | Something I want to try again |        Yes |
| A longer article | Connecting the dots later     | Eventually |

A wider comparison should scroll locally on a narrow screen. The alignment in the Markdown should survive the theme:

| Experiment  | Question                            | What I tried                                      | What happened                                  | Next small step                             |
| :---------- | :---------------------------------- | :------------------------------------------------ | :--------------------------------------------- | :------------------------------------------ |
| A notebook  | Can I find an old thought again?    | Group entries by date and keep useful topic links | Small observations become easier to rediscover | Follow a connection I hadn’t noticed before |
| A prototype | Is the idea useful outside my head? | Build one small, working example                  | The awkward parts become obvious               | Change one thing and try again              |

## Images and captions

![A hiker with a backpack on a rocky mountain path beneath a cloudy sky.](markdown-notebook.jpg)

_A photograph from the existing walking journal, kept as a small local fixture. Images should stay inside the reading measure, including on a phone._

## A pause between thoughts

A horizontal rule separates two moments without adding a new heading.

---

Back to the notebook. A very long URL should wrap without pushing the page sideways: <https://example.com/notebook/a-long-reference-with-enough-detail-to-wrap-on-a-small-screen-without-moving-the-rest-of-the-page>.

Literal characters should remain text: `"<article>"`, an ampersand (&), and an escaped \*asterisk\*.

## Footnotes

Sometimes a small qualification belongs at the bottom rather than in the middle of a sentence.[^notebook] A second reference to the same note should work, too.[^notebook]

[^notebook]: These are deliberately unfinished notes. A footnote needs a working return link as well as readable text.

[astro]: https://docs.astro.build/

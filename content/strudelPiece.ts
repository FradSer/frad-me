// Single source of truth for the homepage Strudel piece.
// The .strudel.js mirror under docs/strudel/ exists so the file can be
// pasted directly into https://strudel.cc — keep the two in sync.
//
// The runtime version is pinned via the `@strudel/web` entry in package.json.

export const STRUDEL_COMPOSER = 'Claude Opus 4.7';
export const STRUDEL_PERFORMER_URL = 'https://strudel.cc';

export const STRUDEL_PIECE = `// "frad.me" — a piece for the personal site
// motif: F-A-D, the notes hidden in "frad" (= D minor triad)
// three layers ≈ three views: home pulse · work bass · webxr drift

setcps(0.65)

let chords = chord("<Dm9 Fmaj9 Gm11 Am9>/4").dict('ireal')

stack(
  // ── home view: cursor pulse, dot-ring breathing ──
  stack(
    s("bd").struct("<x ~ [~ x] x  x ~ [x ~] ~>"),
    s("~ sd ~ [sd ~ sd]").gain(0.65).room(0.2),
    n("[0 <1 3>]*<2!3 4>").s("hh").gain(sine.range(0.2, 0.5).slow(4)),
    s("rim*2").mask("<0 0 1 1>/8").gain(0.5)
      .delay(0.35).delaytime(0.375).delayfeedback(0.45),
  ).bank("RolandTR909")
   .mask("<[0 1] 1 1 1>/8".early(0.5)),

  // ── work view: bass spells F → A → D in the low end ──
  note("<f2 a2 d3 a2  f2 [a2 c3] d3 [c3 a2]>")
    .s("sawtooth")
    .lpf(sine.range(280, 900).slow(8)).lpq(7)
    .lpenv(4).lpa(0.02).lpd(0.35).lps(0.25)
    .release(0.4).gain(0.65).shape(0.2),

  // ── webxr view: pad voicings, drifting in the room ──
  chords.offset(-1).voicing()
    .s("triangle").attack(0.8).release(2.5)
    .lpf(sine.range(900, 1800).slow(16))
    .phaser(3).room(0.85).roomsize(6).gain(0.4),

  // ── lead: F-A-D motif sparks, like work-card hovers ──
  n("<[0 2 4]  [2 4 7]  [4 7 9]  [2 7 [4 0]]>*2")
    .set(chords).anchor("D5").voicing()
    .s("triangle").clip(0.55)
    .room(0.55).delay(0.4).delaytime(0.5).delayfeedback(0.4)
    .lpf(sine.range(1200, 2400).slow(8)).lpq(4)
    .gain(perlin.range(0.3, 0.55))
    .sometimes(add(note(12)))
    .chunk(4, fast(2))
    .mask("<0 0 1 1 1 1 1 0>/8"),
)
.late("[0 0.008]*4").size(4)
`;

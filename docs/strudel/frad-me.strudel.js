// "Between the dots" — for frad.me, by GPT-6.1 Sol
// 88 BPM, D minor. An eight-bar conversation around F-A-D.
// Dm9 · Dm7 · Bbmaj7 · Bbmaj9 · Fmaj9 · Fmaj9 · Gm9 · A7sus4
// Synths only: no sample packs or REPL-only helpers.

setcps(88 / 240);

stack(
  // Soft chord changes leave space around the melody.
  note(
    '<[d3,f3,a3,e4] [d3,f3,a3,c4] [bb2,d3,f3,a3] [bb2,c3,f3,a3] [c3,e3,g3,a3] [c3,e3,g3,a3] [bb2,d3,f3,a3] [a2,d3,e3,g3]>',
  )
    .s('triangle')
    .attack(0.35)
    .decay(0.6)
    .sustain(0.55)
    .release(0.9)
    .lpf(sine.range(700, 1300).slow(16))
    .gain(0.12)
    .pan(0.42)
    .room(0.28)
    .roomsize(2)
    .orbit(1),

  // Root and fifth answer the pulse; the last bar leans home.
  note(
    '<[d2 ~ ~ a2 ~ d3 ~ a2] [d2 ~ a2 ~ ~ d3 a2 ~] [bb1 ~ ~ f2 ~ bb2 ~ f2] [bb1 ~ f2 ~ ~ bb2 f2 ~] [f2 ~ ~ c3 ~ f3 ~ c3] [f2 ~ c3 ~ ~ a2 c3 ~] [g2 ~ ~ d3 ~ g3 ~ d3] [a1 ~ e2 ~ ~ a2 e2 ~]>',
  )
    .s('sine')
    .attack(0.008)
    .decay(0.2)
    .sustain(0.15)
    .release(0.12)
    .gain(0.34)
    .lpf(650)
    .orbit(2),

  // F-A-D returns, then opens into a small answering phrase.
  note(
    '<[f4 ~ a4 ~ d5 ~ a4 ~] [e5 ~ d5 ~ ~ a4 c5 ~] [f4 ~ a4 ~ d5 ~ c5 ~] [a4 ~ f4 ~ ~ e4 f4 ~] [a4 ~ c5 ~ e5 ~ c5 ~] [g4 ~ a4 ~ ~ c5 a4 ~] [bb4 ~ a4 ~ g4 ~ f4 ~] [e4 ~ g4 ~ a4 ~ ~ e5]>',
  )
    .s('triangle')
    .attack(0.006)
    .decay(0.24)
    .sustain(0)
    .release(0.18)
    .lpf(sine.range(1400, 2600).slow(16))
    .gain(0.25)
    .pan(0.58)
    .delay(0.2)
    .delaytime(0.511)
    .delayfeedback(0.25)
    .room(0.22)
    .roomsize(2)
    .orbit(3),

  // A low sine thump: two beats, with a quiet turnaround.
  s('<[sine ~ ~ ~ sine ~ ~ ~] [sine ~ ~ ~ sine ~ ~ sine]>')
    .freq(48)
    .penv(16)
    .pdec(0.045)
    .attack(0.002)
    .decay(0.14)
    .sustain(0)
    .release(0.05)
    .gain(0.28)
    .orbit(4),

  // Brushed noise ticks alternate their spacing every other bar.
  s('<[~ pink ~ pink ~ pink ~ pink] [~ pink ~ pink ~ pink ~ [pink pink]]>')
    .attack(0.001)
    .decay(0.025)
    .sustain(0)
    .release(0.02)
    .hpf(6500)
    .lpf(10500)
    .gain('0.045 0.025 0.035 0.025')
    .pan(0.62)
    .orbit(4),

  // A tiny wood-like backbeat, kept behind the pitched voices.
  note('~ g5 ~ <g5 [g5 ~ g5]>')
    .s('sine')
    .attack(0.001)
    .decay(0.025)
    .sustain(0)
    .release(0.025)
    .gain(0.07)
    .pan(0.38)
    .orbit(4),
);

---
title: Sample Rates & Harmonics
layout: post  
tag: [Digital Synths]  
date: Nov. 30th, 2021  
categories: [Audio]  
---

Before I continue, I want to disclose that I am not an engineer. I am merely an
enthusiast who enjoys synthesis. This information may not be the most correct or
academically rigorous. Much of what I’m writing about is my own self-educated
understanding of these subjects. If I do make a mistake, please point it out to
me in an email. So, I guess without further ado, *here we go…*

When working with sound on computers, it’s useful to become acquainted with how
digital signals work. A signal is a function which varies over an independent
variable (normally time). Sound can be thought of as a signal created through
variations in air pressure over time. When we hear something, what we’re really
sensing is physical vibration. When an audio waveform is drawn on screen, that
vibration is what is represented.

Electric and electronic devices normally produce sound using speakers. When a
device is wired to a speaker through something like an AUX cable, it is sending
an electrical signal to drive the speaker’s diaphragm. When the audio signal
reaches the speaker, a motor within it converts the signal into mechanical
vibrations based on the voltage level. These vibrations create changes in air
pressure to produce sound.

To produce audio through a speaker, all that’s needed is an electrical signal
strong enough to drive it. As mentioned in a previous post, I’m using a single
board computer with a dedicated sound capelet to generate the audio signals for
this project. It’s important to note how I’m generating these signals because
signals in the digital domain are discrete. What I mean by discrete is best
illustrated by discussing audio sample rates and quality.

{% include image.html url='digital_wave.png' caption='Visual representation of audio in digital form' width='500px' extra='(original image: http://grahammitchell.com/writings/vorbis_intro.html)' %}

If you’ve heard of the term CD quality, you may also be aware that like digital
images, digital audio has resolution. Rather than RGB values within a grid of
pixels, digital audio can be thought of as a sequence of voltage levels over
time. Each value in the sequence is known as a sample. When a digital device
plays back audio, it runs through thousands of samples at a fixed rate to
produce a composite signal for a speaker to convert into sound. This means that
unlike their physical and analog counterparts, signals produced through digital
means cannot be continuous. This is basically what a discrete signal is. Between
each sample, the output voltage remains a static value.

Because of its discrete nature, there is a limited range of frequencies that a
digital signal can reproduce accurately. Sampling theorem states that the
highest frequency a discrete system can represent is equal to the system’s
sampling rate divided by 2. CD quality’s sampling rate is 44.1kHz, therefore the
highest representable frequency at CD quality is 22.05kHz. This maximum
frequency is known as the Nyquist Frequency (or just Nyquist for short). Since
the range of human hearing is between 20Hz-20kHz, CD quality is more than
sufficient for casually playing back audio. For digital synthesis however, there
are benefits to higher rates.

{% assign audiofiles = "piano.mp3, sine.mp3" | split: ", " %}
{% include audio.html source=audiofiles type='mp3' caption='A piano (above) and a sine tone (below) playing middle A (440Hz)' float='right' width='50%' %}

It's important to know about sampling rates because sound synthesis is really
all about harmonic manipulation. To elaborate, I’ve posted two audio examples to
the left (or above on mobile). One is the sound of a piano, the other is the
sound of a sine tone slowly fading out. Both examples are playing middle A. If
you compare the two, it’s easy to distinguish that they sound nothing alike. The
reason for this is because the relationship of frequencies (aka the harmonics)
produced by the sound of a piano key is much more complex than a single sine
tone. The relationship between frequencies produced over time is what defines
what is traditionally known as an instrument’s timbre.

{% assign imgfiles = "pianospek.png, sinespek.png" | split: ", " %}
{% include image.html url=imgfiles caption='The frequency spectrum of a piano (left) and a sine tone (right) playing middle A (440Hz)' width='300px' %}

By graphing out the spectral components, we can confirm both the harmonic
complexity of a piano (on the left), and the simplicity of the sine tone. In
contrast to the piano, the sine tone contains only a single harmonic located at
its fundamental frequency. This is true of all sine tones making sine waves the
harmonically the simplest sound possible. Due to their harmonic simplicity, all
periodic waveforms can be represented as a summation of multiple sine tones with
varying frequencies, phases, and amplitudes. By extension, anything that isn’t a
sine tone is going to have spectra more complex than a single sine wave. Should
any of the harmonic components of a signal exceed Nyquist frequency, the signal
becomes subject to a type of digital aliasing known as ‘foldover’. Any signal
with a frequency above Nyquist will produce a mirrored component equal to
Nyquist minus the difference of the original frequency and Nyquist.

{% include audio.html source='saw_sweep.mp3' type='mp3' caption='Sawtooth sweep from 0Hz to 22.05kHz and back at a sampling rate of 44.1kHz' %}

To demonstrate foldover, above is an audio example of a naively generated
sawtooth wave sweeping from 0Hz to 22.05kHz at a sample rate of 44.1kHz. If you
pay close attention, an FM-like distortion becomes prevalent as the sweep
approaches Nyquist. To visualize foldover I've posted a spectogram of the audio
recording below. Notice the how harmonics seem reflect back forth between 0Hz
and Nyquist as they fall out of range. While this effect can sound interesting
in some situations (I like it on hi-hats), it’s unwanted in most.

{% include image.html url='saw_sweep_spek.png' caption='Spectogram of the above example' width='600px' %}

What I’m trying to get across is that it's important to understand what digital
audio is when working with low-level audio synthesis. Without such knowledge,
it’s easy to end up with consistently poor-quality sounds. Even at increased
sample rates, having harmonic partials which extend infinitely will always
distort at some point. Unfortunately, the Bela system is only capable of running
audio processes at 44.1kHz. While this isn’t entirely ideal, there are
implementable methods to reduce aliasing which I plan to go over in future posts
as needed.

The PureData patch I used to generate the sounds for this post can be found
[here](/GRPH/assets/other/spec_example.zip). The piano recording originated from
[freesounds](https://freesound.org/people/ramas26/sounds/95326/).

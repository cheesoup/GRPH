---
title: Sampling Rates & Harmonics
layout: post  
tag: [Digital Synths]  
date: Nov. 29th, 2021  
categories: [Audio]  
---

Before I continue, I want to disclose that I am not an engineer. I am merely an enthusiast who enjoys synthesis. This information may not be the most correct or academically rigorous. Much of what I’m writing about is my own self-educated understanding of these subjects. If I do make a mistake, please point it out to me in an email. So, I guess without further ado, *here we go…*

When working with sound on computers, it’s useful to become acquainted with how digital signals work. A signal is a function which varies over an independent variable (normally time). Sound can be thought of as a signal created through variations in air pressure over time. When we hear something, what we’re really sensing is physical vibration. When an audio waveform is drawn on screen, that vibration is what is represented.

Electric and electronic devices normally produce sound using speakers. When a device is wired to a speaker through something like an AUX cable, it is sending a control signal to drive a speaker’s diaphragm. When such a signal reaches a speaker, an electromagnetic motor converts the signal into mechanical vibrations based on its voltage level. These vibrations create changes in air pressure to produce sound. This is of course a very abridged version of speakers work, but for our purposes it's all we need to know. If you want to read more about speakers [this page](https://animagraffs.com/loudspeaker/) is pretty informative (warning: it contains a large infographic).

To produce audio through a speaker, all that’s needed is an electrical signal strong enough to drive diaphragm. As mentioned in a previous post, I’m using a single board computer with a dedicated sound capelet to generate the audio signals for this project. It’s important to note how I’m generating these signals because signals in the digital domain are discrete. What I mean by discrete is best illustrated by discussing audio sample rates and quality.

## What's a Discrete Signal?

If you’ve heard of the term [CD quality](https://blog.discmakers.com/2019/06/cds-just-sound-better/), you may also be aware that like digital images, digital audio has resolution. Rather than RGB values within a grid of pixels, digital audio can be thought of as a sequence of voltage levels over time. Each value in the sequence is known as a sample. When a digital device plays back audio, it runs through thousands of samples at a fixed rate to produce a composite signal for a speaker to convert into sound.

{% include image.html url='digital_wave.png' caption='Visual representation of audio in digital form' width='500px' extra='(original image: http://grahammitchell.com/writings/vorbis_intro.html)' %}

Unlike their physical and analog counterparts, signals produced through digital means cannot have continuous fidelity. Rather, digital signals can be thought of as a countable series of states. This is basically what I mean when I use the term discrete. Think of it this way: when working with print, graphic designers often use units of length such as inches or millimeters as measurements of size. When designing for the digital domain however, graphic designers will instead measure by pixel. Conceptually, pixels and units of length are completely different. While there is such a thing as a fraction of an inch, there is no such thing as a fraction of a pixel. This same concept can be applied to sound by viewing audio signals as a function over time. Rather than counting by seconds however, we are instead counting by samples.

Because of its discrete nature, there is a limited range of frequencies that a digital signal can reproduce accurately. [Sampling theorem](https://mathworld.wolfram.com/SamplingTheorem.html) states that the highest frequency a discrete system can represent is equal to the system’s sampling rate divided by 2. CD quality’s sampling rate is 44.1kHz, therefore the highest representable frequency at CD quality is 22.05kHz. This maximum frequency is known as the [Nyquist Frequency](https://mathworld.wolfram.com/NyquistFrequency.html) (or just Nyquist for short). Since the range of human hearing is between 20Hz-20kHz, CD quality is more than sufficient for casually playing back audio. For digital synthesis however, there are benefits to higher rates.

## The Relationship between Timbre and Sample Rate

{% assign audiofiles = "piano.mp3, sine.mp3" | split: ", " %}
{% include audio.html source=audiofiles type='mp3' caption='A piano (above) and a sine tone (below) playing middle A (440Hz)' float='right' width='200px' %}

It's important to know about sampling rates because sound synthesis is really all about harmonic manipulation. To elaborate, I’ve posted two audio examples to the left (or above on mobile). One is the sound of a piano, the other is the sound of a sine tone slowly fading out. Both examples are playing middle A. If you compare the two, it’s easy to distinguish that they sound nothing alike. The reason for this is because the relationship of frequencies (aka the harmonics) produced by the sound of a piano key is much more complex than a single sine tone. The relationship between frequencies produced over time is what defines what is traditionally known as an instrument’s timbre.

{% assign imgfiles = "pianospek.png, sinespek.png" | split: ", " %}
{% include image.html url=imgfiles caption='The frequency spectrum of a piano (left) and a sine tone (right) playing middle A (440Hz)' width='300px' %}

By graphing out the spectral components, we can confirm both the harmonic complexity of a piano (on the left), and the simplicity of the sine tone. In contrast to the piano, the sine tone contains only a single harmonic located at its fundamental frequency. This is true of all sine tones making sine waves the harmonically the simplest sound possible. Due to their harmonic simplicity, all periodic waveforms can be represented as a summation of multiple sine tones with varying frequencies, phases, and amplitudes. By extension, anything that isn’t a sine tone is going to have spectra more complex than a single sine wave. Should any of the harmonic components of a signal exceed Nyquist frequency, the signal becomes subject to a type of digital aliasing known as ‘foldover’. Any signal with a frequency above Nyquist will produce a mirrored component equal to Nyquist minus the difference of the original frequency and Nyquist.

{% include image.html url='saw_sweep_spek.png' caption='Spectogram of a niave sawtooth sweep' width='600px' %}
{% include audio.html source='saw_sweep.mp3' type='mp3' caption='Niave sawtooth sweep from 0Hz to 22.05kHz and back at a sampling rate of 44.1kHz' %}

To demonstrate foldover, to the above is an audio example of a naively generated sawtooth wave sweeping from 0Hz to 22.05kHz at a sample rate of 44.1kHz. If you pay close attention, a swirling distortion becomes prevalent as the sweep approaches Nyquist. To visualize foldover I've posted a spectrogram of the audio recording. Notice how harmonics seem to reflect back and forth between 0Hz and Nyquist as they fall out of range. While this effect can sound interesting in some situations (I like it on hi-hats), it’s unwanted in most. I don't exactly want to go into detail as to why fold over occurs (this post is already almost 1000 words long), so I will instead defer to [this resource](http://www.dspguide.com/ch3/2.htm) for more information.

What I’m trying to get across is that it's important to understand what digital audio is when working with low-level audio synthesis. Without such knowledge, it’s easy to end up with consistently poor-quality sounds. Even at increased sample rates, it's easy to end up with something distorted when you aren't taking harmonic content into account. For my situation, I don't even really have access to higher sample rates. The Bela board is actually locked to a 44.1kHz sample rate. While this isn’t entirely ideal, there are implementable methods to reduce aliasing which I plan to go over in future posts as needed.

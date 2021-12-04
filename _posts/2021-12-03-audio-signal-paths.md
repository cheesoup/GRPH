---
title: Anatomy of Subtractive Synths Pt. I - Audio Signal Paths
layout: post
tag: [Digital Synths]
date: Dec. 3rd, 2021
categories: [Audio]
---

{% include image.html url='micron_signalpath.png' caption='Signal path for the Alesis Micron' width='500px' %}

As mentioned in my previous post, sound can be thought of as a signal. Synthesizers make the most of this fact by producing sound through the manipulation of signals. Despite the countless methods to manipulate signals, most synthesizers on the market follow a similar structure when it comes to the components that make it up. As a culmination of audio processes, most synthesizers can be can be described with the following signal path: **Generator -> Filter -> Output**.

This architecture is the basis of something called subtractive synthesis. It was initially popularized in the 70s by synthesizers like the [MiniMoog](https://www.vintagesynth.com/moog/moog.php), the [OB-Xa](https://www.vintagesynth.com/oberheim/obxa.php), and the [MS-20](https://www.vintagesynth.com/korg/ms20.php). The idea behind subtractive synthesis is to take an already harmonically rich sound source and to sculpt it by attenuating it’s amplitude and frequency components overtime. Even though this architecture is catered towards a specific method of synthesis, this signal path is not limited to it. Because of its flexibility, most synths nowadays follow a similar architecture. The point of deviation is normally within the design of the generator and/or the filter.

Traditionally, synthesizers like the MiniMoog were implemented with analog circuits. In contrast, my project is trying to emulate similar processes in a digital manner. To better understand these processes, I’m dedicating this post to briefly go over the standard audio processing components of a synthesizer mentioned above.

## Generators

{% include image.html url='waveform.gif' caption='Basic Wave Shapes' float='right' width='180px' %}

As the name implies, a generator is a function which generates a signal. Normally synths use oscillators as a primary source of generation. Oscillators are functions that produce periodic (repeating) signals such as sine waves and sawtooth waves, as mentioned in previous posts. The parameters of an oscillator normally control its shape and relative pitch. What these parameters are vary depending on design on the oscillator. Oscillators are not necessarily limited to basic wave shapes. They can really take any complex shape a user desires, though it’s important to keep aliasing in mind when creating custom wave shapes. An example of a non-standard oscillator would be the [time-stretching phase vocoder]({{ '/audio/2021/10/14/fft_grainspec.html' | relative_url }}) I put together in Pd.

Though most use one or more oscillators as a generator, there are synths out there which don’t use any sort of periodic function generator. A common example are synths which use pre-recorded sounds as their audio generation source such as the [Mellotron](https://www.soundonsound.com/reviews/mellotron-mkvi). These kinds of instruments often border on sampler territory in their feature set and capabilities. A less common method of non-periodic audio generation is through use of digital waveguides to emulate physical models. A very basic example of this would be the [Karplus-Strong algorithm](https://ccrma.stanford.edu/~jos/pasp/Karplus_Strong_Algorithm.html). This territory is a bit beyond the scope of this project so I won’t talk about it much. Instead, I offer [this](https://www.youtube.com/watch?v=ppx72p27JNU) video for more information if you’re interested. I may talk about Karplus-Strong later however.

## Filters

Filters are functions which are used to alter the phase and/or frequency components within a signal. While there many different types of filters, the ones most commonly found on synthesizers are low-pass, high-pass, and band-pass. The function of these filters can more or less be deduced by their name.

{% include image.html url='filter_types.jpg' caption='Basic Filter Types' %}

A low-pass attenuates frequencies above a given cutoff frequency, only allowing lower frequencies through. A high-pass does the opposite. These two filters are normally controlled by a cutoff and resonance parameters. Cutoff controls the maximum/minimum frequency to be passed by filter. Resonance controls amplitude gain at the cutoff point.

A band-pass attenuates frequencies the further away they are from a set center band. They can be thought of as the combination of both a highpass and lowpass filter. Band-pass filters are normally controlled using a center and Q parameter. The center controls the center of the passband, while the q controls the passband’s width.

Less commonly found on synthesizers are band-stop (aka notch) filters. Band-stops attenuate frequencies the closer they are to a given frequency band. They can be thought of as the inverse of a band-pass. Other kinds of filters include shelving, peaking, all-pass, and comb filters. The first two are normally found in EQs, while the latter two are normally used as diffusers and resonators for delay type effects. I won’t go in detail about the frequency response of these filters, but do know they exist. I may or may not elaborate on them later if needed.

## Output

Prior to output, a synthesizer typically has a time-varying amplifier for controlling the output level of the instrument. Typically, this amplifier is controlled by a separate signal known as an envelope. I’ll talk about it more in part two of this post, but an envelope is a signal used to define the value of a parameter over time. In the case of the output amplifier, it is used to define a sound's output level over time.

Beyond level controls, some synthesizers offer on-board effects such as distortions, delays, choruses, and reverbs. I’m not sure if I’ll have time or system resources to handle such processes, but if I do manage to implement any of these things, I’ll definitely write a post elaborating on how so-and-so effect works.

## Parameters and Control Signals

One of the most powerful features of many synthesizers is their ability to vary the parameters over time. I mentioned in the previous section how the amplifier on the output of most audio paths is normally automated by a control signal. A lot of synths will actually allow you to apply the exact same type of automation to whatever parameter you want. In my next post, I plan to go over how these automation signals work and the kind of effects you can get by applying them to some of the parameters mentioned above.

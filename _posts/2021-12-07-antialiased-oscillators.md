---
title: Anti-aliased Oscillators
layout: post
tag: [Programming, Oscillators, Bela]
date: Dec. 6th, 2021
categories: [Audio]
---

I mentioned in a previous post how naively generating waveforms digitally can result in unwanted distortion. The distortion is caused by a phenomenon known as fold-over aliasing and is often the reason why older implementations of digital oscillators sound ‘cheap’. To handle fold-over, I’ve incorporated two algorithms within my oscillators which have proven effective when working in PureData. The first is a well-known algorithm known as PolyBLEP. The second is a bit of an obscure one dubbed ‘Frequency Dithering’.

{% include image.html url='sweep_naive.png' caption='Spectrogram of a non-bandlimited sawtooth sweep from 0 to Nyquist' %}

## PolyBLEPs

The PolyBLEP algorithm is part of a family of BLIT/BLEP algorithms. The idea behind BLITs/BLEPs is to smooth out discontinuities using bandlimited functions. The PolyBLEP in particular is named so due to its use of a [polynomial bandlimited step function](https://www.scribd.com/document/85351585/Computation-Ally-Effective-Methods-of-Sound-Synthesis) to achieve this. All this really means is two things: 1) it makes use of one of those math problems from high school that you can solve using the quadratic formula, 2) this math problem is limited in the frequency band it can produce. Below is a spectrogram of a Sawtooth sweep using PolyBLEP Aliasing. While not perfect, PolyBLEPs are extremely effective at reducing fold-over to say the least.

{% include image.html url='sweep_blep.png' caption='Sawtooth Sweep w/ PolyBLEP Anti-aliasing' %}

My implementation is primarily based on a blog post by [Martin Finke](http://www.martin-finke.de/blog/articles/audio-plugins-018-polyblep-oscillator/) which in turn is based on a [KVRforums thread](https://www.kvraudio.com/forum/viewtopic.php?t=375517). As mentioned above, PolyBLEPs make use of a polynomial to smooth out discontinuities within a periodic waveform. To make use of PolyBLEPs, we first need to synthesize a waveform with discontinuities. The simplest way to do this is with a sawtooth wave.

{% highlight c++ %}
// Change in phase for the current.
float delta = frequency / sample_rate;
// Phase of the oscillator at the current sample index
float phase = delta * current_sample_count;
// Sample value
float sample = 2(phase) - 1;
{% endhighlight %}

The discontinuity within a sawtooth wave lies within it's transition from -1 to 1. This normally occurs when waveform's phase counter jumps from 1 back down to 0. To smooth the discontinuity, we create a function too check the current phase position relative the phase reset point. If the phase is between ``0`` and ``delta``, we return ``2 * (phase - phase^2/2 - 0.5)``. If it is between ``delta`` and ``1 - delta``, we instead return ``2 * (phase^2/2 + phase + 0.5)``. If it isn't within range of either, we output 0. The result of the function is then subtracted from the original sawtooth wave. Below is how this function is implemented in the original KVR thread. While [my implementation](https://github.com/cheesoup/CheeseVA/blob/b403b30badaec110a6298c1580ad2d2e85ccac06/BasicWaves.cpp#L167) isn't much different, I think the original is more elegant to read.

{% highlight c++ %}
float polyBLEP(float phase, float delta)
  // 0 <= t < 1
  if (phase < delta)
  {
    phase /= delta;
    return phase+phase - phase*phase - 1.;
  }
  // -1 < t < 0
  else if (phase > 1. - delta)
  {
    phase = (phase - 1.) / delta;
    return phase*phase + phase+phase + 1.;
  }
  // 0 otherwise
  else
  {
    return 0.;
  }
}

sample -= polyBLEP(phase, delta);
{% endhighlight %}

## Frequency Dithering

From what I can tell, frequency dithering was initially implemented by [Scott 'Acriel' Nordlund](https://www.youtube.com/channel/UC84u8v2FyqmXjSxYh1d7PRQ) in PureData. While not an algorithm for reducing aliasing perse, frequency dithering shapes harmonics which have folded over into something a bit more tolerable. Below is a spectrogram of a sawtooth sweep which makes uses of frequency dithering. In contrast to the PolyBLEP spectrogram, it is much noisier. However, there is no perceivable fold-over past a certain threshold.

{% include image.html url='sweep_dither.png' caption='Sawtooth Sweep w/ Frequency Dithering' %}

The idea behind frequency dithering revolves around translating an oscillator's frequency to integer ratios of the sample rate (i.e. ``x / 44100`` where ``x`` is a whole number) prior to the calculation of ``delta``. This has the effect of causing harmonic partials above Nyquist to re-align with the harmonic series (integer ratios of the base frequency) at the cost of tuning inaccuracies. To fix these inaccuracies, we can generate an average frequency by calculating the two closest frequencies to a target frequency given the above restrictions and rapidly modulate between them.

Below is my implementation of the frequency dithering in C++. Prior to calculating frequencies, we check if the target frequency is 0. If it is, we skip the whole process and output 0. Otherwise, the first of the pair of frequencies is generated by dividing the sample rate by the incoming frequency, flooring it, and then dividing the sample rate by the result. The second frequency is found the same way except prior to dividing the sample rate, we add one to the floored ratio. To decide which of the two frequencies to output, we calculated the difference of both frequencies and the target frequency. Using that information, we then performed a weighted coin-flip to choose.

{% highlight c++ %}
static unsigned int seed = 0;
if(*f != 0.0) {
  // Find the two closest integer ratios for samplerate/frequency
  int ratio = (int)(*SR / *f);
  float f_d0 = *SR / (ratio + 1);
  float f_d1 = *SR / ratio;
  // Dither between the two using a weighted random roll
  if ((*f - f_d0) / (f_d1 - f_d0) < fmath::fast_rand(&(seed))) {
    return f_d0;
  } else {
    return f_d1;
  }
} else {
  // If the given frequency is 0, return 0;
  return 0.0;
}
{% endhighlight %}

## Results

The resulting spectrogram when combining the two algorithms can be seen below. I've also added some audio examples to demonstrate these methods in action. Together, the algorithms provide a strong basis for keeping fold-over at bay. What's neat about PolyBLEPs and frequency dithering are how lightweight yet effective they are. When programming for Bela, efficiency is important due to the limited amount of system resources.

{% include image.html url='sweep_ditherblep.png' caption='Sawtooth Sweep w/ Frequency Dithering & PolyBLEP Anti-aliasing' %}

{% assign audiofiles = "sweep_naive.mp3, sweep_dither.mp3, sweep_blep.mp3, sweep_ditherblep.mp3" | split: ", " %}
{% include audio.html source=audiofiles type='mp3' caption='Sawtooth Sweep Examples. (Top to Bottom) 1) Naive, 2) Dithered, 3) PolyBLEP, 4) Dithered + PolyBLEP' %}

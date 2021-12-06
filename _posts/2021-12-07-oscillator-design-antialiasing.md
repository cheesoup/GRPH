---
title: Oscillator Design Part I - Anti-aliasing
layout: post
tag: [Programming, Oscillators, Bela]
date: Dec. 6th, 2021
categories: [Audio]
---

I mentioned in a previous post how naively generating waveforms digitally can result in unwanted distortion. The distortion is caused by a phenomenon known as fold-over aliasing and is often the reason why older implementations of digital oscillators sound ‘cheap’. To handle fold-over, I’ve incorporated two algorithms within my oscillators which have proven effective when working in PureData. The first is a well-known algorithm known as PolyBLEP. The second is a bit of an
obscure one dubbed ‘Frequency Dithering’.

## PolyBLEPs

The PolyBLEP algorithm is part of a family of BLIT/BLEP algorithms. The idea behind BLITs/BLEPs is to smooth out discontinuities using bandlimited functions. The PolyBLEP in particular is named so due to its use of a [polynomial bandlimited step function](https://www.scribd.com/document/85351585/Computation-Ally-Effective-Methods-of-Sound-Synthesis) to achieve this. All this really means is two things: 1) it makes use of one of those math problems from high school that you can solve using the quadratic formula, 2) this math problem is limited in the frequency band it can produce.

My implementation is primarily based on a blog post by [Martin Finke](http://www.martin-finke.de/blog/articles/audio-plugins-018-polyblep-oscillator/) which in turn is based on a [KVRforums thread](https://www.kvraudio.com/forum/viewtopic.php?t=375517). As mentioned above, PolyBLEPs make use of a polynomial to smooth out discontinuities within a periodic waveform. To make use of polyBLEPs, we first need to synthesize a waveform with discontinuities. The simplest way to do this is with a sawtooth wave.

{% highlight c++ %}
delta = frequency / sample_rate;
phase = delta * current_sample_count;
sample = 2(phase) - 1;
{% endhighlight %}

From here, we check if the phase is within range of ``0`` to ``delta`` or ``1 - delta`` to ``delta``. If it is, we splice in the function ``phase*phase + 2*phase + 1``. Otherwise, we don’t do anything. Below is how this function is implemented in the original KVR thread. [My implementation](https://github.com/cheesoup/CheeseVA/blob/b403b30badaec110a6298c1580ad2d2e85ccac06/BasicWaves.cpp#L167) isn't much different.

{% highlight c++ %}
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
{% endhighlight %}

## Frequency Dithering

The original implementation of frequency dithering was put together by [Scott 'Acriel' Nordlund](https://www.youtube.com/channel/UC84u8v2FyqmXjSxYh1d7PRQ) in PureData. Other than on the [Pd forums](https://forum.pdpatchrepo.info/topic/6759/new-anti-aliasing-and-phase-distortion-abstractions), I've never actually seen this algorithm written about. The idea behind it is to fix frequencies to integer ratios to sample rate. This by itself has the effect of causing a frequency components above Nyquist to re-align with the harmonic series (``base_freq * 2, * 4, * 8, * 16, etc``) at the cost of tuning error. To fix tuning, we generate an average frequency by calculating the two closest frequencies allowed given the above restrictions and rapidly modulate between them.

Below is my implementation of the frequency dithering in C++. Prior to calculating frequencies, we check if the target frequency is 0. If it is, we skip the whole process and output 0. Otherwise, the first of the pair of frequencies are found by dividing the sample rate by the incoming frequency and flooring it, and then dividing the sample rate by the result. The second frequency is found the same way except prior to dividing the sample rate, we add one to the floored ratio. To decide which of the two frequencies to output, we calculated the distance of both frequencies from the target and then performed a weighted dice roll to choose.

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

## Conclusion

So yeah, that's about it. I'm a little tired, so I'll probably put up some examples of how a sawtooth sweep of how these oscillators sound another time. For my next post I plan to go over arbitrary wavemorphing again. My original version of that post kinda sucked. Until then, GOOD NIGHT!

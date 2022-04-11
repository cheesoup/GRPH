---
title: Delays & Filters
layout: post
tag: [Bela, Audio Programming, C++]
date: Apr. 4th, 2022
categories: [Audio]
---

The more I learn about sound programming, the more I realize how omnipresent the concept of delay lines are. The idea of a delay is simple; it takes a signal and outputs its value at a later time. Despite it's simplicity, the effects of a single delay line can be rather enormous. Shorter delay times typically create interference within a signal which in turn can potential amplify or attenuate harmonics. This typical how filters work.

{% highlight c++ %}
class OnePole : public Filter {
	public:
	OnePole() {
		_buffer = new float{};
		// _coef = expf_neon(-2.0 * M_PI * cutoff * *ONE_OVER_SAMPLERATE);
	}

	float process(float x, float coef) {
		x = (1.0f - coef) * x + coef * *_buffer;
		*_buffer = x;
		return x;
	}
};
{% endhighlight %}

The code above is an example of an example of a basic single pole low pass filter. If we recall my post about filters, a low-pass filter can be used to attenuate higher end frequencies. When we look at the code to accomplish this, it’s remarkably simple. If we once again recall the linear interpolation formula (i.e. ``y = a * (1 - x) +b * x)``, we can see that all it’s really doing is interpolating between the current input sample and the last output sample. In essence, it’s writing a delayed version of a signal to a buffer which it uses to generate its next output.

{% include image.html url='sin_interference.gif' caption='Interference between sine waves of equal frequency but different phases' %}

I’ve attempted to demonstrate this concept with an animated GIF above. Notice how the peak amplitude of the sum of the two waves moves from -2 and 2 to 0 depending on the difference in phase. We can think of this difference in phase as the total length a signal is being delayed by.

This concept can be extended to create more elaborate filters. When working on my instrument, I was using this algorithm to generate a resonant analog style low-pass filter. From my own research while attempting to implement the same design in PureData, someone mentioned that this sort of filter was essentially a chain of basic low pass filters (like the one of above) in a feedback loop. Though I don’t completely understand how it all works from a DSP perspective, one can clearly see the similarities between this filter and the one above in terms of structure. The code itself is based on an example provided on [MusicDSP](https://www.musicdsp.org/en/latest/Filters/240-karlsen-fast-ladder.html).

{% highlight c++ %}
float KarlsenFilter::process(float in, float cut, float res)
{
	cut = MTOF(cut * 127.0f) * (float)M_PI * *ONE_OVER_SAMPLERATE;
	res = res * res * M_E * 2.0f;

	buffer[4] = ((buffer[1] - buffer[4]) * cut) + buffer[4];
	float fb = (buffer[3] - buffer[4]) * res;
	SIGMOID(&fb);

	in -= fb;
	buffer[0] = ((in - buffer[0]) * cut) + buffer[0];
	buffer[1] = ((buffer[0] - buffer[1]) * cut) + buffer[1];
	buffer[2] = ((buffer[1] - buffer[2]) * cut) + buffer[2];
	buffer[3] = ((buffer[2] - buffer[3]) * cut) + buffer[3];

	return buffer[3];
}
{% endhighlight %}

If I knew more about signal processing I would definitely have more to write here. However, I’m not very good at math and whenever I do research into this sort of thing, I’m consistently buried in it. All I wanted to get across is the universal usefulness of delay lines. In my next post, I plan to go over more well known use cases for delay lines. For those interested, I've posted of the second filter below:

{% include vimeo.html id='698393376' caption="Karlsen Analog Ladder Style Filter" %}

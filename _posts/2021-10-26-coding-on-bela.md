---
title: Coding on bela
layout: post
tag: [Programming, Bela, Oscillators]
date: Oct. 26, 2021
categories: [Audio]
---

~~I finally managed to get sometime to do a bit a programming. It's been alright so far. Most of my times been spent on figuring out how pointers work and just getting used to C++ in general. I managed to program this dithered polyBLEP sawtooth oscillator. It's a bit late so I'll edit this post later with some details on the code, but for now here it is in raw form.~~\\
**[Oct.30th edit: OK LETS WRITE SOME STUFF]**

So before I write about my code, I guess I should probably write about what Bela is and basic Bela programming. [Bela](https://bela.io/about.html) is a cape for the [Beagle Bone Black](https://beagleboard.org/black) single board computer. It specializes in audio processing for the purpose of creating audio effects, instruments, sound installations, or anything inbetween. It uses an [ARM Cortex A8 processor](https://developer.arm.com/ip-products/processors/cortex-a/cortex-a8) as well as a custom Linux kernel for handling audio processes in a seperate thread above above OS priority. It comes with 16 digital and analog IOs for interfacing with sensors, LEDs, switches, physical components, etc.  It was a bit pricey to purchase, but thankfully I had some extra funds saved from COVID relief.

## render.cpp
{% highlight c++ %}
#include <Bela.h>
#include <cmath>

float gFrequency = 440.0;
float gPhase;
float gInverseSampleRate;

bool setup(BelaContext *context, void *userData)
{
	gInverseSampleRate = 1.0 / context->audioSampleRate;
	gPhase = 0.0;

	return true;
}

void render(BelaContext *context, void *userData)
{
	for(unsigned int n = 0; n < context->audioFrames; n++) {
		float out = 0.8 * sinf(gPhase);
		gPhase += 2.0 * M_PI * gFrequency * gInverseSampleRate;
		if(gPhase > 2.0 * M_PI)
			gPhase -= 2.0 * M_PI;

		for(unsigned int channel = 0; channel < context->audioOutChannels; channel++) {
			audioWrite(context, n, channel, out);
		}
	}
}

void cleanup(BelaContext *context, void *userData)
{


}
{% endhighlight %}

Above is the [example code](http://docs.bela.io/sinetone_2render_8cpp-example.html) which comes shipped with Bela. It produces a sine wave signal at 440hz (middle A). Similar to Processing, Bela code features a setup function followed by some looping function for used for rendering purposes. The functions are given two arguments: a pointer to a BelaContext object, and a pointer to a userData object. From what I've read online, these objects are declared in Bela's wrapper code are used to hold data about the current audio runtime such as codec information and sample rates.

## setup()
{% highlight c++ %}
bool setup(BelaContext *context, void *userData)
{
	gInverseSampleRate = 1.0 / context->audioSampleRate;
	gPhase = 0.0;

	return true;
}
{% endhighlight %}

Unlike Processing, Bela's setup function returns a boolean. The render loop won't start unless setup returns true. In the example provided, the setup function initializes a few variables. `gInverseSampleRate` is set to `1 / samplerate` and while `gPhase` is initialized to `0`.

{% include image.html url='sine.png' width='800px' caption='A plot of a sine function with its phase normalized to 2PI' %}

When working with periodic (repeating) functions, phase can be described as the x-value for output y-value of the function. To illustrate, above is a graph of a sine function normalized from 0-1. To generate a sine wave, the only thing needed is to calculate these normalized sine values repeatedly. In the example code, rather than normalize from to 0-1 it instead calculates phase as a value from 0 to 2PI (i.e. the phase length of a ``y = sin(x)``). While some people prefer this, I find it easier to work between 0 and 1.

In the code below, as the x-value increments, the function's output cycles between -1 and 1 like the desmos graph above.

{% highlight c++ %}
void render(BelaContext *context, void *userData)
{
	for(unsigned int n = 0; n < context->audioFrames; n++) {
		float out = 0.8 * sinf(gPhase);
		gPhase += 2.0 * M_PI * gFrequency * gInverseSampleRate;
		if(gPhase > 2.0 * M_PI)
			gPhase -= 2.0 * M_PI;

		for(unsigned int channel = 0; channel < context->audioOutChannels; channel++) {
			audioWrite(context, n, channel, out);
		}
	}
}
{% endhighlight %}

By controlling how much we increment the phase, we're able to control the frequency at which the sine wave oscillates. In the world of sound, the frequency is heavily correlated to pitch and tone. For the example code, the frequency of the sine wave is preset to 440Hz. This correlates to the base frequency [A4 or middle A](https://newt.phys.unsw.edu.au/jw/notes.html).

The amount to increment the phase by is calculated by dividing a frequency by the sample rate (``delta = frequency / sample_rate``). Because division is computationally more expensive, this can be accomplished more efficiently by per-calculating ``1 / sample_rate`` and multiplying instead. I'll go more into detail as to what sample rate is in [another post]({{ site.base_url }}/GRPH/audio/2021/11/29/sample-rates-and-harmonics.html), but for now Bela's sample rate is always 44100.

## cleanup()
{% highlight c++ %}
void cleanup(BelaContext *context, void *userData)
{

}
{% endhighlight %}

The cleanup function runs prior to halting the process. In this example, this section doesn't actually do anything. In C++, one is able to [dynamically allocate memory](https://www.cplusplus.com/doc/tutorial/dynamic/). When doing so, memory needs to be de-allocated to free it up for use again. Failing to do so creates [memory leaks](https://www.computerworld.com/article/2596992/memory-leaks-and-garbage-collection.html). Dynamic memory allocation isn't used in this example however, thus nothing needs to be cleaned up. In scenarios where you do dynamically allocate memory, this is where you handle your pre-halt garbage collection.

## Conclusion

Below is the results from running the example code. Hopefully this post wasn't too wordy. If you're interested in learning more about audio programming in C++, I've been following this [YouTube tutorial](https://www.youtube.com/watch?v=aVLRUyPBBJk). I think it's pretty useful even outside of a Bela context. I'm not quite sure how easy it is to follow for non-programmers and people not into signal processing however.

{% include audio.html source='sine_example.mp3' type='mp3' caption='Sine Wave at 440Hz' %}

---
title: Coding on bela
layout: post
tag: [Programming, Bela, Oscillators]
date: Oct. 26, 2021
categories: [Audio]
---

~~I finally managed to get sometime to do a bit a programming. It's been alright so far. Most of my times been spent on figuring out how pointers work and just getting used to C++ in general. I managed to program this dithered polyBLEP sawtooth oscillator. It's a bit late so I'll edit this post later with some details on the code, but for now here it is in raw form.~~\\
**[Oct.30th edit: OK LETS WRITE SOME STUFF]**

Ok so before I write about my code, I guess I should probably write about what Bela is and basic Bela programming. [Bela](https://www.bela.io) is a cape for the [Beagle Bone Black](https://beagleboard.org/black) single board computer. It specializes in audio processing for the purpose of creating audio effects, instruments, sound installations, whatever. It comes with 16 digital and analog IOs for interfacing with switches and potentiometers and stuff. It's pretty rad.

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

Above is the basic example code shipped with Bela. It produces a sine wave signal at 440hz (middle A). Other than being based in C++ rather than Java, it's surprisingly similar to Processing in terms of having a setup() function followed by some looping rendering function. The functions are given two arguments: a pointer to a BelaContext object, a pointer to a userData object. From what I assume/read online, these objects declared in the Bela.h header file and contain system data such as hardware and driver information.

## setup()
{% highlight c++ %}
bool setup(BelaContext *context, void *userData)
{
	gInverseSampleRate = 1.0 / context->audioSampleRate;
	gPhase = 0.0;

	return true;
}
{% endhighlight %}

Unlike Processing, Bela's setup function returns a boolean. The render loop won't start unless setup() returns true. In the example provided, the setup function initializes a few variables. `gInverseSampleRate` is set to `1 / samplerate` and while `gPhase` is initialized to `0`.

{% include image.html url='/content/sine.png' width='800px' caption='A plot of a sine function with its phase normalized to 2π' %}

When graphing a periodic (repeating) waveform statically like the image above, phase can be described as the current x-value (between 0-1) of the wave. As the x-value increments, the waveform's y-value oscillates between -1 and 1. To apply this idea to audio, we have think of x as something that is constantly accumulating between 0-1. This is pretty much what Bela's example code does.

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

The amount to increment x is calculated by multiplying the given frequency by the inverse sample rate. This is equal to ` dx = freq / samplerate`. By controlling how much we increment the phase, we're able to control the frequency at which the oscillator oscillates at. Something to keep in mind with this example however is that they normalize the phase to 2PI. This is because the normal phase length of a sine wave is 2PI.

## cleanup()
{% highlight c++ %}
void cleanup(BelaContext *context, void *userData)
{

}
{% endhighlight %}

This section doesn't actually do anything. In C++, one is able to dynamically allocate memory. When doing so, memory needs to be deallocated to free it up again. Dynamic memory allocation isn't used in this example however, thus nothing needs to be cleaned up. In scenarios where you do dynamically allocate memory, this is where you would deallocate the remainder of what needs to be deallocated.

## Conclusion

And that's all the example does! Hopefully this post wasn't too wordy. If you're interested in learning more about audio programming in C++, I've been following this [YouTube tutorial](https://www.youtube.com/watch?v=aVLRUyPBBJk). I think it's pretty useful even outside of a Bela context. I'm not quite sure how easy it is to follow for non-programmers and people not into signal processing however.

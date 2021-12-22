---
title: Stuff About Wave Shaping
layout: post
tag: [Bela, Audio Programming, Oscillators, C++]
date: Dec. 17th, 2021
categories: [Audio]
---

{% include vimeo.html id='640603019' caption='Demo of my current oscillator iteration'%}

Above is a demo of the current state of my oscillator. In this post, my goal is to breakdown how my code for this works. It uses a phase distortion algorithm which allows for non-linear interpolation between a sine wave and a secondary waveform which can take any shape so long as it periodic. For this project, the secondary waveform is selected by cross-fading between 'classic' wave shapes. My implementation, also features pulse width control because you know that's always fun.

# Signal Flow
{% highlight c++ %}
float BasicWaves::process(float f)
{
	float delta = ditherFreq(&f);
	delta *= tune;
	delta *= iSR;

	// Calculate sample
	float p = pwPhase(phase);
	float s = shapePhase(&p, &delta);
	distortPhase(&p, &s);

	// Increment Phase
	phase += delta;
	if ((int)phase) phase--;
	return p * lvl;
}
{% endhighlight %}

Each signal processing object coded for this project contains a function called `process`. This function is called every sample an object is active and is used to determine the object's output value. This particular process function can thought of as an outline to the oscillator's algorithm. The steps are:

1. Dither input frequency.
2. Calculate the amount to increment the phase by (aka delta).
3. Apply pulse width shaping to phase.
4. Calculate the sine inverse of the secondary wave.
5. Apply sine morphing.
6. Increment phase.

Among these steps, this post will be focusing on steps 3-5. Step 1 is covered in my post about [anti-aliased oscillators]({{ '/audio/2021/12/06/antialiased-oscillators.html' | relative_url }}) while steps 2 and 6 are covered in my initial post about [Bela coding]({{ '/audio/2021/10/26/coding-on-bela.html' | relative_url }}).

# Modifying Duty Cycle (Pulse Width)
{% highlight c++ %}
// Pulse width control based on varying playback speeds
// between the first and second halfs of the wave period
inline float BasicWaves::pwPhase(float p) const
{
	return p < pw ? p * (0.5 / pw) : (p - pw) / (2 - pw * 2) + 0.5;
}
{% endhighlight %}

If we recall from the Coding on Bela example, phase can be thought as a periodic ramp from 0-1. Generating a sine wave is equivalent to feeding the ramp into sin(2πx). Rather than generating phase linearly however, we can modify the duty cycle by splitting the ramp in half and reading the two parts at varying but relative playback rates. The above code defines the split point using variable `pw`. This split point refers to where during the cycle the phase is equal to 0.5. The playback rate of both parts is relative to this center point. This has the effect creating a 'knee' within the ramp as illusrated below.

{% include image.html url='PhaseDistortion-1-full.jpg' caption='Pulse Width Modulation via Phase Distortion' extra='Original image: https://www.perfectcircuit.com/media/wysiwyg/articles/PD_FM/PhaseDistortion-1-full.jpg' %}

# Generating Wave Shapes

These section is dedicated to describing the methods used to synthesize basic waveforms for this projects. A lot of this is based on code originating from [this](http://www.martin-finke.de/blog/articles/audio-plugins-018-polyblep-oscillator/) blog post. While the ideas for generating these waveforms remain unmodified for the most part, the code provided by Martin Finke does not implement an exponential wave, nor any sort pulse width control or wave form blending.

## Generating Sawtooths Waves
{% highlight c++ %}
// Sawtooth is required to generate a square wave
// Synthesize by taking phase and stretching to -1 and 1
waves[SAW] = fmath::fast_fwrap(*p + 0.5) * 2.0 - 1.0;
waves[SAW] -= polyBLEP(0.5 + (0.5 - pw), delta);
{% endhighlight %}

Because a phase ramp can already be thought of as a sawtooth between 0 to 1, all we need to do is amplify and offset the phase such that it ranges from -1 to 1. To bandlimit it, we integrate the resulting sawtooth with a polyBLEP signal. In the above example, I add an additional offset of 0.5 to produce a better phase relationship when transforming from a sawtooth wave to a sine wave.

## Generating Pulse Waves

{% highlight c++ %}
// Square wave is required to generate all other shapes
// Synthesize by integrating a second saw into the first saw
waves[PULSE] = waves[SAW] - (*p * 2.0 - 1.0);
waves[PULSE] += polyBLEP(0, delta);
{% endhighlight %}

To create a bandlimited square wave, we synthesize another sawtooth offset by -0.5 and integrate it into the initial sawtooth wave. The initial sawtooth is already offset by 0.5, thus the overall offset for the current one is 0. For bandlimiting, rather than integrating the polyBLEP, we add it. The polyBLEP can be thought of as part of the sawtooth wave. Because we're integrating the sawtooth into another waveform, the integration of the polyBLEP becomes addition (negative * negative = positive).

## Generating Exponential Waves

{% highlight c++ %}
// Exponential phase value
// amplitude modulated by the square wave
waves[EXPO] = fmath::fast_fwrap(*p * 2.0);
waves[EXPO] *= waves[EXPO];
waves[EXPO] *= waves[PULSE];
{% endhighlight %}

The exponential wave is synthesized by first multiplying the phase by 2 and re-wrapping it between 0 and 1. This has the effect of doubling the frequency of the phase signal. From there, we multiply the signal by itself and then multiply product by the previously synthesized square wave. The first step has the effect of creating a curving exponential function rather than a linear ramp. The second step bandlimits the signal and forces it to alternate between positive and negative values.

## Generating Triangle Waves

{% highlight c++ %}
// Leak integration (Low-pass) of a square wave
// * 32 is arbitrarily for better PWM range
float leak = 32.0 * fmath::fast_fabs(0.5 - pw) * fmath::fast_fabs(0.5 - pw) + 1;
leak *= *delta * M_PI * 2.0;
waves[TRI] = fminf(leak, 0.9) * waves[PULSE];
waves[TRI] += fmaxf(1.0 - leak, 0.1) * last;
last = waves[TRI];
{% endhighlight %}

Bandlimited triangle waves are synthesized by taking a weighted average of a square wave's output between the current sample and the previous output. Because triangle waves are synthesized by basically filtering the squaring wave, they're not very PWM compatible. To rememdy this slightly, the signal is amplified based on the `pw` variable.

## Putting it all together

Below is how all this code is stitched together. Both the triangle and exponential waves are dependant on the pulse wave, while the pulse wave is dependant on the sawtooth wave. These dependencies require constant synthesis of the sawtooth and pulse wave. The latter two can be toggled on and off as necessary. Note that all four signal values are contained in an array of floats called `waves`. This useful for blending between them later.

{% highlight c++ %}
// Phase distortion between arbitrary waveforms
// Stolen from: https://forum.pdpatchrepo.info/topic/6759/new-anti-aliasing-and-phase-distortion-abstractions
inline float BasicWaves::shapePhase(float* p, float* delta) const
{
	static float last;
	float waves[4];

	// Sawtooth is required to generate a square wave
	// Synthesize by taking phase and stretching to -1 and 1
	waves[SAW] = fmath::fast_fwrap(*p + 0.5) * 2.0 - 1.0;
	waves[SAW] -= polyBLEP(0.5 + (0.5 - pw), delta);

	// Square wave is required to generate all other shapes
	// Synthesize by integrating a second niave saw into the first saw
	waves[PULSE] = waves[SAW] - (*p * 2.0 - 1.0);
	waves[PULSE] += polyBLEP(0, delta);

	// Check if triangle or exponential are selected
	// before spending resources to synthesize them
	switch((wave)shape)
	{
		default:
			break;
		case TRI - 1:
		case TRI:
		{
			// Leak integration (Low-pass) of a square wave
			// * 32 is arbitrarily for better PWM range
			float leak = 32.0 * fmath::fast_fabs(0.5 - pw) * fmath::fast_fabs(0.5 - pw) + 1;
			leak *= *delta * M_PI * 2.0;
			waves[TRI] = fminf(leak, 0.9) * waves[PULSE];
			waves[TRI] += fmaxf(1.0 - leak, 0.1) * last;
			last = waves[TRI];
			break;
		}
		case EXPO - 1:
		case EXPO:
		{
			// Exponential phase value
			// amplitude modulated by the square wave
			waves[EXPO] = fmath::fast_fwrap(*p * 2.0) * fmath::fast_fwrap(*p * 2.0);
			waves[EXPO] *= waves[PULSE];
			break;
		}
	}

	// Linear interpolation between adjacent waves, y = (1-x)a + xb
	float interpolate = fmath::fast_fwrap(shape);
	return waves[(int)shape] * (1.0 - interpolate) + waves[(int)shape + 1] * interpolate;
}
{% endhighlight %}

To blend between the four wave shapes, we linearly interpolate (aka crossfade) between adjacent signals within the array. To do this, we use a user controlled variable between 0 and 4 called `shape`. This variable is used to determine what shapes and how much of each  blend. The decimal value of the number is used to determine the crossfade amount, while the integer value is used to determine what two shapes are being crossfaded. For example, a value of 1.25 would be calculated as:

`f(1.25) = waves[floor(1.25)]*(1.25 - (1.25 > 1)) + waves[floor(1.25 + 1)]*(1 - (1.25 - (1.25 > 1)))`\
`f(1.25) = waves[1]*(1.25 - 1) + waves[2]*(1 - (1.25 - 1))`\
`f(1.25) = waves[1]*(0.25) + waves[2]*(1 - (0.25))`\
`f(1.25) = waves[PULSE]*(0.25) + waves[EXPO]*(0.75)`

The order of waveforms are as follows:

1. Triangle
2. Pulse
3. Exponential
4. Sawtooth

# Arcsine Wave Shaping

Phase distortion refers to the idea of tranforming the phase of a periodic wave to modify it's resulting wave shape. As the name implies, there are numerous ways to do this, all if which result in different effects. I've already mentioned one method with my implementation of pulse width control. The code below makes use of phase distortion to non-linearly interpolate between an arbitrary wave shapes and a sine wave. This particular method makes use of the trignometric identity `arcsin(sin(x)) = x`. I believe it was first introduced online by Scott 'Acriel' Nordlund in the same [forum post](https://forum.pdpatchrepo.info/topic/6759/new-anti-aliasing-and-phase-distortion-abstractions) they wrote about frequency dithering.

## Triangle Phase

{% highlight c++ %}
// Wrap phase as a triangle wave between -0.5 and 0.5
*p = *p + 0.5;
fmath::fast_fwrap(p);
*p -= 0.5;
fmath::fast_fabs(p);
{% endhighlight %}

We first shape the phase into a triangle wave by adding 0.5, re-wrapping between 0 and 1, subtracting 0.5, and calcuating resulting absolute value. The triangle wave can still be used to calculate a sine wave. Rather than reading through values between 0 and 2PI however, phase in triangle wave form ping pongs between -PI and PI. What's useful about this method is it gives us a way to arbitrarily interpolate the resulting sine wave into any other shape we want.

## Calculating Normalized Arcsine

{% highlight c++ %}
// Convert shapePhase to asin of shapePhase
fmath::fast_asin(s);
*s = -0.159155 * *s - *p;
{% endhighlight %}

My code accomplishes this, by calculating the arcsine of the signal generated in the previously mentioned `shapePhase` function. Note that rather than calculating it using `Math.asin(x)`, I'm actually calculating an [approximation](https://www.desmos.com/calculator/yoq4xjnw01). This trades calculation accuracy in favor of performance. From what I can tell from my own tests however, the inaccuracies have no real affect on the sound. The signal is then normalized to 1 radian (`-0.159155 * *s`). From there we integrate the triangle phase into the arcsine signal.

## Sine Wave Morphing

{% highlight c++ %}
inline void BasicWaves::distortPhase(float* p, float* s) const
{
	// Wrap phase as a triangle wave between -0.5 and 0.5
	*p = *p + 0.5;
	fmath::fast_fwrap(p);
	*p -= 0.5;
	fmath::fast_fabs(p);

	// Convert shapePhase to asin of shapePhase
	fmath::fast_asin(s);

	// Normalize asin(shapePhase) to 1rad/period.
	// Integrate into wrapped phase and shift values to
	// return the cosine from fmath::fast_sin.
	*p = (*p + ((-0.159155 * *s - *p + 0.25) * dist)) * 2.0 - 0.5;
	fmath::fast_sin(p);
}
{% endhighlight %}

To morph between a sine wave and another wave shape, all we need to do is add the signal produced above to the triangle phase prior to calculating sine. The variable `dist` controls how much of the signal is added to the phase. 0.25 is added once again for better phase alignment between transformations. Like the arcsine function, I'm using a [approximation](https://www.desmos.com/calculator/fhqmn3abo0) for calculating sine. This approximation is actually much more accurate, though its valid range is limited.

# Conclusion

That's all there really is to the oscilltor so far though. The last part of chain has already been covered in my [Coding on Bela]({{ '/audio/2021/10/26/coding-on-bela.html' | relative_url }}) post. All that's left is controlling of the output level which is done through the `lvl` variable. Beyond single oscillators, there are some cool things you can do when you combine two of them. In my upcoming posts, I'll go more into some these dual-oscillator techniques I currently have programmed.

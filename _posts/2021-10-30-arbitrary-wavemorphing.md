---
layout: post
tag: [Bela, Audio Programming, Oscillators, C++]
date: Oct. 30, 2021
vimeoID: 640603019
---

Most of my initial foray into C++ has been spent trying to adapt an oscillator I had implemented in PureData. It's based on a sort of phase distortion algorithm by Scott "Acriel" Nordlund for PureData. It uses the trig identity ``f(x) = arcsin(sin(f(x)))`` to morph between a sine wave and an arbitrary waveform of the same periodic length. Here's a [desmos graph](https://www.desmos.com/calculator/b4ejbqju7m) of the algorithm. I've also included a video of the oscillator viewed through an oscilloscope below.

{% include vimeo.html id=page.vimeoID caption='Demo of arbitrary wavemorphing (I apologize for the 4:3 aspect ratio)'%}

The code below also implements the [polyBLEP](http://www.martin-finke.de/blog/articles/audio-plugins-018-polyblep-oscillator/) anti-aliasing technique. There are actually two anti-aliasing algorithms in use within the demo video, but I don't really want to focus on anti-aliasing just yet. I'll probably talk about it in another post.

## oscillator::shape()
{% highlight c++ %}
// Phase distortion between arbitrary waveforms
// Stolen from here:
// https://forum.pdpatchrepo.info/topic/6759/new-anti-aliasing-and-phase-distortion-abstractions
float oscillator::shape(float p, float px) {
	float x, wrap_phase, shape;
	float waves[4];

	// Generate niave sawtooth w/ polyBLEP
	x = fmodf_neon(p + 0.75, 1.0) * 2.0 - 1.0;
	x -= polyblep(fmodf_neon(p + 0.75, 1.0), px);
	waves[0] = asin_fast(fminf(1, fmaxf(-1, x)));

	// Integrate second sawtooth for pulse wave
	x -= fmodf_neon(p + 0.25, 1.0) * 2.0 - 1.0;
	x += polyblep(fmodf_neon(p + 0.25, 1.0), px);
	waves[1] = asin_fast(fminf(1, fmaxf(-1, x)));

	// Apply a 'leaky integrator' for the triangle wave
	waves[2] = fminf(0.995, px * M_PI * 2) * x + fmaxf(0.005, 1 - px * M_PI * 2) * last_;
	waves[2] = fminf(1, fmaxf(-1, waves[2]));
	last_ = waves[2];
	waves[2] = asin_fast(waves[2]);

	// Idk what this is but the shape looks badass
	x *= fmodf_neon(p * 2, 1) * fmodf_neon(p * 2, 1);
	waves[3] = asin_fast(fminf(1, fmaxf(-1, x)));

	// Wrap phase as a triangle wave between -0.5 and 0.5
	wrap_phase = fabsf_neon(fmodf_neon(phase_ + 0.25, 1.0) - 0.5);
	shape = ( // Fourway linear interpolation (crossfade) of arcsin(waves)
		((waves[2] * (1 - shape_[1])) +
		(waves[0] * shape_[1])) *
		(1 - shape_[2]) +

		((waves[3] * (1 - shape_[3])) +
		(waves[1] * shape_[3])) *
		shape_[2]
	);

	// Normalize asin(shape) to 1rad/period.
	// Integrate into wrapped phase and return the cosine.
	return cosf_neon(
		((wrap_phase + ((-0.159155 * shape - wrap_phase + 0.25) *
		shape_[0]))) * M_PI * 2
	);
}
{% endhighlight %}

Above is my implementation of a wavemorphing function. Note that object variables are named with an underscore. I don't fully get how it all works (like why is shape signal normalized to the value of -1rad/s) but I guess I'll try to explain it.

The function takes in the current phase (float p) and the amount the phase is being incremented by (float px). The latter is required for polyBLEP anti-aliasing. In general, I like to declare all another variables I'm going to use within a function at the start. I find it's just easier to keep track of things that way. Ignoring all the polyBLEP stuff, from line 8-26 I'm basically generating waveforms by shaping the incoming phase using arithmetic and some signal processing hackery. From there, I'm calculating the approximate arcsin of each signal. The important part starts at line 28. Below is an exert of it

## return cosf(wtf is this shit)
{% highlight c++ %}
float oscillator::shape(float p, float px) {

	...

	// Wrap phase as a triangle wave between -0.5 and 0.5
	wrap_phase = fabsf_neon(fmodf_neon(phase_ + 0.25, 1.0) - 0.5);
	shape = ( // Fourway linear interpolation (crossfade) of arcsin(waves)
		((waves[2] * (1 - shape_[1])) +
		(waves[0] * shape_[1])) *
		(1 - shape_[2]) +

		((waves[3] * (1 - shape_[3])) +
		(waves[1] * shape_[3])) *
		shape_[2]
	);

	// Normalize asin(shape) to 1rad/period.
	// Integrate into wrapped phase and return the cosine.
	return cosf_neon(
		((wrap_phase + ((-0.159155 * shape - wrap_phase + 0.25) *
		shape_[0]))) * M_PI * 2
	);
}
{% endhighlight %}

This is the main section of the morph algorithm. It starts by creating a fifth waveform from the phase signal. This new waveform is a non-bandlimited (basic) triangle wave wrapped by -0.5 and 0.5. The function then linearly interpolates between the approximated arcsin values calculated beforehand. Though there are other methods to interpolate between functions, I think sticking to a simple crossfade is probably the cheapest option in this situation. From there, the resulting mixed signal (labeled as `shape`) is attenuated based on a value controlled by the user. The signal is then applied to the basic triangle wave. After integration the cosine of the resulting signal is calculated.

When the shape signal is fully attenuated, the function produces a cosine wave. The more of the shape signal is integrated the more the cosine wave will take the form of the arbitrary waveform we plugged in. In the case of the above implementation, the arbitrary waveform is some linear interpolation (i.e. crossfaded signal) of a triangle, sawtooth, pulse, and exponential wave.

That's basically the jist of what's going on here. Again, I don't fully understand it (I wish I did). It's a bit late, so I'll probably end up writing about anti-aliasing another time. I'll link it in this post when I get around to it.

---
title: Compression!!
layout: post
tag: [Bela, Audio Programming, C++]
date: Apr. 7th, 2022
categories: [Audio]
---

Ever since the 1990s-2000s, producers have been using dynamic range compression to maximize the loudness of their music. I often hear Lewis complain about it, and honestly he is right to be annoyed by it to a degree. However, I don’t think compression in itself is something completely evil. It’s simply a process for normalizing volume levels. When someone is mixing together dozens of stereo signals, it helps to have a way to keep these signals within a volume threshold. In many situations, compression is necessary to avoid consistent clipping or to make small sounds noticeable in an already full audio spectrum.

For my current project, I needed a way to keep volume levels relatively consistent for a variable amount of players. For this reason I decided to implement a simple compression algorithm prior to the master output.

**TODO**: Insert clips of project with & without compression.

A compressor works by applying a gain correction depending on the volume level of the incoming signal. This occurs when the signal exceeds a user defined threshold. Common compressor parameters include:
* **Pre-Gain** and **Post-Gain** (Controls amplitude of the incoming and outgoing signal)
* **Threshold** (The minimum volume level required for the compressor to take effect)
* **Slope** (The level of compression applied when the signal is above threshold)
* **Attack** (How quickly the compressor reacts to increases in level)
* **Release** (How quickly the compressor reacts to decreases in level)

Under the hood, there are three key steps that seem to be common in most designs. Though the order of operation may vary, these steps are: level detection, peak smoothing, and gain computation. Below I plan to go over how each of these steps are implemented in my own compressor design. As per usual, my code is based on examples provided online. This [paper](https://www.eecs.qmul.ac.uk/~josh/documents/2012/GiannoulisMassbergReiss-dynamicrangecompression-JAES2012.pdf) in particular helped recognize patterns in compressor designs to look out for (though most of the content simply went over my head). This [example](https://www.musicdsp.org/en/latest/Effects/169-compressor.html) in particular, while not the most efficient, provided a fairly digestible jumping off point for me. And this [series](https://christianfloisand.wordpress.com/2014/06/09/dynamics-processing-compressorlimiter-part-1/) of [blog](https://christianfloisand.wordpress.com/2014/06/16/dynamics-processing-compressorlimiter-part-2/) [posts](https://christianfloisand.wordpress.com/2014/07/16/dynamics-processing-compressorlimiter-part-3/) sort of helped to glue all the concepts together.

## Level Detection

A typical compressor either calculates an absolute value or an RMS value for a given sample in order to give an accurate numerical representation pertaining to a signal’s loudness. These values can essentially be seen as the volume of a signal, though RMS is more accurate. For my implementation, I actually decided to stick to RMS only. RMS can calculated with following formula: ``sqrt((x[0] * x[0] + x[1] * x[1] + … x[n] * x[n]) / n)``.

To calculate RMS, we need to keep track of the square values of samples within a buffer. These squared values then need to be summed up and divided by the buffer size. The end result is the RMS to be used for calculating current loudness of a signal. The code below is how my program does this:

{% highlight c++ %}
inline float Compressor::calculateRMS(float left, float right) {
	static float squaredsum = 0.0f; // Running sum for calculating RMS
	left *= _parameters[COMP_PREGAIN];
	right *= _parameters[COMP_PREGAIN];

	// Calculate the index of the oldest sample within the RMS window
	int rmsLastSampleIdx = _writeptr - _rmsSize;
	rmsLastSampleIdx += (rmsLastSampleIdx < 0) * _bufferSize;

	// Add new value and remove old value from running total.
	const float newSample = sqravg(left * _parameters[COMP_PREGAIN], right * _parameters[COMP_PREGAIN]);
	const float oldSample = sqravg(_buffer[0][rmsLastSampleIdx], _buffer[1][rmsLastSampleIdx]);
	squaredsum += newSample;
	squaredsum -= oldSample;

	return sqrtf_neon(squaredsum * _oneoverSize);
}
{% endhighlight %}

Rather than iterating through a buffer, we instead implement a delay line to keep track of past samples. We then keep track of the running total by squaring and summing incoming samples and squaring and subtracting samples exiting the calculation window. The RMS value is then calculated using sqrt(sum * oneoverwindowsize). Note that one over x * (1 / n) is equivalent to x / n. Generally, it’s more efficient to pre-calculate the reciprocal of something rather than constantly divide by it.

## Peak Smoothing

{% highlight c++ %}
inline float Compressor::applyEnvelope(float x) {
	static float env = 0.0f;
	const float *theta = &_parameters[x > env];
	return (1.0 - *theta) * x + *theta * env;
}
{% endhighlight %}

If you read my older posts, this function should look familiar. Once again, we’re using the linear interpolation formula to create a low pass filter with two coefficients.  In this context, we’re using the filter as a way to smooth the incoming RMS signal. The two coefficients control how quickly a compressor will respond to changes in level. They are typically controlled by a compressor’s attack and release parameter. Which between the two coefficients to be used is determined by whether the incoming signal is rising or falling.

## Gain Computation
Once we determine the current loudness value post envelope, we can finally start performing gain correcting. In order to ensure a linear slope in the decibel domain, gain computations are done in decibels. We can use the following formulas to convert linear values to a decibel scale:

**Linear to DB:** ``20 * log10(amplitude)`` \\
**DB to Linear:** ``pow(10, db/20)``

From here we can calculate the gain value of the outgoing signal by using the formula:
``gain = slope * (threshold – RMS) if RMS >= threshold, else 0``. To apply the correction, all we need to do is multiply the outgoing sample by the gain, and tada we have a compressed signal! To illustrate how this is done within my project I’ve posted the my compressor’s process function below:

{% highlight c++ %}
const Audio & Compressor::process(const Audio &input) {
	const float rms = calculateRMS(input.get(CHANNEL_LEFT), input.get(CHANNEL_RIGHT)); // calculate RMS from total
	const float env = applyEnvelope(rms); // Apply attack/release envelope

	// Compute gain correction and apply
	float gain = _parameters[COMP_SLOPE] * (_parameters[COMP_THRESH] - DSP::LINTODB(env));
	gain = DSP::DBTOLIN(gain) * DSP::DBTOLIN(_parameters[COMP_POSTGAIN]);

	// Apply gain correction + sigmoid
	_current[CHANNEL_LEFT] = _buffer[CHANNEL_LEFT][_writeptr] * gain * _parameters[COMP_POSTGAIN];
	_current[CHANNEL_RIGHT] = _buffer[CHANNEL_RIGHT][_writeptr] * gain * _parameters[COMP_POSTGAIN];

	// Write input to buffer and increment write pointer
	_buffer[CHANNEL_LEFT][_writeptr] = input.get(CHANNEL_LEFT);
	_buffer[CHANNEL_RIGHT][_writeptr] = input.get(CHANNEL_RIGHT);
	_writeptr++;
	_writeptr *= _writeptr < _bufferSize;

	return _current;
}
{% endhighlight %}

Conclusion:
Hopefully you enjoyed my little writeup on building audio compressors out of code. Prior to this, I’ve always had a hard time putting one together. Prior attempts in PureData always ended with something less than satisfactory. I think building this compressor in C++ really helped me to grasp the process a lot better.

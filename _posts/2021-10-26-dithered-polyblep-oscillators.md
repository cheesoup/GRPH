---
layout: post
tag: [Bela]
date: Oct. 26, 2021
---

I finally managed to get sometime to do a bit a programming. It's been alright so far. Most of my times been spent on figuring out how pointers work and just getting used to C++ in general. I managed to programm this dithered polyBLEP sawtooth oscillator. It's a bit late so I'll edit this post later with some details on the code, but for now here it is in raw form.

## render.cpp
{% highlight c++ %}
#include <Bela.h>
#include <cmath>
#include <libraries/Scope/Scope.h>
#include <libraries/Midi/Midi.h>
#include "oscillator.h"

float freq;
float amp;
oscillator saw;

// Variables for MIDI/Scope
Midi gMidi;
const char* gMidiPort0 = "hw:1,0,0";
Scope scope;

void midiEvent(MidiChannelMessage message, void *arg);

bool setup(BelaContext *context, void *userData)
{
	freq = 0.0;
	amp = 0.25;
	saw.setup(context->audioSampleRate);

	// Initialize MIDI/Scope
	gMidi.readFrom(gMidiPort0);
	gMidi.writeTo(gMidiPort0);
	gMidi.enableParser(true);
	gMidi.setParserCallback(midiEvent, (void *)gMidiPort0);
	scope.setup(1, context->audioSampleRate);

	return true;
}

void render(BelaContext *context, void *userData)
{
	for(unsigned int n = 0; n < context->audioFrames; n++) {
		// Set frequency and get oscillator output
		saw.setFreq(freq);
		float out = saw.process();

		// Write to scope
		scope.log(out);

		// Apply volume adjustment
		out *= amp;

		// Write to block
		for(unsigned int channel = 0; channel < context->audioOutChannels; channel++) {
			audioWrite(context, n, channel, out);
		}
	}
}

// MIDI stuff
// Sourced from here: https://www.youtube.com/watch?v=no-iO3mAnr8
void midiEvent(MidiChannelMessage message, void *arg)
{
	int controller = message.getDataByte(0);
	int value = message.getDataByte(1);
	switch(controller) {
		case 8:
			freq = 440.0 * powf(2.0, ((float)value - 69.0) / 12.0);
			rt_printf("freq: %f\n", freq);
			break;
		case 9:
			amp = powf(((float)value / 127.0), 4);
			rt_printf("amp: %f\n", amp);
			break;
	}
	if(controller == 8) freq = powf(((float)value / 127.0), 4) * 15000.0;
}

void cleanup(BelaContext *context, void *userData)
{

}
{% endhighlight %}

## oscillator.h
{% highlight c++ %}
#pragma once

class oscillator {
	public:
		oscillator() {}
		oscillator(float sr);

		void setup(float sr);
		void setFreq(float f);

		float process();
		float dither(float frequency, float samplerate);
		float polyblep(float frequency, float samplerate);

		~oscillator() {}
	private:
		float freq_;
		float sr_;
		float i_sr_;
		float phase_;
};
{% endhighlight %}

## oscillator.cpp
{% highlight c++ %}
#include <cmath>
#include <stdlib.h>
#include "oscillator.h"

oscillator::oscillator(float sr) {
	setup(sr);
}

void oscillator::setup(float sr) {
	freq_ = 0.0;
	sr_ = sr;
	i_sr_ = 1.0 / sr;
	phase_ = 0.0;
}

void oscillator::setFreq(float f) {
	freq_ = f;
}

// Main oscillator function
float oscillator::process() {
	// Dither the frequency to an integer ratio of the samplerate, then calculate the normalized frequency.
	float fdNorm = dither(freq_, sr_) * i_sr_; // phase_increment = freq / sampleRate
	float out = phase_ * 2 - 1 - polyblep(phase_, fdNorm);
	phase_ += fdNorm;
	if(phase_ > 1) phase_ -= 1; // If phase > 1, phase = phase - 1

	// Calculate sample
	return out;
}

// PolyBLEP anti-aliasing algorithm.
// Sourced from here:
// https://www.kvraudio.com/forum/viewtopic.php?t=375517
// Sharper version from here:
// http://lib.tkk.fi/Dipl/2007/urn009585.pdf
float oscillator::polyblep(float x, float dx) {
	if (x < dx) // Lower threshold splice
	{
		x /= dx; // normalize
		// Duller
		return x+x - x*x - 1.; // 2x + x^2 - 1
		// Brighter
		// return (-3.0/14.0)*x*x*x*x - (4.0/7.0)*x*x*x + (6.0/7.0)*x + 0.5;
	}
	else if (x > 1. - dx) // Upper threshold splice
	{
		x = (x - 1.0) / dx; // normalize
		// Duller
		return x*x + x+x + 1.; // 2x + x^2 + 1
		// Brigher
		// return (3.0/14.0)*x*x*x*x - (4.0/7.0)*x*x*x + (6.0/7.0)*x - 0.5;
	}
	else
	{
		return 0.;
	}
}

// Frequency dithering algorithm
// Roughly adapted to C++
// Source from here:
// https://forum.pdpatchrepo.info/topic/6759/new-anti-aliasing-and-phase-distortion-abstractions
float oscillator::dither(float frequency, float samplerate)
{
	if(frequency != 0.0) {
		float f_d0, f_d1;
		int ratio = floorf(samplerate / frequency);
		f_d0 = samplerate / (ratio + 1);
		f_d1 = samplerate / ratio;
		if ((frequency - f_d0) / (f_d1 - f_d0) < (float)rand() / RAND_MAX) {
			return f_d0;
		} else {
			return f_d1;
		}
	} else {
		return 0.0;
	}
}
{% endhighlight %}

On another note, I also need to implement the code tags for posts so they actually highlight things properly.

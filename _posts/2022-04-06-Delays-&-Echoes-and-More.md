---
title: Delays & Echoes and More
layout: post
tag: [Bela, Audio Programming, C++]
date: Apr. 6th, 2022
categories: [Audio]
---

{% include youtube.html id='VK2-tv4GW5E' caption="Playing around with the delay effects w/ the on hiatus synthesizer." %}

In my previous post, I talked about how by applying a delay of a few samples we effectively create a type of interference which allows for harmonic amplification and attenuation. This, however, is not the only use for delay lines. Their most known use is for emulating echos and sound reflections which typically occurs at longer delay lengths. To create longer delays lines, larger buffers need to be implemented to hold queued samples. However, working with larger buffers can come at the cost of performance if not implemented properly. To illustrate in code, I’ve posted my implementation of a static (non-varying in length) delay line below.

{% highlight c++ %}
class Delay {
	protected:
	const uint _size;
	uint _writeptr;
	float * _buffer;

	public:
	Delay(float size): _size((int)(size * *SAMPLERATE)), _writeptr(0) {
		_buffer = new float[_size];
		*_buffer = { 0.0f };
	}

	virtual ~Delay() {
		delete[] _buffer;
	}

	virtual float process(float input, float length = 0.0f) {
		float out = tap(length);
		feed(input);
		advance();
		return out;
	}

	virtual void feed(float input) {
		_buffer[_writeptr] = input;
	}

	virtual void advance() {
		_writeptr++;
		_writeptr *= _writeptr < _size;
	}

	virtual float tap(float length = 0.0f) {
		int readptr = _writeptr - (int)DSP::CLIP(length * *SAMPLERATE, (float)_size - 1.0f, 1.0f);
		readptr += _size * (readptr < 0);
		return _buffer[readptr];
	}

	virtual float getCurrent() { return _buffer[_writeptr]; }
	uint getSize() { return _size; }
	uint getPosition() { return _writeptr; }
};
{% endhighlight %}

A basic delay line is made of two components: the buffer and a write pointer. The purpose of the write pointer is to keep track of which spot within the buffer we are operating from. Every sample, we copy the current value at the index indicated by the write pointer. From there we write the incoming signal to that index and return the old value. Though the above code example is specifically for a static delay, it is possible to create a delay effect with a user controllable length. Typically, this is done by reading an index at the write pointer minus a length value.

{% highlight c++ %}
int readptr = _writeptr - (int)DSP::CLIP(length * *SAMPLERATE, (float)_size - 1.0f, 1.0f);
{% endhighlight %}

This however does not take into account the delays of non-integer length. In order to do a delay of say 4.5 samples, we need to somehow interpolate between the two. Thankfully, MusicDSP provides an extremely useful algorithm for this. From what I understand, we are essentially forming a polynomial which is guaranteed to output four numbers we feed into it at x=0, x=1, x=2 and x=3. By feeding four samples around the point in the buffer we want to read, we can calculate an interpolated value with this polynomial when given a non-integer delay length. Below, I’ve posted my own code for implementing variable delay lengths. Just like my envelope, it’s heavily influenced by the original source.

{% highlight c++ %}
class VariableDelay : public Delay {
	public:
	VariableDelay(float size): Delay(size) {}

	float process(float input, float length = 0.0f) {
		float out = vtap(length);
		feed(input);
		advance();
		return out;
	}

	float vtap(float length = 0.0f) {
		float fltback = (float)_writeptr - DSP::CLIP(length * *SAMPLERATE, (float)_size - 1.0f, 1.0f);
		fltback += _size * (fltback < 0.0f);
		const int intback = (int)fltback;

		union ptr {	int i;	float f; };
		ptr readPtr[4];
		readPtr[0].i = intback - 1;
		readPtr[1].i = intback;
		readPtr[2].i = intback + 1;
		readPtr[3].i = intback + 2;

		readPtr[0].i += _size * (readPtr[0].i < 0);
		readPtr[2].i *= readPtr[2].i < _size;
		readPtr[3].i *= readPtr[3].i < _size;

		readPtr[0].f = _buffer[readPtr[0].i];
		readPtr[1].f = _buffer[readPtr[1].i];
		readPtr[2].f = _buffer[readPtr[2].i];
		readPtr[3].f = _buffer[readPtr[3].i];

		const float x = fltback - intback;
		const float coef[4] {
			readPtr[0].f,
			0.5f * (readPtr[2].f - readPtr[0].f),
			readPtr[0].f - 2.5f * readPtr[1].f + 2.0f * readPtr[2].f - 0.5f * readPtr[3].f,
			0.5f * (readPtr[3].f - readPtr[0].f) + 1.5f * (readPtr[1].f - readPtr[2].f)
		};
		return ((coef[3] * x + coef[2]) * x + coef[1]) * x + coef[0];
	}
};
{% endhighlight %}

What’s interesting about variable delays is the effect modulating lengths has. Many different effects can be created by processing signals through delay lines of changing length. Things like chorus pedals are often built by modulating the length value with some slow oscillator. Reverbs are often built through a complex network of these delays. Even compressors make use of a buffer to calculate the RMS level of a signal. Though I’m not planning on implementing too many delay based effects in this project, I think it’s worth mentioning the above to highlight how universal delay lines are.

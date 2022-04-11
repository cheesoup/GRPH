---
title: Programming Modulators
layout: post
tag: [Bela, Audio Programming, C++]
date: Mar. 27th, 2022
categories: [Audio]
---

In a post I made a while back on the anatomy of the synthesizers, I mentioned one of the key components to audio synthesis is the modulation of various controls and parameters through use of something I call a control signal. I gave two examples of the typical control signals found in a synthesizer: LFOs and envelopes. In this post, my plan is to briefly go over how these typical control signals are implemented within my project. LFOs are rather easy to explain as they are simply slow oscillators. Envelopes, on the other hand, can be a bit tricky to understand. Even I, who is writing this post, haven’t even fully grasped the complexity of creating an ideal ADSR envelope.

## Modulator Interface Class

Normally, I’d like to avoid talking about C++ syntax and technicalities, but I believe it’s worth knowing a little about programming hierarchy and inheritance to kind of get an understanding of how these classes interface with other classes within the software. All classes which generate control signals are prototyped using the parent class Modulator. This class is a barebones class which provides a bit of a base common functionality between all subclasses prototyped from it. Essentially, LFOs and Envelopes can be thought of as an extension of this base. Common functions between all modulator types include a return of its current value, a return of the address of its current value, and a process function.

{% highlight c++ %}
class Modulator {
	protected:
	float _current;
	public:
	Modulator() {}
	virtual const float * getPointer() const { return &_current; }
};
{% endhighlight %}

References to the current value are passed to a Parameter class which manages the calculations for a given parameter value. The Parameter class is something of a nightmare that is thankfully out of the scope of the blog post.

## Programming LFOs

As mentioned in the introduction, programming LFOs is far from difficult. However, issues arise when one is using a low power machine such as Bela (especially when you’re not familiar with assembly language). Thankfully, over the last couple months, I’ve run into a few alternatives for calculating things like sin(x) which can normally be expensive.

{% highlight c++ %}
class LFO : public Modulator {
	Parameter *_freq;
	float _phase = 0.0f;

	public:
	LFO(Parameter *freq): _freq(freq) {}

	float process() {
		_current = DSP::SIN2(_phase);

		float delta = _freq->getCurrent() * 15.0f * *ONE_OVER_SAMPLERATE;
		_phase += delta;
		_phase -= (int)_phase;

		return _current;
	}

	float getCurrent() {
		return _current;
	}
};
{% endhighlight %}

As you can see, the only thing this class is really doing is incrementing a phase counter and outputting sin(phase). Rather than using std::sin however, I’ve opted to use a sin approximation much like the oscillator’s mentioned previously. Though I haven’t tested it thoroughly, it’s actually a faster (though less accurate) alternative to my original sine approximation.

{% include image.html url='sin_approximations.png' caption='sin(x) vs x * (1 - abs(x)) * 4' %}

## Programming Envelopes

Unlike LFOs, envelopes are non-periodic signals. They don’t repeat at a regular interval which can make them a bit tricky to program. Essentially an envelope is a timed signal which gradually changes value over specific time intervals. Every time an envelope is triggered (typically when a note on command is issued), the signal value rises to a maximum level over a user set period of time before falling towards a sustain value. When a note off is received, the envelope falls to zero from its current value and remains there until the next note on. Below is my header file for the implementation. It’s heavily based on an example provided by [Martin Finke](http://www.martin-finke.de/blog/articles/audio-plugins-011-envelopes/).

{% highlight c++ %}
typedef enum ADSR {
	ENV_ATTACK = 0,
	ENV_DECAY,
	ENV_SUSTAIN,
	ENV_RELEASE,
	ENV_OFF,
	ENV_KILL
} ADSR;

class Envelope : public Modulator {
	const float MINLVL = 0.0001f;
	const float MINTIME = 0.001f;

	ADSR _stage;
	uint _timer;
	Parameter *_adsr[ENV_OFF];
	float _mult, _vel;

	// Calculate co-efficient of exponential rate of change.
	inline float calcCoefficient(float start, float end, uint length) const {
		return 1.0f + (logf_neon(end) - logf_neon(start)) / (float)length;
	}

	// Actual sustain = sustain^2
	inline float calcSustain() {
		return fmaxf(MINLVL, _adsr[ENV_SUSTAIN]->getCurrent() * _vel);
	}

	// Calculate sample length of an envelope stage
	inline unsigned int calcTimer(ADSR s, float max) const {
		float v = _adsr[s]->getCurrent();
		return (uint)(fmaxf(MINTIME, v * v * max) * *SAMPLERATE);
	}

	public:
	Envelope(Parameter *attack, Parameter *decay, Parameter *sustain, Parameter *release): 	
		Modulator(), _stage(ENV_OFF), _timer(0), _mult(1.0f), _vel(0.0f) {
		_current = MINLVL;
		_adsr[ENV_ATTACK] = attack;
		_adsr[ENV_DECAY] = decay;
		_adsr[ENV_SUSTAIN] = sustain;
		_adsr[ENV_RELEASE] = release;
	}

	void goStage(ADSR next);

	float process(void);
	void setVelocity(float velocity) { _vel = velocity; }
	ADSR getStage() const { return _stage; }
};
{% endhighlight %}

That’s all I really have to say about how modulators are implemented within my project. Despite working on it for the longest time, there are still issues with the envelope I have yet to resolve. One major issue I found was inconsistency with note handling. Oftentimes, the envelope would completely break should it receive a note on or off message at times it didn’t want it. Furthermore, it would create an annoying click whenever it was reset while active. I did manage to come up with a work around, though it’s not ideal. I’ll talk about whenever I decide to write about voice stealing.

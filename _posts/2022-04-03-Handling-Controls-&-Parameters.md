---
title: Handling Controls & Parameters
layout: post
tag: [Bela, Audio Programming, C++]
date: Apr. 4th, 2022
categories: [Audio]
---

The program structure for this project is by far the most difficult part of the whole project. I think my lack of accounting for it really bit me in the ass. At this point I’ve spent nearly four months working on it and I’m still questioning the skeleton of this project. I think the first time I really realized how difficult all this was going to be was when I began working on a way to manage user parameters. I’m not sure if Lewis remembers, but I remember specifically calling it the gift that kept on giving. Thankfully at this point, I think my method for handling user parameters is actually fairly sound.

When handling user parameters, we need to ensure a continuous signal as discontinuities create artifacts in sound quality. Furthermore, each parameter can be affected in numerous ways. The user can change it manually, or can assign one of many modulators to change the value over time. Because of these consistent requirements, I figured the best way to approach handling parameters was to create a set of objects for user variable values.

{% include image.html url='userparameters_diagram.png' caption='Diagram illustrating the signal flow between the ParameterManager the Parameters within a voice' %}

Above is a diagram which illustrates how user control values are handled (on a simplified scale). All user inputs are handled by an object called ParameterManager. This object contains an array of data structures holding all the current user settings (i.e. things like filter cutoff or envelope attack). In essence, it’s a bridge between user inputted data (through GPIO, OSC, MIDI, etc) and the parameter objects within the voice. It takes an instance of ParameterLoader to initialize. ParameterLoader is essentially a helper object for loading JSON files containing presets. To show how this is all structured in code, I've posted my header file parameter management below.

{% highlight c++ %}
#ifndef _PARAMETER_HEADER_DEFINITION
#define _PARAMETER_HEADER_DEFINITION

#include "global.h"
#include "parse.h"

namespace PARAMETER {
using std::string;

typedef enum {
	PARAM_LEVEL = 0,
	PARAM_PAN = 1,
	PARAM_PW = 2,
	PARAM_SHAPE = 3,
	PARAM_BRIGHT = 4,
	PARAM_ATTACK = 5,
	PARAM_DECAY = 6,
	PARAM_SUSTAIN = 7,
	PARAM_RELEASE = 8,
	PARAM_LFO = 9,
	PARAM_ERROR = 10
} PARAM_ENUM;

const ParseMap<PARAM_ENUM> ParameterMap = {
	{"LEVEL", PARAM_LEVEL},
	{"PAN", PARAM_PAN},
	{"PW", PARAM_PW},
	{"SHAPE", PARAM_SHAPE},
	{"BRIGHT", PARAM_BRIGHT},
	{"ATTACK", PARAM_ATTACK},
	{"DECAY", PARAM_DECAY},
	{"SUSTAIN", PARAM_SUSTAIN},
	{"RELEASE", PARAM_RELEASE},
	{"LFO", PARAM_LFO}
};

// Data structure of a parameter's value
// x[0] = User amt ; x[1] = LFO amt ; x[2] = ENV amt
typedef struct Value {
	float current, user, mod, delta;
	uint count;
	uchar mod_select, mod_total;
} Value;

typedef struct ParameterLoader {
	Value _values[PARAM_ERROR];
	uint _steps;
	float _rsteps;

	ParameterLoader(const string & filename);
} ParameterLoader;

class ParameterManager {
	Value _values[PARAM_ERROR];
	uint _steps;
	float _rsteps;

	public:
	ParameterManager(const ParameterLoader & presets);

	void process();
	bool setParameter(const string &command, float value);
	Value & getParameter(PARAM_ENUM param) { return _values[param]; }
};

class Parameter {
	Value &_value;
	float **_modulator;

	public:
	Parameter(ParameterManager & paramManager, PARAM_ENUM param):
        _value(paramManager.getParameter(param)),
        _modulator(NULL) {}
	Parameter(ParameterManager & paramManager, PARAM_ENUM param, uint total, ...);

	float getCurrent();
};
}
#endif
{% endhighlight %}

The parameter object produces a signal value based on the user inputted data. On initialization, it takes the index of a parameter as well as an address to an instance of a ParameterManager which it uses to retrieve the values tied to it. Parameter objects can also be initialized with addresses to modulator values to handle modulation. Interpolation is handled by a global inertia constant. To smooth out the “dirty” user values, I use a technique known as linear interpolation to transition between values. Linear interpolation can be defined with the formula: ``y = a * (1 - x) + b * x``. Basically, if ``x = 0``, than `y = a`. Likewise, if `x = 1`, `y = b`. Any value of x between 0 and 1 makes y a weighted average of a and b. A re-arranged version of this formula can be observed in the code below.

{% highlight c++ %}
ParameterManager::ParameterManager(const ParameterLoader &presets) {
	memcpy(&_values, &(presets._values), sizeof(presets._values));
	_steps = presets._steps;
	_rsteps = presets._rsteps;
}

void ParameterManager::process() {
	for (int i = 0; i < PARAM_ERROR; i++) {
		if (_values[i].count) {
			_values[i].current = _values[i].user - _values[i].delta * _values[i].count;
			_values[i].count--;
		}
	}
}

bool ParameterManager::setParameter(const std::string &command, float value) {
	PARAM_ENUM param = ParseString<PARAM_ENUM>(command, ParameterMap, PARAM_ERROR);
	if (param == PARAM_ERROR) return false;
	_values[param].delta = (value - _values[param].current) * _rsteps;
	_values[param].user = value;
	_values[param].count = _steps;
	return true;
}

using namespace DSP;
Parameter::Parameter(ParameterManager & paramManager, PARAM_ENUM param, uint total, ...):
_value(paramManager.getParameter(param)) {
	_value.mod_total = total;

    _modulator = new float*[total + 1];
    _modulator[0] = new float{};

    va_list args;
    va_start(args, total);
    if (total) {
	    for (int i = 1; i < total + 1; i++) {
	    	_modulator[i] = va_arg(args, float*);
	    }
    }
    va_end(args);
}

float Parameter::getCurrent() {
	float out = _value.current;
	if (_value.mod_select && _modulator) out += (2.0f * _value.mod - 1.0f) * *(_modulator[_value.mod_select]);
	return out = CLIP(out, 1.0f, 0.0f);
}
{% endhighlight %}

Though getting here was a pain in the ass, I’m glad to have kind of figured this out. When I work with Max and PureData, I often find myself having a hard time trying to come up with ways to manage parameters. I think when I finally get around to working in PD, one of the first things I’m going to want to implement is something like this.

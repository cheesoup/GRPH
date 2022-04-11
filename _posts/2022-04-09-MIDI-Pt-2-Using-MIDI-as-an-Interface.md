---
title: MIDI 2 - MIDI as an Interface
layout: post
tag: [Bela, Audio Programming, C++, MIDI]
date: Apr. 7th, 2022
categories: [Audio]
---

Despite what my previous post on MIDI may have you think, working with MIDI messages on the Bela is actually fairly easy due to Bela’s included library. Almost all the necessary work is done right off the bat for you. All that’s really left is mapping values to whatever you want. Frequency can be calculated from notes using the formula ``frequency = pow(2, midinote / 12) * 440hz``. Calculating manually can be a bit expensive, thus I usually opt to use a lookup table for MIDI to frequency conversions. Parameter values can be mapped by dividing the incoming control value by 127 and multiplying it by the parameter maximum.

Below is a snippet of how basic MIDI was implemented in my original project.

{% highlight c++ %}
inline void gMidiOn(MidiChannelMessage message) {
  unsigned int note = message.getDataByte(0);
  unsigned int vel = message.getDataByte(1);
  voices.on(&note, &vel);
}

inline void gMidiOff(MidiChannelMessage message) {
  unsigned int note = message.getDataByte(0);
  voices.off(&note);
}

void midiMessageCallback(MidiChannelMessage message, void* arg) {
  int controller = message.getDataByte(0);
  int value = message.getDataByte(1);
  switch(controller) {
  case 8:
    freq = 440.0 * powf(2.0, ((float)value - 69.0) / 12.0);
    params[0].setTarget(freq);
    break;
  case 9:
    shape = (float)value / 127.0;
    params[1].setTarget(shape);
    break;
  case 10:
    pw = (float)value / 127.0;
    params[2].setTarget(pw);
    break;
  case 11:
    lvl = ((float)value / 127.0)*((float)value / 127.0)*((float)value / 127.0)*((float)value / 127.0);
    params[3].setTarget(lvl);
    break;
  }
}
{% endhighlight %}

The above code is not without limitations. Of course, any value controlling a parameter has to be interpolated to avoid artifacts from sudden discontinuities. Beyond that, only having 127 values to represent all decimals between 0 and 1 is not ideal. This isn’t a problem in regards to note messages as 127 different notes is plenty. However, when controlling a range between say 0-15000hz, it just doesn’t work.

Thankfully, I was aware of a way to encode higher resolution values into MIDI messages. Semi-modern synths like the Alesis Micron or Korg’s Microkorg make use of a specialized set of CC messages which exists alongside the standard CC implementation. These special control messages are known as Non-Registered Parameter Number (NRPN) values. Unlike MIDI they are non-standardized are usually rather inaccessible without a little bit of programming knowledge.

## Non-Registered Parameter Numbers

If you recall, a single byte of a MIDI message is encoded to provide two distinct values per byte. By setting up data in such a way, we effectively half the resolution of a single byte from 256 possible values to 128. Using this same idea in reverse, we can simply send more MIDI messages to increase the available resolution. With two MIDI messages, we have a resolution of 16384 values (128 * 128).

Typically NRPNs are set up as four separate CC messages, each targeting parameters which control a decoding function. In a lower-level sense, these four messages act similarly to the typical two bytes of a standard MIDI CC message. However, rather than a status message first, NRPN's are typically sent in reverse order to ensure all required data is sent prior to decoding. Though technically it requires more processing and data bandwidth to do this, sending and receiving MIDI is actually a very negligible process, especially for modern CPUs (even the Bela’s).

The first two CC messages are normally sent to control values 99 and 98. These values represent the most and least significant bytes (MSB & LSB) of the incoming parameter value. When multiplied together, they produce a value between 0-16383 which can be mapped to whatever. To encode a value into a linear value into a an MSB & LSB pair, we can use following formula:

``x = (value / maximum) * 16383``  
``MSB = floor(x/128)``  
``LSB = floor(x - MSB * 128)``

The fourth CC message determines what parameter is to receive the new value while the third CC message doesn’t actually have a standard function. Sometimes it’s used for fine-tuning. Other times it’s used with the fourth message to determine something about the target parameter. To somewhat illustrate how this all works, I’ve posted my now unused implementation NRPNs below. I was actually really proud when I figured this all out :U.

{% highlight c++ %}
void gMidiCC(MidiChannelMessage message)
{
  static unsigned int nrpn[3] = { 0 };
  unsigned int controller = message.getDataByte(0);
  unsigned int value = message.getDataByte(1);

  switch(controller) {
    case 6:
      if (PRINT_ON) rt_printf("NRPN Adjustor ");
      nrpn[2] = value;
      break;
    case 38:
      if (PRINT_ON) rt_printf("NRPN Controller ");
      values.setNRPN(value, nrpn);
      break;
    case 98:
      if (PRINT_ON) rt_printf("NRPN Value LSB ");
      nrpn[0] = value;
      break;
    case 99:
      if (PRINT_ON) rt_printf("NRPN Value MSB ");
      nrpn[1] = value;
      break;
  }
  if (PRINT_ON) rt_printf("(CC%d) VALUE %d ", controller, value);
}

void ParameterManager::setNRPN(unsigned int p, unsigned int v[3]) {
  unsigned int sw = p / PARAM_END;
  p = p >= PARAM_END ? p % PARAM_END : p;
  float out = convertNRPN(v);

  switch(sw) {
    case 0: {
      values[p].delta = (out - PARAM_SPACE::getParameter(&values[p])) * rsteps;
      values[p].user = out;
      values[p].count = steps;
      break;
    }
    case 1: {
      values[p].mod = out;
      break;
    }
    case 2: {
      values[p].mod_select = v[0];
    }
  }
}
{% endhighlight %}

Despite the length of this post, much of what I’m talking about right now isn’t even relevant to my current project. I figured it was worth posting about because this was the direction I was originally heading in for handling user inputs. Of course, this is not the case anymore due to my project shifting directions, but I still think it’s worth going over the research I did to figure this out.

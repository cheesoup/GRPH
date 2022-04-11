---
title: MIDI 3 - MIDI as Note Data
layout: post
tag: [Bela, Audio Programming, C++, MIDI]
date: Apr. 9th, 2022
categories: [Audio]
---

Due to changing directions, at this point in my project MIDI is used in a completely different way. As it is, the user interface is primarily digital and based on Open Sound Control and WebSockets, two different communication protocols that I’ll go into more about later. This leaves most of my previous MIDI code pretty useless as interfacing with the user was being accomplished through other means. Despite this however, MIDI has taken a new role in my project.

Rather than using it as a means to interface with, I’m primarily using MIDI as a means of loading note data to generate sequences. In my original post about MIDI, I mentioned how there are these things called MIDI files. Normally these files contain note data, timing, and tempo data pertaining to a musical sequence. Examples of these MIDI files can be found all over the Internet. Sites like [VGMusic.com](https://vgmusic.com/) have stockpiles of MIDIs from old video game soundtracks.

Normally music producers use MIDI files as a means of transferring note sequence data from one digital audio workstation (DAW) to another. My use case is not much different from this. I needed a way to inject note sequence data into my program and using MIDI files seemed like the natural way to do it.

Unfortunately for me, the Bela does not have a built-in library for handling MIDI files. This left me with two options. Either install a library or somehow figure out how to parse MIDI from raw text. Of course, I choose the former option because I don’t think I’m very smart. Ultimately, I ended up going with this library. Installing it was kind of a pain in the ass, but thankfully I managed to find some [tips](https://blog.bela.io/using-an-external-library-with-bela/) for informing the compiler of third-party libraries.

## Editing MIDI data

Before I can even load data in, I first need to have data on hand. Thankfully, as mentioned before, there are plenty of MIDI files out there on the web. It only really took a quick google search to find one of Terry Riley’s “In C.” The original MIDI file I used comes from this [webpage](https://jbum.com/topic.php?topic=music). Of course I couldn’t just use any old MIDI file. To create my MIDI file, I opened up the original in Reaper and cut out each section according to the sheet music. For this specific task I decided to place each sequence on its track. This gives us a way to separate the individual sections for when we parse it later. Below, I’ve posted a video of the individual tracks of my MIDI file. In my next post, my plan is to go over how I managed to load this data into my program and use it to create loop-able sequences.

**TODO**: Insert footage of In C MIDI file.

As a side note, Reaper is a tool I really want to start using more. I like the licensing plan they have laid out and their trial version is basically the full version but with a WinRAR style notification nagging you to pay for the software whenever you open it. Given how powerful of a DAW Reaper is, I think it’s kind of a miracle something like it exists. If only Adobe products were like that…

## Creating Note Sequences

Once I got the library working, it took a bit of time to wrap my head around how MIDI files were structured. MIDI files are typically a collection of tracks each containing a collection of ticks representing a fraction of a beat (normally 1/28th which always seemed random to me). On each tick, note ons or note offs can occur representing when a note is played and released. Once I figured all this out, all I really needed to do was figure out a way to represent that data within the program.

{% include image.html url='sequencer_diagram.png' caption='A diagram of how note sequence is structured within my program' %}

In order to playback a MIDI sequence, we need to figure out the amount of samples which need to occur between each tick. In my project, the object in charge of keeping tempo is called the Clock. How it does this is remarkably simple. The clock contains a timer variable which counts down every sample. This counter reaching zero represents when a tick is to occur.

{% highlight c++ %}
class Clock {
  const SequenceManager &_seqManager;
  uint _sampleCount;
  uint _samplesPerTick;
  bool _play;

  public:
  Clock(const SequenceManager &seq): _seqManager(seq), _play(false) { setTempo(DEFAULT_BPM); }
  void process(void) {
    if (_play) {
      _sampleCount++;
      _sampleCount *= _sampleCount < _samplesPerTick;
    }
  }

  void setTempo(float bpm) {
    bpm *= 4.0f;
    bpm /= 60.0f;			// convert to beats per second
    bpm = *SAMPLERATE / bpm;	// calculate samples per beat
    _samplesPerTick = (uint)(bpm / (float)_seqManager.getTicksPerBeat());
  }

  bool isNewTick(void) const { return _sampleCount == 0; }
  bool play() const { return _play; }
  bool play(bool status) { return _play = status; }
};

const Audio & Player::process(void) {

  ...

  if(_clock.isNewTick() && _clock.play()) {
    if(!_seqr->getIndex()) {
      if (_currentSeq != _queuedSeq) {
        _octaveMin = (int)(DSP::RAND() * -2.0f) - 1;
        _octaveMax = (int)(DSP::RAND() * 2.0f) + 1;
        _currentSeq = _queuedSeq;
        _seqr->setSequence(_seqManager.getSequence(_currentSeq));
      }
      (*_oscOutput)("/new_sequence", _id, 0);
      _octave = _octave >= _octaveMax ? _octaveMin : _octave + 1;
    }
    Tick event = _seqr->getTick();
    if(event) newNote(event);
    _seqr->nextTick();
  }

  ...

}
{% endhighlight %}

A reference to this clock is then passed to each player object as they are created. Within the player object is a Sequencer subobject in charge of handling note playback. Each sample, the Sequencer checks if the Clock’s current timer is zero. If it is, it’ll check the next Tick for a potential event. If an event does exist, it calls note on or note off depending on the message type.

And that’s all there really is to it. Though it may or may not sound simple, it took me a while to come up with this. I didn’t really have any jumping off points when trying to figure out how to playback MIDI files. I kind of just sat here grinded through it until I figured it out. It makes me curious how others have implemented MIDI playback in their programs.

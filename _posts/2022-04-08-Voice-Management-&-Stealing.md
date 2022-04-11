---
title: Voice Management and Stealing
layout: post
tag: [Bela, Audio Programming, C++]
date: Apr. 7th, 2022
categories: [Audio]
---

Voice management has been something of a recurring pain over the course of this project. Prior to taking a different direction with my project, voice stealing was implemented to handle polyphonic key-based playing. Before coding it up, there was nothing more annoying when testing my instrument than running out of notes when holding too many keys down.

{% include image.html url='voicestealing_diagram.png' caption='A diagram illustrating how voice stealing worked in my original synthesizer' %}

I needed a way to keep track of the order of notes played in case one voice needed to change to a new note. The solution that came up involved creating a data structure known as a linked list. Normally when programming, to create a collection of elements we usually implement something called an array. If you recall my example on delay lines, often the buffer is defined as an array of floating point numbers. Normally, this is the ideal way to manage large groups, but it can be limiting at times. Due to their strict structure, it’s normally difficult to resize an array in real-time. On the other hand, linked lists differ from the arrays because rather than being a bunch of elements lined up side by side in memory, they're objects containing a pointer to the memory address of the next instance of the object. This makes them ideal for structures which need to be dynamically resized such a growing and shrinking list of elements.

{% highlight c++ %}
Voice voice[VOICE_TOTAL];
DLList<Voice> active, inactive, stolen;

void VoiceManager::setup(ParameterManager* values) {
  for(int j = 0; j < VOICE_TOTAL; j++) {
    voice[j].setup(values);
    voice[j].linkBefore(inactive);
  }
}

void VoiceManager::on(unsigned int* note, unsigned int* vel) {
  Voice* selected;

  if (inactive.isLinked()) selected = inactive.getFirst();
  else {
    assert(active.islinked());
    selected = active.getLast();
  }

  selected->unlink();
  selected->linkAfter(active);
  selected->setNote(*note);
  selected->trigger(*vel);
}

void VoiceManager::off(unsigned int* note) {
  // Find the voice(s) with the given noteNumber:
  if (active.isLinked()) {
    // Voice* selected;
    DLNode* it = active.getFirst();
    while(it != (DLNode*)&active) {
      DLNode* next = it->getNext();
      Voice* selected = static_cast<Voice*>(it);
      if (selected->note == *note) {
        selected->trigger(0);
        selected->unlink();
        selected->linkAfter(inactive);
        return;
      }
      it = next;
    }
  }
}
{% endhighlight %}



This, however, was not a perfect solution. Firstly, the envelope was never built to take into account new note ons while still active. This resulted in an annoying click due to instantaneous change in level to zero that I had no idea how to deal with at the time. Eventually, I opted to simply not retrigger the envelope for stolen voice, but it did not get rid of the click. I believe the sudden change in frequency had something to do with the issue as well.

**TODO:** Insert audio clips of clicking issue

When I moved away from building a standalone instrument to building an “In C” cover generator, being able to play polyphonically became much less of a necessity. If we actually look through the score of “In C,” the entire song is written with monophonic instruments in mind. I believe this is to ensure it is playable on any instrument. This didn’t mean voice stealing wasn’t an issue though. The note being played still needs to be able to switch on the fly.

{% include image.html url='voicestealing_diagram2.png' caption='A diagram illustrating how voice stealing worked in my original synthesizer' %}

In my current project, voice stealing is implemented through the use of benchwarmer voices. Rather than having a single voice per player, each player actually has two. However, only one voice can be played at a time. When a note is played, a reference to its memory address is given to a pointer labeling the voice as active. If a new note is played and while a voice is active, the active voice ‘killed’ and overtaken by the inactive one. This method of voice stealing avoids the clicking issue, though at the cost of performance. Because all players are monophonic, I thought it would be a fair trade-off to implement voice stealing in such a way.

After writing this all out, I now realize that you can think of these two methods as similar. In both cases we’re using pointers to keep track of voice activity. While I’ve yet to find an ideal solution to voice stealing, I think what I have right now is enough to work.

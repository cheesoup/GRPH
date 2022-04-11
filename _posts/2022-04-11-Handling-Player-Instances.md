---
title: Handling Player Instances
layout: post
tag: [Bela, Audio Programming, C++]
date: Apr. 11th, 2022
categories: [Audio]
---

In a previous post, I’ve talked about how structuring this program has by far been the most difficult part of the whole process. In this post my plan is to go over the main structure of this whole program. Even though it works, at times I feel like the whole thing is kind of spaghetti. Despite spending months working on this now, I still wouldn’t be surprised if there was a better way to accomplish all this which I simply haven’t thought about yet.

{% include image.html url='playerstructure_diagram.png' caption='A diagram illustrating the data flow within the PlayerManager object' %}

The primary class of the program is attempting to process an object called PlayerManager. PlayerManager contains the instances of all active players which are all linked together in a list. As mentioned in my post about managing voices, the benefit of using a linked list over an array of objects is simplicity of adding and removing instances from the list. Because I don’t know how many players are going to be active, working with a list makes it much easier to dynamically add or remove players. To illustrate how this is done in code, I’ve posted my create and destroy user functions below.

{% highlight c++ %}
uint PlayerManager::create(const string &id) {
  PlayerNode *prev = _players;
  PlayerNode *selected = _players->getNext();
  while(selected) {
    prev = selected;
    selected = selected->getNext();
  }
  prev->setNext(
    _factory->generatePlayer(
      id,
      *_seqManager,
      *_presets,
      *_clock,
      _oscOutput
    )
  );
  _total++;

  return _total;
}

uint PlayerManager::destroy(const string &id) {
  Player *selected = _players->getNext();
  if (!selected) return _total;

  PlayerNode *prev = _players;
  while(selected && selected->getID() != id) {
    prev = selected;
    selected = selected->getNext();
  }

  if (selected) {
    prev->setNext(selected->getNext());
    delete selected;
    _total--;
  }

  return _total;
}
{% endhighlight %}

Other than being in charge of… well.. managing players, the PlayerManager class is also in charge of passing control changes to correct player instances. On initialization, each Player is given an ID hash which is used to identify each object with a corresponding user. When a user sends a control change, their ID is included with their message in order to identify who is receiving the data. The code to accomplish this can be seen below:

{% highlight c++ %}
void PlayerManager::control(const string &id, const string &command, float value) {
  Player *selected = _players->getNext();
  while(selected) {
    if(selected->getID() == id) {
      if(!selected->command(command, value) && PRINT_ON) {
        rt_printf("Error: %s sent %s which is not a valid command.\n", id.c_str(), command.c_str());
      };
      return;
    }
    else selected = selected->getNext();
  }
  if (!selected && PRINT_ON) {
    rt_printf("Error: %s is not a valid ID.\n", id.c_str());
  }
}
{% endhighlight %}

Other than managing players, the PlayerManager object is in charge of passing a few references to each Player on initialization. One reference it passes is for a callback function which is run on each new note. This callback function broadcasts an OSC message over a network for anyone connected to catch. OSC stands for Open Sound Control which is a communication protocol used by electronic instruments. It can kind of be thought of as advanced MIDI over LAN. For this project, I’m mainly using it as a way to communicate between my program and web browsers. I’ll talk about this more as I write more posts about web stuff.

The PlayerManager is also in charge of passing references to a Clock and SequenceManager object. In my next post, I plan to go over how exactly note data is parsed into playable sequences so guess for now I’ll leave out the details for now. Essentially, these two are used to control tempo and retrieve note sequences respectively. These exist outside the individual player in order to allow access to the same set data for all players. The SequenceManager is really just a container object holding an array of data structures pertaining to the notes of each sequence. On initialization, it loads the customized MIDI file for In C and parses it into playable sequences. On the other hand, the Clock object is the source of timing for all Player objects. By ensuring all players are synced to the same timing source, we ensure each object remains on beat.

Hopefully this was all informative. For me, even just writing this out, I can think of a few things I would've already change if I had the time.

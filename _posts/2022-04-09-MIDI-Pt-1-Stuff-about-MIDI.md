---
title: MIDI 1 - Stuff About MIDI
layout: post
tag: [Audio Programming, MIDI]
date: Apr. 7th, 2022
categories: [Audio]
---

[MIDI](https://en.wikipedia.org/wiki/MIDI) is a communication protocol that seems like it’s been around forever at this point. At this point, MIDI is over 40 years old and it’s arguably just as relevant today as it was 20-30 years ago. I distinctly remember my first run-ins with technology as a kid. Listening to MIDI rips of random video game music was something of a pastime for me. When I originally started designing fan sites as a kid, my dumbass would always include MIDI music playing in the background just because I thought it was so cool. What MIDI was never really clicked with me as kid and I eventually forgot about it all together. To me MIDI files always sounded like cheap imitations of an original. However, when I started trying to make electronic music, it dawned on me why these MIDI files were relevant to music technology in the first place.

In layman's terms, MIDI is a way for electronic music tools to send messages to each other. Through its use, MIDI capable devices are able to transmit a [number of messages](https://users.cs.cf.ac.uk/dave/Multimedia/node158.html) including note on/off triggers, control changes, and even system updates in some cases.

| Message                         | Binary Value (Bits)               | Hex Value  (Bytes). |
|---------------------------------|-----------------------------------|---------------------|
| Channel 3: Middle A Note On     | ``1001 0001 0100 0101 0100 1111`` | ``93-45-4F``        |
| Channel 3: Middle A Note Off    | ``1000 0001 0100 0101 0000 0000`` | ``83-45-00``        |
| Channel 1: Control 7, Value 64  | ``1011 0001 0000 0111 1000 0000`` | ``B1-07-80``        |

Above is an example of a note on and note off message written in byte (hexadecimal) and binary form. More information about the mathematics behind converting the two can be found [here](https://www.bbc.co.uk/bitesize/guides/zd88jty/revision/5). Basically with a single byte, we can represent a single integer from 0-255. By dividing it a byte in two, we are able to encode two values between 0-127 using a single byte of data. In binary form, this is represented with groupings of 4-bits (binary digits).

MIDI messages are typically made up of a single status byte followed by one or more data bytes. Status bytes make use of the dual value encoding mentioned above. The first 4-bits refer to the type of MIDI message being received. If the incoming message isn’t a program message, the second of the four bits represent the channel to target. Data messages can be interpreted any number of ways depending on the type of message received. In the case above, the second group of bytes represents a note value (where middle A is value 60), while the fourth grouping represents the velocity value (i.e. how hard the user hit the note). Control change messages are similar to this with the first byte referring to a target control and second byte representing the new value.

During my initial foray into creating an instrument, I was using MIDI as a means of communicating notes and parameter changes to the software. When I decided to change direction of my project, my use of MIDI ended up taking a completely different direction as well. At this point, almost all code regarding MIDI from the initial instrument has been rendered pointless. Despite this, the MIDI protocol continues to be a key component of this software. Hopefully, this post provides a decent foundation on what exactly MIDI is. In a few of my upcoming posts, I plan to go over how the use of MIDI has changed over time for this project. To understand that, we at least need to know what MIDI is. Hopefully this post has accomplished the goal for you.

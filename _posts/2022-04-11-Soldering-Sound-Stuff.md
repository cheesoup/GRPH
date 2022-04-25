---
title: Soldering Sound Stuff
layout: post
tag: [Bela, Enclosure]
date: Apr. 11th, 2022
categories: [Misc]
---

{% include image.html url='cable_ground_loop_isolator.png' caption='Molex to TRS + Group Loop Isolator' %}

Hello! This is a guest post by Giuli, Chris’ girlfriend. In addition to editing this blog and programming here and there, I also helped solder some of the physical elements of this project. There were 2 components we had to put together: a male TRS cable and a ground loop isolator. In this post, I’ll go over what they do and how they were put together. To the right is a picture of us soldering in my garage.

## Ground loop isolator

{% include image.html width='300' float='right' url='TRS-Pinout.png' caption='Anatomy of a TRS jack' %}

Ground loop isolators are used to reduce noise in a signal. Pictured below is one of the ones we soldered. There are four components on the PCB: 2 jacks and 2 transformers. Neither of us know exactly how it works, but from what I’ve read, it separates the audio signal ground and the power ground using the transformers.

## Tip-Ring-Sleeve (TRS) Cables

TRS stands for tip, ring and sleeve. Cables with this type of jack are used for audio with left and right channels, but no microphone input. To the right is a diagram of a TRS jack with the parts that we soldered wires on to (lower half). As you can see, the tip connects to the left channel, the ring connects to the right channel, and the sleeve connects to ground. The other end of the wire is a [3 pin Molex connector](https://www.digikey.ca/en/products/detail/molex/2177971032/14638005), so it can plug directly from the ground loop isolator into the Bela.

Originally, we had a mess of wires. It looked like this:

There were a few unnecessary steps here. The female TRS jack on the top left (that we soldered too) connected to the ground loop isolator, which connected to another female TRS jack, which connected to the Bela. With the new male TRS to 3-pin Molex wire, the two wires on the right became one, and Chris decided to go with a different enclosure design that removed the need for the female jack too.

The biggest challenge was soldering the wire that connects to the tip. It took all day to do the one cable because the solder kept sliding off the smooth round surface of this particular jack. It could just be our lack of experience in soldering causing all the issues, but I blame the poor design of the component. After a day of frustration, we finally got it to stick.

Some final physical components that need soldering will connect to a [protoboard](https://www.sparkfun.com/products/12070), which is like a breadboard/PCB hybrid. This will allow the buttons and knob of the project to connect to the Bela in one easy circuit. Chris chose a design that looks like a breadboard so his prototype can be easily transferred from the prototype to the final product. It also is about the same size as the Bela, so it can fit easily into the enclosure.

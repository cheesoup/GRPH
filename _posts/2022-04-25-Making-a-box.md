---
title: We made a box
layout: post
tag: [Bela, Enclosure]
date: Apr. 25th, 2022
categories: [Misc]
---

{% include image.html url="finalenclosure.jpg" caption='The box!' width="400px" %}

My partner and I ended up handcrafting an enclosure for the Bela. It's primarily built out of pine wood and machine screw spacers. I thought I’d post some pictures here to just show off how it came out. There’s a couple issues with it. Firstly the potentiometers are too short to actually fit a knob on top of them which is a little annoying. I’m literally out of money so buying new potentiometers is kind of out of the question for now. Secondly, the LED aren’t holes aren’t straight. Other than that, all the components seemed to work with no issue which after putting it all together was a bit of a relief. Though I had a lot of help from my partner, I think I feel a lot more comfortable working with circuits now. Of course, I only really know the basics, but at least soldering doesn’t seem like something as scary.

{% assign imgfiles0 = "female_jack.jpg, protoboard.jpg" | split: ", " %}
{% include image.html url=imgfiles0 caption='Photograph of initial plans to fit everything together' width='300px' %}

The left of the two photos above was an initial sketch of what I had in mind when fitting it all together in an enclosed case. Initially, the ground loop isolator was going to be mounted to wall. Obviously, this didn't happen because the final enclosure doesn't have any walls. Hilariously, a lot of the cables we ended soldering for this initial plan ended being kind of useless. To the right is photo of what I ended up coming up with once I obtained the protoboard. At this point, we had soldered TRS cable to plug straight into the isolator to avoid the long run of audio cables.

{% assign imgfiles0 = "breadboard.jpg, circuit_side.jpg" | split: ", " %}
{% include image.html url=imgfiles0 caption='Circuit stuff!!' width='300px' %}

The circuit design isn't really anything complicated. It's main purpose interface the front panel components the Bela's GPIO ports. Really, it's not more than a basic circuit routing the potentiometers to analog in ports, and switches as well as LEDs to the digital IO ports. As mentioned in the post written by Giuli, we did most of the soldering together. Surprisingly having two novices is apparently better than one in the world of soldering. At least for us anyways.

{% assign imgfiles0 = "pre_components0.jpg, pre_components1.jpg" | split: ", " %}
{% include image.html url=imgfiles0 caption='Before I drilled all the holes on the top' width='300px' %}

The outer shell was also built with help from my partner. They have this freakishly good talent for cutting things accurately so I got them to drill screw holes into a piece of wood for me. Above is a couple photo is the enclosure prior to installing any of the extra components. I ended up having to drill the holes for most of components myself. When you see it in person, it's pretty easy to tell who did the bad holes =a=

{% include image.html url="bbbbbbbbbb.jpg" caption='Doing things in my partners garage' width='300px' %}

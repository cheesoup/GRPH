---
title: How do computers make sound?
layout: post  
tag: [Programming]  
date: Nov. 29th, 2021  
categories: [Audio]  
---

Prior to writing to more in depth on digital synthesis, I think it’s good idea
to become acquainted with how exactly digital sound works. I don’t really have
much of an introduction to this post, and honestly this whole thing might just
come off as incoherent jargon, but I will try my best to explain everything
understand about the nature of sound in the digital domain from the ground up.
Before we even talk about computers however, we first need to grasp the basics
of how sound is reproduced.

Before I continue, I want to disclaim that I am neither a physicist nor an
engineer. Much of what I’m writing about here is just my own understanding of
the research others have done. I don’t claim to be expert. I’m more so just an
enthusiast. Thus, this information may not be the most academically “correct”.
If you do notice a mistake, please point it out to me in an e-mail. So, I guess
without further ado, *here we go…*

Electric/electronic devices normally produce sound using speakers. When a device
is wired to a speaker through something like an AUX cable, it is sending an
electrical signal to drive the speaker’s diaphragm. When the audio signal
reaches the speaker, a motor within it converts the signal into mechanical
vibrations based on the voltage level. These vibrations create changes in air
pressure to produce sound.

To produce audio through a speaker, all that’s needed is an electrical signal
strong enough to drive it. As mentioned in a previous post, I’m using a single
board computer with a dedicated sound capelet to generate the audio signals for
this project. It’s important note how I’m generating these signals because
signals in the digital domain are discrete.

{% include image.html url='/content/digital_wave.png' caption='Visual representation of audio in digital form' %}
<sup>(original image: http://grahammitchell.com/writings/vorbis_intro.html)</sup>

If you’ve heard of the term CD quality, you may also be aware that like digital
images, digital audio has resolution. Rather than RGB values within a grid of
pixels however, digital audio can be thought of as a sequence of voltage levels
over time. Each value in the sequence is known as a sample. When a digital
device plays back audio signals, it runs through thousands of samples at a fixed
rate to produce a composite signal for a speaker to convert into sound. This
means that unlike their analog counterparts, signals produced through digital
means cannot be continuous. Rather digital signals can only change with each
sample. Between each sample, the voltage remains static.

Because of its discrete nature, digital audio signals are limited in range of
frequencies they can capture and produce. Nyquist theorem states that the
highest frequency a discrete system can record/produce is equivalent to the
system’s sampling rate divided 2 (or SR/2). Any frequency capture above that is
subject to an effect called aliasing.

It's kind of late, so I’ll probably continue to write this tomorrow.

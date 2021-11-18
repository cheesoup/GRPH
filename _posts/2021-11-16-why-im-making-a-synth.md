---
title: Why I'm Even Making a Synth
layout: post
tag: [Music, PureData]
date: Nov. 16, 2021
vimeoID: 646396827
---

When it comes to actually writing music, I actually think I'm pretty awful. I spend so much time obsessing over tiny details and always have a hard time seeing the big picture of what I'm trying to do. Honestly, the reason why I've been so upset with my process of creation is due to this indecisiveness to move on from minute details. On top of that, I'm not the most mechanically gifted person in the world. Much like how I struggle with brushes and inks, I can barely play inversions on the piano.

When it came to design however, I always thought what gave me an edge is my ability to pull magic out of computers. While there was a lot I needed to learn at OCAD to feel even remotely competent with what I was doing, I always felt like I had this talent as a crux. I call it magic because I really think computers are magical. Here is this box. You can put whatever data in it you can think of and with just a little bit of a math you can shape that data into ([almost](https://www.youtube.com/watch?v=macM_MtS_w4)) any virtual form you want. If that's not magic, I don't know what is. I think that's what attracted me to electronic music in the first place. I always wanted to make music. I just never had the patience to figure out how to physically play something.

{% include image.html url='/content/sonic-pi.png' caption='Screenshot of Sonic Pi from Wikipedia' %}

I remember when I first started playing with sound, I was using this program called [Sonic Pi](https://sonic-pi.net/) to make beats while on commutes. In retrospect, Sonic Pi is amazing and I really oughta pick it up again. It's basically a music sequencing environment based around live coding. At the time however, I wasn't really interested in the idea of live performance. While sequncing in Sonic Pi was awesome, it felt a bit limiting to be stuck with same set off instruments. While the option existed to load up custom instruments made in [SuperCollider](https://supercollider.github.io/), at the time I found SuperCollider was a little beyond me. After a couple weeks I moved on to PureData hoping for something simple to learn that gave me better control of timbre.


If anyone is to ever ask me what my favourite programming language is, my answer would probably be [PureData](https://puredata.info/). Never in my life have I tried so hard to learn everything I could about a piece of software. When I first picked it up, I would spend weeks building simple samplers and shitty noise generators. I didn't make any music out of it, but I felt like I was learning so much out of just playing around as awful as those sounds were. What amazed me was how sounds could be generated with such modularity. How everything and anything could be defined as a value and how that value can be generated in anyway you want.

{% include vimeo.html id=page.vimeoID caption='A Pd track I made a couple months ago' %}

Eventually I began dissecting other user patches to better understand how to build things like fancy oscillators and simple audio effects. This led me to start reading up and researching audio processing techniques. One particular resource I always mention that I found really useful is Miller Puckette's [Theory and Techniques of Electronic Music](http://msp.ucsd.edu/techniques/v0.11/book-html/). It features plenty of examples of various audio processing algorithms and is written by the guy who created Pd. I think part of me believed that by understanding these sound processes on a deeper level, I would unlock some sort of understanding of the kind of music I wanted to make. Obviously, this didn't come true and I still have no idea what I'm doing. At multiple points however, I believed it enough to coax myself into attempting to build my own [eurorack](https://en.wikipedia.org/wiki/Eurorack)-style system for algorithmic music. Every time I tried though, my system would end up being overly complexed and too much of a hassle to play. On top of that, I often found Pd's small selection of basic UI options to be quite limiting when trying to make something substantial.

Ultimately, my experience with Pd is kind of what drives me to make this electronic instrument for my workshop project. Though I still I don't really know much of anything about music (I don't even know much about computers tbh), I do know how to make sounds using software. I haven't decided on how I want the this instrument to play or look like just yet, but I'm hoping by shifting my focus a bit to a single tangible thing I can at least come up with something interesting and fun to play.
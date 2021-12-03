---
title: The Web is Obese
layout: post  
tag: [Web Design, Words]  
date: Nov. 20th, 2021  
categories: [Website]  
---

Despite what minimalist trends prevalent throughout the tech industries may have
you believe, today's modern web is very bloated. Just [5 years
ago](https://www.wired.com/2016/04/average-webpage-now-size-original-doom/), the
average web page was already larger than the original DOOM for MS-DOS. In
reaction to this, I choose to design this blog to be as lightweight and easy to
load as possible. I remember times back in High School where my computer could
barely handle 3 or 4 tabs of Chrome or Firefox. It was awful. Since then, modern
web browsers have implemented a plethora of new features and in turn have become
potentially bigger resource hogs. And just as they do, designers While these
features provide a lot of creative of power to web designers, it’s part of the
designer's job to wield these powers appropriately.

{% include image.html url='nocss_frontpage.png' caption='What a
software minimal website does look like' %}

Just to be clear, I’m not claiming page weight and efficiency always need to be
prioritized over other aspects of page design. If we were to prioritize software
minimalism over all other things, most sites on the web would probably look like
[this](https://nocss.club/). If that is the internet you prefer, you're probably
be better off switching to the [gopher protocol](http://gopher.quux.org:70/) or
something. There are also plenty of in browser scenarios that require access to
advance scripting functionalities. Full office suites like Google Docs wouldn't
exist without such things.

I'm suggesting there is a balance that needs to be respected when it comes
designing for content on the modern web. Just because we can do something fancy
and resource expensive, doesn't mean we always should. If we think of page on
the web as small pieces of software, the content would be the main process of
application. The content is the main reason why any given visitor is on any
given web page. It is what the user is attempting to execute when they visit. By
bloating up the interface to this process, a designer runs the risk needlessly
increasing the number of resources required to load and display the content. Not
only does this make content harder to access for certain users (particularly
those on mobile and lower end devices), but it also increases a page’s
environmental footprint.

{% include image.html url='ocadu_frontpage.png' caption='What a
software minimal website does not look like' %}

Let’s look at [OCADU’s home page](https://ocadu.ca/) for example. I noticed it
features a video which automatically loads up every time someone visits it. To
me, this is already a problem. While the use of videos as splash elements have
become more popular on today’s web, it is a I trend that I heavily disagree
with. Landing pages are meant to be quick, flexible, and easy to navigate. They
need to be because they are literally the index of the rest of the website.
Embedded videos are the opposite of these characteristics. They are large, slow,
and often break at different resolutions.

Below is part of the results provided by [Pingdom’s speed
tool](https://tools.pingdom.com/):

{% include image.html url='ocadu_size.png' caption='Size of OCADs front
page, sorted by file type' %}

As we can see above, OCAD's front page is over 20MB. And of course, most of that
weight is the video the school decided to embed. If I were bandwidth limited or
data capped, opening this home page would eat a significant chunk of my
available transfer for the month. Furthermore, if I were to access this page
from an older computer, it would probably take up the entirety of the computer’s
processing power just to display it.

Beyond accessibility however, there is an environmental cost to having a heavy
website. According to [Wholegrain Digital](https://www.websitecarbon.com/),
every GB costs about [1.8kW of electricity an
hour](https://www.websitecarbon.com/how-does-it-work/). If we do the math, that
means OCADU’s front page costs approximately 0.03533kWh for each un-cached
visitor. If we multiply that with the total number of students at OCADU it would
cost 214.52kWh for each student at OCAD to visit the index page once.

Moving away from the video, we can also see that at most the HTML content of the page is about 0.13% of overall transfer. That means of the 20MB required to load the page, at most 0.13% is written content. A majority of the remaining 8%~ are scripts and stylesheets. If we look at the source, we can kind of see why.

{% highlight html %}
<link rel="preload" href="/_nuxt/1c029e12983acd1547a7.js" as="script" />
<link rel="preload" href="/_nuxt/0b76837911f386b4e84d.js" as="script" />
<link rel="preload" href="/_nuxt/8fda144dac918648a67b.css" as="style" />
<link rel="preload" href="/_nuxt/a19306e62382a80f9692.js" as="script" />
<link rel="preload" href="/_nuxt/364a65052d6aaed82138.css" as="style" />
<link rel="preload" href="/_nuxt/cbeb1be2886825385048.js" as="script" />
<link rel="stylesheet" href="/_nuxt/8fda144dac918648a67b.css" />
<link rel="stylesheet" href="/_nuxt/364a65052d6aaed82138.css" />
{% endhighlight %}

Though I don't really have much of a basis to question these pre-loaded these scripts, I do wonder why a simple index page would need so many. It seems like each one of these scripts has a CSS file paired with. This leads me to believe that each of JS file is a definition for an embedded application. If they are applications, I'm not really sure what they do. My hunch is that it's for web analytics. Either way, pre-loading this much stuff is not exactly ideal especially in the case of scripts. Pre-loading a script forces the user's browser to process said scripts before it begins to load page. This obviously complexifies and slows down the initial process. Also, since these are externally linked files, secondary requests must be made before they can be loaded. Essentially, it's forcing you to load some other crap before you can get actual content you're requesting. This can be obviously useful in a lot of scenarios, but again it's something not to be abused.

So yeah, OCAD’s homepage sucks. It's slow and bloated and kind of broken at
times. And it's not just OCAD's homepage that sucks. There are plenty of other
examples of web pages out there which are way heavier than they need to be. It's
like an electronic epidemic. So if you ever design a website, please keep
performance at least somewhat in mind. Think about what is necessary for the
content. Adding too much to a web page will not only bog down/break a user's
access, it's also just straight up worse for the environment.

---
title: New Layout!
layout: post
tag: [Blog Stuff]
date: Nov. 14, 2021
---

Over the last couple days I've been kind of taking a break from programming the Bela in order to focus my attention on this blog. Despite aiming for a lightweight website, I made a few compromises by deciding to use javascript and webfonts for the sake of style. After testing the website on an [old netbook](https://www.cnet.com/products/acer-aspire-one-d250/specs/) however, I noticed that even having a minimal amount of scripting was a bit too much. On top of that, further testing showed that the typefaces imported by Google fonts accounted for the a majority of my sites digital weight.

{% include image.html url='/content/3screens.jpg' caption='The gangs all here' %}

## Issues with the Old Layout

Prior to the re-design, the main thing I was using JS for was to show and hide my menu items. If you're interested in how that works, the source code for the previous version of the site can be found [here](https://github.com/cheesoup/GRPH/tree/bf5ac20a3080064854d65529b38d4fbd6abc8bad) (thank God for git). The unfortunate thing with CSS and JS animations however is that they're pretty CPU intensive. Whenever I would open the menu on the netbook, the fans would whirl and the CPU usage would shoot up to 97%.

Other than the menu, I also implemented some JS for placing arbitrary text into someone's copy and paste clipboard. I was mainly using to create hyperlinks which would give the user the URL to the RSS feed. Though the script does work pretty well, if JS is disabled for whatever reason it is impossible to access the RSS. Also I feel like using JS in this way was sort of lazy.

{% include image.html url='/content/blog_size_0.png' caption='34.1kbs for webfonts' %}

After getting rid of all the javascript, I found this [online tool](https://tools.pingdom.com/) for measuring how much data a webpage requests whenever it is loaded. As the results above show, webfonts had previously accounted for over 50% of the site's bandwidth per visit which for me is obviously not cool. To remedy this, I stuck to [web safe fonts](https://www.cssfontstack.com/).

## On to the New

I'm pretty happy about is how small this website is. I've managed to get the about me page below 20kbs! I think that's pretty impressive. There are actually still a few things I would like to implement (the main thing being a pure CSS lightbox for photos), but I think that's a project for another day.

{% include image.html url='/content/blog_size_1.png' caption='My sites pretty small now' %}

Other than optimization, I had a couple goals in mind when working on the re-design. I have a process book coming up for Workshop and I figured starting here would be a good place for coming up with design ideas for the final printed version. I guess visually, I'm really trying to pull ideas from WEB 1.0. Part of me is nostalgic for the hours I would spend listening to the midi re-interpretations of Koji Kondo's Dire Dire Docks or Alice Deejay's Better Off Alone on Geocities.

<p style="text-align:center"><img src="{{ "/assets/images/splash.gif" | relative_url }}" alt="My buddy!"/></p>

If you haven't noticed, I've come up with a little mascot for this project. You can see them up in the top corner! They don't quite have a name yet, but they're my buddy and we're gonna make synths together. They're based off a friend of mine from Calgary who makes some pretty rad tunes and actually isn't a crow (their last name just sounds like it).

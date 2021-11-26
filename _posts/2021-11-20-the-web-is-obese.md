---
title: The Web is Obese
layout: post  
tag: [Blog, Web Design, Rants]  
date: Nov. 20th, 2021  
categories: [Website]  
---

Despite the minimalist trends prevalent throughout the web nowadays, web pages
have only gotten more and more bloated. Just 5 years ago the average web page
was already larger than the original DOOM for MS-DOS. As someone with a
preference for [software minimalism](https://suckless.org/philosophy/), it’s
something that’s continuously annoyed me throughout the years. What’s worse is
that web pages only seem to be getting larger.

In reaction to this, I choose to design this blog to be as lightweight and easy
to load as possible. I’ve never had the most powerful PC in the world. I
remember times back in High School where my computer just couldn’t handle Chrome
or Firefox. Since then, modern web browsers have implemented a plethora of new
features and in turn have become potentially bigger resource hogs. While these
new features provide a lot of creative of power to web designers, it’s part of
the designer's job to wield these powers appropriately.

{% include image.html url='/content/nocss_frontpage.png' caption='What software
minimal website looks like' %}

Just to be clear, I’m not claiming software minimalism always needs to be a
designer’s primary consideration when designing a web page. All I’m trying to
say is there’s a balance that needs to be respected when it comes to designing
for the modern web. Some scenarios need access to advance scripting
functionalities. There wouldn’t be full office suites like Google Docs available
online without such things. Furthermore, If we were to prioritize software
minimalism over all other aspects of web page design, most web pages would
probably look like [this](https://nocss.club/). If that is the internet you
prefer, you should probably switch to the gopher protocol or something.

Just because you can create make use of complex elements doesn’t mean you
should, however. By bloating a web page, a designer runs the risk needlessly
increasing the amount resources required to load and display the page. Not only
does this make it harder for the a user to load the page, it also increases a
pages environmental footprint.

{% include image.html url='/content/ocadu_frontpage.png' caption='What software
minimalism does not look like' %}

Let’s look at OCADU’s front page for example. I noticed it features a video
which automatically loads up every time someone visits it. This video is a short
montage of students working at the school. It doesn’t provide any real
information and seem to be more of a decorative splash element. Before I even
benchmark the page, having a video as a splash element is a bit rude. By putting
it there, OCAD’s forcing a lot of people to download this huge video file just
to visit their websites front.

Below are part of the results provided by Pingdom’s speed benchmarking tool:

{% include image.html url='/content/ocadu_size.png' caption='Size of OCADU front
page by file type' %}

As we can see above, OCADU’s front page is over 20MB. And of course, most of
that weight is the video the school embedded. If I were bandwidth limited or
data capped, just opening the front page would eat a significant chunk of my
available transfer for the month. Also, if I were to access this page from an
older computer (such as my lovely Acer Aspire One D250), it would probably take
up the entirety of its processing power just to display. I know there’s plenty
of people out there still using old hardware running Windows XP or something. Or
maybe I’m weird, because I’m the kind of person who doesn’t throw out their old
computers. Either way there’s enough e-waste out there. The more use cases we
can provide for older machines, the better.

Speaking of e-waste, there’s a carbon cost for each byte of data transferred
online. According to Wholegrain Digital, every GB costs about 1.8kW of
electricity an hour. If we do the math, that means OCADU’s front page costs
approximately 0.03533kWh for each un-cached visitor. If we multiply that with
the total number of students at OCADU it would cost 214.52kWh for each student
at OCAD to visit the index page once.

So please, before you start laying down all those web traffic trackers,
multimedia elements, and JavaScript libraries, ask yourself if its necessary
first. You may save me an aneurysm.

**Citations**:

1.  [The Average Webpage Is Now the Size of the Original
    Doom](https://www.wired.com/2016/04/average-webpage-now-size-original-doom/)
2.  [Webpages Are Getting Larger Every Year, and Here’s Why it
    Matters](https://www.pingdom.com/blog/webpages-are-getting-larger-every-year-and-heres-why-it-matters/)

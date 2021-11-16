---
layout: post
tag: [Blog Stuff, JavaScript]
date: Nov. 14, 2021
---

Over the past three or so days, I've been kind of taking a break from programming the Bela in order to focus my attention on this blog. Despite aiming for a lightweight website, I made a few compromises by deciding to use javascript for a couple things within my previous iteration. After testing the website on an [old netbook](https://www.cnet.com/products/acer-aspire-one-d250/specs/) however, I noticed that even having a minimal amount of scripting was a bit too much. Thus I decided to try and re-design what I had to work without the javascript elements. One thing led to another and somehow I ended up with a whole new layout.

![3 screens lol]({{ "/assets/images/content/3screens.jpg" | relative_url }})

# Issues with the Old Layout

Prior to the re-design, one of the things I was using javascript for was to show and hide my menu items. If you're interested in how that works, the source code for the previous version of the site can be found [here](https://github.com/cheesoup/GRPH/tree/bf5ac20a3080064854d65529b38d4fbd6abc8bad) (thank God for git). I've highlighted a portion of the sliding menu script below.

{% highlight js %}
var toggle = false;
var size;

function opened() {
  document.getElementById("nav").style.opacity = "100";
  document.getElementById("nav").style.margin = "var(--side_navOpen)";
  document.getElementById("content").style.margin = "var(--content_navOpen)";
  toggle = true;
}

function closed() {
  document.getElementById("nav").style.opacity = "0";
  document.getElementById("nav").style.margin = "var(--side_navClose)";
  document.getElementById("content").style.margin = "var(--content_navClose)";
  toggle = false;
}
{% endhighlight %}


I wanted to highlight the above because its pretty much the core of my implementation. The only thing this scripts doing is toggling between two CSS states. I think the issue here was that for some reason, I kind of failed to realize how heavy CSS transitions are. I kind of figured, they were safe to use due to how long they've been around. By clicking the menu button however, my old netbook would instantly shoot up to 97% CPU usage.

Another thing I was using javascript for was to create hyperlinks which would place URLs in your clipboard. This was used for the RSS option in the navigation bar in order to have users avoid seeing a huge glob on unformatted XML when they clicked it. Unforunately, the idea was wonky idea at best. Firstly, not every browser supports letting javascript edit a user's clipboard. Secondly, it was unintuitive.

# On to the New

Other than getting rid of javascript, I had a couple goals in mind when working on the redesign. I'll continue writing this later though because it's late ):

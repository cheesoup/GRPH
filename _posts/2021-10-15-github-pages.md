---
layout: post
tag: [Blog Stuff]
date: Oct. 15, 2021
---

Debugging this site was a lot more of a pain in the ass than I thought it would be. After an extra day of website work, I finally managed to get my Github Pages to recognize my Jekyll source repository as a website. I feel like this should've been obvious how to do, but I'm actually pretty unfamiliar with the git protocol.

Initially, I thought you were supposed to simply upload the preview site to your repo. However, after inspecting other people Jekyll repos, I noticed that they had their whole Jekyll project within the repository. This kinda baffled me, but when I tried it, low and behold my site showed up automatically. Unfortunately this wasn't a perfect process. Uploading my site in such a way resulted in something going wrong with the tagging system.

Apparently Github Pages doesn't support the [Jekyll-Tagging](https://github.com/pattex/jekyll-tagging) plugin. It took me a while to figure this out and I was getting really annoyed about it. Ultimately, I had to look into some liquid code for building a tag clouds. Below are some pages I referenced while trying to fix this issue.

[Setting up a GitHub Pages site with Jekyll](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll)\
[CodinFox](https://codinfox.github.io/dev/2015/03/06/use-tags-and-categories-in-your-jekyll-based-github-pages/)\
[superdevresources.com](https://superdevresources.com/tag-cloud-jekyll/)

I still need to get the RSS working. I don't think it's that important though :p

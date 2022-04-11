---
title: OSC, WS, and NodeJS (aka how mistakes were made :C)
layout: post
tag: [Audio Programming, Networking, Web Design]
date: Apr. 10th, 2022
categories: [Audio, Website]
---

As mentioned while talking about MIDI, I’m currently using a combination of Open Sound Control and WebSockets as a means of communication between users and my project. My initial plan was to build a webpage which was capable of sending OSC messages to Bela. I soon realized however that it simply wasn’t possible to do this and thus decided to bridge Bela’s OSC capabilities with a separate application for handling WebSocket interactions. In this post I want to go over how communication between users and Bela works. Like I said in my post about program structure, I’m sure there is a much better way to do this. Bela even has its own library for handling WebSockets. Right now though, I don’t really have much time to figure something else out.

–insert typical osc message here–

Before I continue, I should quickly go over what OSC is. Like MIDI, OSC is a communication protocol targeted towards electronic music applications and typically works over a standard IEEE 802.3 network such as a typical home wireless network. Unlike MIDI, which only supports integer values between 0-127, OSC messages are much more dynamic. Using OSC, we can not only communicate in 32-bit integers and floats, but also in blobs and strings. This makes it much easier for me to handle multiple users as I can simply pass ID hashes through OSC to identify who’s sending what.

Bela provides a library for OSC interaction which more or less streamlines the whole process of sending and receiving OSC messages. To illustrate this, I’ve posted some example code below.

{% highlight c++ %}
void receiveOSC(oscpkt::Message *msg, void *arg) {
  oscpkt::Message out;
  std::string id;
  std::string command;
  float val = 0;

  if(msg->match("/start")) {
    gPlayers->play();
  }
  if(msg->match("/register")) {
    std::string id;
    bool connected;

    msg->match("/register").popStr(id).popBool(connected);
    if (connected && !(gPlayers->isPlaying())) {
    	std::string playerlist;
    	gPlayers->create(id);
    	out.init("/confirm_player").pushStr(id).pushBool(true);
    	oscSender.send(out);

    	gPlayers->dumpPlayers(playerlist);
    	out.init("/player_list").pushStr(playerlist);
    	oscSender.send(out);
    }
    else if (!connected) {
    	gPlayers->destroy(id);
    }
    else {
    	out.init("/confirm").pushStr(id).pushBool(false);
    	oscSender.send(out);
    }
  }
  if(msg->match("/control_change").popStr(command).popStr(id).isOkNoMoreArgs()) {
      gPlayers->control(command, id);
  }
  if (msg->match("/control_change").popStr(command).popStr(id).popFloat(val).isOkNoMoreArgs()) {
      gPlayers->control(command, id, val);
  }
}
{% endhighlight %}

This, however, didn’t leave me problemless as I soon realized that sending and receiving OSC messages from a browser was something that just couldn’t happen. Though I don’t really know much about it, transmitting over UDP through a web browser is a security risk, and thus not actually possible in modern browsers. OSC messages are typically sent over UDP so this was actually a huge roadblock for me.

{% include image.html url='network_diagram.png' caption='A diagram of how note sequence is structured within my program' %}

This is where WebSockets came in. After doing a bit of research, I found a thread where Bela guys recommended building a WebSocket to OSC bridge using NodeJS. At the time, I had no idea how to do this, but after a lot of looking around I managed to find a couple of resources explaining how to do things in using NodeJS for stupid people like me. Below I’ve included my code for a WebSocket to OSC bridge.

{% highlight js %}
// Ports and Addresses
var sendPort = 7562;
var receivePort = 7563;
var localIP = '127.0.0.1';
var server_ready = false;

/*------*/
/* HTTP */
/*------*/
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

// Launch webpage
var server = http.createServer(handleRequest);
server.listen(8080);

function handleRequest(req, res) {
  var pathname = req.url;
  if (pathname == '/') pathname = '/index.html';
  var ext = path.extname(pathname);
  var typeExt = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
  };
  var contentType = typeExt[ext] || 'text/plain';

  fs.readFile(__dirname + pathname,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  );
}
console.log('Server started on port 8080');
{% endhighlight %}

This chunk of code pertains to hosting the webserver. It's pretty much a completely copied from [tutorial](https://github.com/processing/p5.js/wiki/p5.js,-node.js,-socket.io) found on Github. The first portion of the code regarding the ``var server`` tells Node to start an http server and have it listen in on port 8080. Typically, the proper port to use for an HTTP server would be 80, but the Bela Web IDE is already hosted on it. Changing the port of the IDE causes more trouble than it's worth unfortunately.

{% highlight js %}
/*-----------*/
/* Websocket */
/*-----------*/

var websocket = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["test"],
    credentials: true
  }
});

websocket.on('connection', function (socket) {
  // On Connect
  if (server_ready) {
    sendOSC(osc.toBuffer(
      { address : '/register', args: [socket.id, true] }
    ));
  } else {
    websocket.to(socket).emit("error", {
      error : "Server isn't ready. Try refreshing in about five seconds."
    });
  }
  // On Control Change
  socket.on('control_change',	function(data) {
    if (server_ready) {
      let cmd = data.command;
      let val = data.value;
      sendOSC(osc.toBuffer({ address : '/control_change', args: [socket.id, cmd, val] }));
      websocket.emit("control_change", { id: socket.id, command: cmd, value: val });
    }
  });
  // On Disconnect
  socket.on('disconnect', function() {
    if (server_ready) {
      sendOSC(osc.toBuffer(
        { address : '/register', args: [socket.id, false] }
      ));
    }
  });
});
{% endhighlight %}

This chunk is for handling WebSocket connections. Like the HTTP server portion, it's based on the same tutorial from Github, though it's been changed to serve my own purposes. First we start off by declaring a new Socket.io module and have it listen in on the server for socket connections. From there we can define our server to client behavior using the ``websocket.on`` function.

In order to keep editing this function to minimal, I'm really trying use as few emits as possible. Nothing frustrates me more than a spaghetti monster functions that continue to grow in nonsensicality as a program expands. Unfortunately, my project is full of these monsters already.

One key thing to note is that control messages are emitted back towards all users. This saves on needless packet travel between the audio server the users and ultimately allows for more immediately available information about the voice parameters.

{% highlight js %}
/*--------------*/
/* OSC over UDP */
/*--------------*/

var osc = require('osc-min');
var dgram = require('dgram');
var udpsocket = dgram.createSocket('udp4', function(buffer, rinfo) {
  var error;
  try {
    var msg = osc.fromBuffer(buffer);
    if (msg.oscType == 'message') parseOSC(msg);
    else if (msg.elements)
      for (let element of msg.elements) parseOSC(msg);
  } catch (error) {
    return console.log("(ERROR) OSC packet error: " + error);
  }
});

udpsocket.bind(receivePort);

function sendOSC(msg) {
  udpsocket.send(msg, 0, msg.length, sendPort, localIP, function(err) {
    if (err) console.log(err);
  });
}

function parseOSC(msg) {
  let address = msg.address.split('/');
  let data = {};
  if (!address || !address.length || address.length < 2) {
    console.log('(ERROR) Bad OSC address: ', address);
    return;
  }
  switch(address[1]) {
    case 'server_ready':
      console.log("Server is ready.");
      server_ready = true;
      break;
    case 'confirm_player':
      if (msg.args[1].value)
        console.log("We have a new client: " + msg.args[0].value);
      data = {
        status: msg.args[1].value
      };
      websocket.to(msg.args[0].value).emit(address[1], data);
      break;
    case 'note_on':
      data = {
        id: msg.args[0].value,
        note: msg.args[1].value,
        vel: msg.args[2].value,
        lfo: msg.args[3].value
      };
      websocket.emit(address[1], data);
      break;
    case 'note_off':
    case 'new_sequence':
      data = { id: msg.args[0].value };
      websocket.emit(address[1], data);
      break;
    case 'player_list':
      console.log(address[1]);
      data = { players: msg.args[0].value };
      websocket.emit(address[1], data);
      break;
    default:
      var print = "";
      for (let i = 0; i < msg.args.length; i++) {
        print += ("arg[" + i + "]: " + msg.args[i].value + ". ");
      }
      console.log(
        "Message addressed with " + address[1] +
        " received with " + msg.args.length + " arguments. " + print
      );
  }
}
{% endhighlight %}

Speaking of fat spaghetti monsters which continue to grow, this large piece code all pertains to handling OSC. Despite it's much larger size, it start's it similarly to the other code blocks by defining necessary modules. Unlike WebSockets require typically runs over a TCP connection, OSC specifically on Bela only accepts UDP connections. Thus we need start up a separate datagram socket for sending OSC messages. When a message is received over UDP, the bridge first checks if it's a valid OSC message. If it is, it passes the message to the parseOSC function which handles the OSC command.

Honestly I don’t have much else to say. I’m very new to all of this so I think that it’s actually a miracle that I got all this to work. As I’ve mentioned before, I’m sure there’s a better way of interfacing with WebSockets within the standard Bela environment. But for now, I’m happy enough that it works (most of the time).


if (typeof(Storage)  !== "undefined") {
var display, pomolengthInSec, timer, timeObj;

function CountDownTimer(duration, granularity) {
  this.duration = duration;
  this.granularity = granularity || 1000;
  this.tickFtns = [];
  this.running = false;
}
function format(minutes, seconds) {
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.textContent = minutes + ':' + seconds;
}

CountDownTimer.prototype.start = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  var start = Date.now(),
      that = this,
      diff, obj;

  (function timer() {
    diff = that.duration - (((Date.now() - start) / 1000) | 0);

    if (diff > 0) {
      setTimeout(timer, that.granularity);
    } else {
      diff = 0;
      that.running = false;
      that.expired()
    }

    obj = CountDownTimer.parse(diff);
    that.tickFtns.forEach(function(ftn) {
      ftn.call(this, obj.minutes, obj.seconds);
    }, that);
  }());
};

CountDownTimer.prototype.onTick = function(ftn) {
  if (typeof ftn === 'function') {
    this.tickFtns.push(ftn);
  }
  return this;
};

CountDownTimer.prototype.expired = function() {
  if (localStorage.mode === "work") localStorage.tomatocount++;
  refreshTomatoCount();
  notifyMe();
  localStorage.mode =  (localStorage.mode === "work") ? "free" : "work";
  initTimer();
  return !this.running;
};

CountDownTimer.parse = function(seconds) {
  return {
    'minutes': (seconds / 60) | 0,
    'seconds': (seconds % 60) | 0
  };
};

function notifyMe() {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have alredy been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification("Hi there!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("Hi there!");
      }
    });
  }
}

function isSameDay(d1, d2) {
	return (d1.getDate() === d2.getDate() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getFullYear() === d2.getFullYear());
}

function saveSettings() {
	localStorage.pomolength = document.getElementById("pomolength").value;
	localStorage.shortbreaklength = document.getElementById("shortbreaklength").value;
	localStorage.bigbreaklength = document.getElementById("bigbreaklength").value;
	localStorage.countuntilbigbreak = document.getElementById("countuntilbigbreak").value;
}

function refreshTomatoCount() {
  document.getElementById("tomatocount").textContent = localStorage.tomatocount;
  return true;
}

function resetSettings() {
	localStorage.pomolength = 25;
	localStorage.shortbreaklength = 5;
	localStorage.bigbreaklength = 15;
	localStorage.countuntilbigbreak = 4;
	setDisplay();
}

function initLocalStorage() {
	today = new Date;
	today.getDay()
	localStorage.lastUsed = (localStorage.lastUsed === undefined) ? today : localStorage.lastUsed;
	localStorage.pomolength = (localStorage.pomolength === undefined) ? 25 : localStorage.pomolength;
	localStorage.shortbreaklength = (localStorage.shortbreaklength === undefined) ? 5 : localStorage.shortbreaklength;
	localStorage.bigbreaklength = (localStorage.bigbreaklength === undefined) ? 15 : localStorage.bigbreaklength;
	localStorage.countuntilbigbreak = (localStorage.countuntilbigbreak === undefined) ? 4 : localStorage.countuntilbigbreak;
	localStorage.mode =  (localStorage.mode === "work") ? localStorage.mode : "free"; 
	
	// fix lastUsed
	if (typeof localStorage.lastUsed !== Date){
		localStorage.lastUsed = today;
	}
	lastUsed = new Date(localStorage.lastUsed);
	
	// reset tomatocount if last used is on other day
	if (! isSameDay(today, lastUsed)) {
		localStorage.tomatocount =  0;
	} else {
		localStorage.tomatocount =  (localStorage.tomatocount === undefined) ? 0 : localStorage.tomatocount;
	}
}

function setDisplay() {
	document.getElementById("pomolength").value =  localStorage.pomolength;
	document.getElementById("shortbreaklength").value = localStorage.shortbreaklength;
	document.getElementById("bigbreaklength").value = localStorage.bigbreaklength;
	document.getElementById("countuntilbigbreak").value = localStorage.countuntilbigbreak;
	document.body.style = (localStorage.mode === "work") ? "background-color: #0099ff;" : "background-color: #ccffcc;";
}

function startCountdown() {
	timer.start();
	setDisplay();
}

function initTimer() {
	var LengthInSec;
	if (localStorage.mode === "work") {
	    LengthInSec = localStorage.pomolength * 60;
	} else {
		if (localStorage.tomatocount % localStorage.countuntilbigbreak === 0) {
			LengthInSec = localStorage.bigbreaklength * 60;
		} else {
			LengthInSec = localStorage.shortbreaklength * 60;
		}

	}
	timer = new CountDownTimer(LengthInSec);
	timeObj = CountDownTimer.parse(LengthInSec);
	format(timeObj.minutes, timeObj.seconds);
	timer.onTick(format);
}

window.onload = function () {
    initLocalStorage()
    setDisplay();
    refreshTomatoCount();
    display = document.querySelector('#time');

    initTimer();

    
    document.querySelector('#StartCountdownButton').addEventListener('click', startCountdown);
    document.querySelector('#SaveSettingsButton').addEventListener('click', saveSettings);
    document.querySelector('#ResetSettingsButton').addEventListener('click', resetSettings);
    
};

} else {

}

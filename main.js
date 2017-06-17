// @codekit-prepend "node_modules/waypoints/lib/noframework.waypoints.min.js";
// @codekit-prepend "node_modules/lazysizes/lazysizes.min.js";


document.addEventListener('DOMContentLoaded', function() {

	var navItems = (function() {
		var linkElements = document.querySelectorAll('.nav__link');
		var linkLookup = {};

		[].forEach.call(linkElements, function(link) {
			linkLookup[link.getAttribute('data-section')] = link;
		});

		return linkLookup;
	})();

	new Waypoint({
	  element: document.querySelector('.main__about'),
	  handler: function(direction) {
	  	if (direction === 'down') {
			document.querySelector('.heading').classList.add('heading--active');
		} else {
			document.querySelector('.heading').classList.remove('heading--active');
		}
	  },
	  offset: -25
	})


	var sections = {
		about: {
			elem: document.querySelector('.main__about'),
			onEnter: function() {
				console.log('arrive about');
			},
			onLeave: function() {
				console.log('leave about');
				// unrevealMain(this);
				// this.classList.remove('main--active');
			}
		},
		process: {
			elem: document.querySelector('.main__process'),
			onEnter: function() {
				console.log('arrive process');
			},
			onLeave: function() {
				// unrevealMain(this);
				console.log('leave process');
			}
		},
		contact: {
			elem: document.querySelector('.contact-background'),
			onEnter: function() {
				console.log('arrive contact');
			},
			onLeave: function() {
				// unrevealMain(document.querySelector('.contact-background'));
				console.log('arrive contact');
			},
		},
	};

	function navUpdate(sectionName) {
		var activeNavElem = document.querySelector('.nav__link--is-current');

		if (activeNavElem) {
			activeNavElem.classList.remove('nav__link--is-current');
		}
		
		navItems[sectionName].classList.add('nav__link--is-current');
	}

	Object.keys(sections).forEach(function(section) {
		var sectionName = sections[section].elem.getAttribute('data-section');

		new Waypoint({
		  element: sections[section].elem,
		  offset: 30 * 16,
		  // offset: 25 * 16,

		  handler: function(direction) {
		  	if (direction == 'down') {
		  		navUpdate(sectionName);
		  	}
			
		  	if (sections[section].onEnter) {
		  		sections[section].onEnter.call(sections[section].elem);
		  	}
		  }
		});

		new Waypoint({
		  element: sections[section].elem,
		  handler: function(direction) {
		  	// navUpdate(sectionName);
		  	if (direction == 'up') {
		  		navUpdate(sectionName);
		  	}
		  	if (sections[section].onLeave) {
		  		sections[section].onLeave.call(sections[section].elem);
		  	}
		  },
		  offset: function() {
   		 	return -this.element.clientHeight + (15 * 16);
  		  }
		});

	});

});
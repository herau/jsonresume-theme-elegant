var fs = require('fs');
var gravatar = require('gravatar');
var Mustache = require('mustache');
var _ = require('underscore');
var moment = require('moment');

function hasPersonalEmail(resumeObject) {
	return (resumeObject.bio && resumeObject.bio.email && resumeObject.bio.email.personal);
}

function render (resumeObject) {
	if (hasPersonalEmail(resumeObject)) {
		resumeObject.bio.gravatar = gravatar.url(resumeObject.bio.email.personal, {
			s: '100',
			r: 'pg',
			d: 'mm'
		});
	}

	// email munging to avoid spammers
	if (resumeObject.basics && resumeObject.basics.email) {
		resumeObject.basics.email = '<span>' + resumeObject.basics.email.split('').join('</span><span>') + '</span>';
	}

	var humanizeDate = function (datestr) {
		return moment(datestr).format("MMM YYYY").replace(' ', '&nbsp;');
	}

	var processDates = function (node) {
		if (!node.endDate) {
			node.endDate = "present";
		}
		else {
			node.endDate = humanizeDate(node.endDate);
		}
		if (node.startDate) node.startDate = humanizeDate(node.startDate);
		if (node.date) node.date = humanizeDate(node.date);
	};

	_.each(resumeObject.work, processDates);
	_.each(resumeObject.education, processDates);
	_.each(resumeObject.volunteer, processDates);
	_.each(resumeObject.awards, processDates);

	var locs = [];
	if (resumeObject.basics.location) {
		_.each(['address', 'city', 'region', 'postalCode', 'countryCode'], function(s) {
			if (resumeObject.basics.location[s]) {
				locs.push(resumeObject.basics.location[s]);
			}
		});
	}
	resumeObject.basics._humanized_location = locs.join(', ');

	var theme = fs.readFileSync(__dirname + '/resume.template', 'utf8');
	var resumeHTML = Mustache.render(theme, resumeObject);
	return resumeHTML;
}

module.exports = { render: render };

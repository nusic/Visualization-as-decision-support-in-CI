[
	'http://cpettitt.github.io/project/graphlib-dot/latest/graphlib-dot.min.js',
	'http://cpettitt.github.io/project/dagre-d3/latest/dagre-d3.min.js',
]
.forEach((url) => {
	var script = document.createElement('script');
	script.src = url;
	document.getElementsByTagName('head')[0].appendChild(script);
	console.log('loading ' + url.substring(url.lastIndexOf('/')));;
});
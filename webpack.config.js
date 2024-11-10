const path = require('path');

module.exports = {
	// ...existing code...
	resolve: {
		fallback: {
			"https": require.resolve("https-browserify"),
			// ...other fallbacks if needed...
		}
	}
};
module.exports = function(grunt) {
	grunt.initConfig({
		htmlmin: {
			html: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					collapseInlineTagWhitespace: true,
					removeTagWhitespace: true,
					continueOnParseError: true,
					keepClosingSlash: true
				},
				files: {
					"build/1-sheet.html": "src/1-sheet.html",
					"build/2-templates.html": "src/2-templates.html"
				}
			}
		},
		replace: {
			html: {
				options: {
					patterns: [
						{match: "> <", replacement: "><"}
					],
					usePrefix: false,
					silent: true
				},
				files: [
					{expand: true, flatten: true, src: ["build/1-sheet.html", "build/2-templates.html"], dest: "build"}
				]
			},
			js: {
				options: {
					patterns: [
						{match: new RegExp("<!--.*-->", "gi"), replacement: ""}, // html inline comments
						{match: new RegExp("^\\s+", "gim"), replacement: ""}, // whitespaces at line start
						{match: new RegExp("\\s+$", "gim"), replacement: ""}, // whitespaces at line end
						{match: new RegExp("^(//.*)?$", "gim"), replacement: ""}, // inline comments at line start
						{match: new RegExp("(\{|;|,|\\))\\s*//.*$", "gim"), replacement: "$1"}, // inline comments after statement
						{match: new RegExp("(\\w)\\s+//.*$", "gim"), replacement: "$1"}, // inline comments after word
						{match: new RegExp("/\\*(.|\\r|\\n)*\\*/", "gim"), replacement: ""}, // multiline comments
						{match: new RegExp("(\\r|\\n)", "gi"), replacement: ""} // carriage returns and line feeds
					],
					usePrefix: false,
					silent: true
				},
				files: [
					{expand: true, flatten: true, src: ["src/3-worker.js"], dest: "build"}
				]
			},
			translation: {
				options: {
					patterns: [
						{match: new RegExp("\t//.*", "gi"), replacement: ""},
						{match: new RegExp("(\r\n)(\r\n)+", "gi"), replacement: "$1"}
					],
					usePrefix: false,
					silent: true
				},
				files: [
					{src: ["src/0-translation.json"], dest: "translation.json"}
				]
			}
		},
		concat: {
			html: {
				src: ["build/1-sheet.html", "build/2-templates.html", "build/3-worker.js"],
				dest: "stalker.html"
			}
		}
	});

	// Load the plugin that provides the tasks
	grunt.loadNpmTasks("grunt-contrib-htmlmin");
	grunt.loadNpmTasks("grunt-replace");
	grunt.loadNpmTasks("grunt-contrib-concat");

	// Default tasks
	grunt.registerTask("default", ["htmlmin", "replace", "concat"]);

};

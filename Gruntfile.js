
module.exports = function (grunt) {
  //paths to binaries, so no globals are needed
  var browserify = './node_modules/.bin/browserify';
  var tape = './node_modules/tape/bin/tape';
  var tapSpec = './node_modules/tap-spec/bin/cmd.js';
  var fileServer = './node_modules/.bin/http-server';
  var uglify = './node_modules/uglify-js/bin/uglifyjs';

  //paths
  var uncompressed = './builds/nlp_compromise.js';
  var compressed = './builds/nlp_compromise.min.js';

  grunt.initConfig({

    pkg: grunt.file.readJSON('./package.json'),

    watch: {
      files: ['./src/*.js', './src/**', './test/unit_tests/**'],
      tasks: ['run:main']
    },

    run: {
      cleanup: { //remove builds
        exec: 'rm -rf ./builds && mkdir builds'
      },
      init: { //add a header, before browserify
        exec: 'echo "/* nlp_compromise v<%= pkg.version %> MIT*/" > ' + uncompressed
      },
      build: { //browserify -> babel -> derequire
        exec: browserify + ' ./src/index.js --standalone nlp_compromise -t [ babelify --presets [ es2015 ] ] | derequire >> ' + uncompressed
      },
      uglify: { // jsFile -> jsFile.min
        exec: uglify + ' ' + uncompressed + ' --mangle --compress --output ' + compressed + ' --preamble "/*nlp_compromise v<%= pkg.version %> MIT*/"' // --source-map ' + compressed + '.map'
      },
      test: {
        exec: tape + ' ./test/unit_test/**/*_test.js | ' + tapSpec
      },


      demo: {
        exec: fileServer + ' demo -o -c-1'
      },
      main: {
        exec: 'node ./src/index.js'
      },
      build_windows: {
      },
      demo_windows: {
      }
    },

    filesize: {
      base: {
        files: [{
          src: [compressed]
        }],
        options: {
          ouput: [{
            stdout: true
          }]
        }
      }
    },

    eslint: {
      target: ['./src/**'],
      options: {
        configFile: '.eslintrc',
      },
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-filesize');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.registerTask('default', ['run:main']);
  grunt.registerTask('test', ['run:test']);
  grunt.registerTask('compress', ['run:uglify']);
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('demo', ['run:demo']);
  grunt.registerTask('build', ['run:test', 'eslint', 'run:cleanup', 'run:init', 'run:build', 'run:uglify', 'filesize']);
};

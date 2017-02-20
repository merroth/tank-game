module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      js: {
        src: ['node_modules/angular/angular.js', 'node_modules/angular-cookies/angular-cookies.js', 'node_modules/angular-ui-router/release/angular-ui-router.js'],
        dest: 'build/script.js',
        nonull: true
      },
      css: {
        src: ['node_modules/normalize.css/normalize.css', 'style/style.css'],
        dest: 'build/style.css',
        nonull: true
      }
    },
    uglify: {
      dist: {
        files: {
          'build/script.min.js': ['build/script.js']
        }
      }
    },
    cssmin: {
      dist: {
        files: {
          'build/style.min.css': ['build/style.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);

};

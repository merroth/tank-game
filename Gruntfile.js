module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      css: {
        src: ['node_modules/normalize.css/normalize.css', 'style/style.css'],
        dest: 'build/<%= pkg.name %>.css'
      },
      js: {
        src: ['node_modules/angular/angular.js', 'node_modules/angular-cookies/angular-cookies.js', 'node_modules/angular-ui-router/release/angular-ui-router.js'],
        dest: 'build/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'build/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
        }
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'build',
          src: ['*.css', '!*.min.css'],
          dest: 'build',
          ext: '.min.css'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);

};

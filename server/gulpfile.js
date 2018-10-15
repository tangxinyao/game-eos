const gulp = require('gulp')
const changed = require('gulp-changed')
const nodemon = require('gulp-nodemon')

const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')

gulp.task('default', ['compile'])

gulp.task('dev', ['compile'], function () {
    const stream = nodemon({
        script: 'dist/app.js',
        watch: 'src',
        ext: 'ts',
        stdout: true,
        tasks: ['compile']
    })
    stream.on('restart', function () {
        console.log('application restarted.')
    })
    stream.on('crash', function () {
        console.error('application crashed.')
    })
    return stream
})

//gulp changed
gulp.task('compile', function () {
    return tsProject.src()
        .pipe(changed('dist', { extension: '.js' }))
        .pipe(tsProject()).js
        .pipe(gulp.dest('dist'))
})
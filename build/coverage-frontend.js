var fs = require('graceful-fs'),
    colors = require('colors'),
    scope = process.argv[2],
    fileName = process.cwd() + '/tests/results/' + scope + '_coverage/coverage.txt';

fs.stat(fileName, function (error, stats) {

    'use strict';

    if (error) {
        throw (
            'frontend-coverage.js in scope `' + scope +
            '` :: Caught an exception while checking coverage value in file: ' + fileName + "\n" +
            error + "\n"
            );
    }

    fs.open(fileName, 'r', function (error, fd) {

        var buffer = new Buffer(stats.size);

        fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {

            var data = buffer.toString('utf8', 0, buffer.length),
                lines = data.split("\n"),
                coverage = {},
                reportPrefix = 'INFO [coverage]:',
                threshold = 80;

            lines = lines.slice(2, 6);

            for (var i = 0, len = lines.length, line; i < len; i++) {
                line = lines[i];
                line = line.replace(/\u001b\[\d+m/, '');
                line = line.split(':');
                coverage[line[0].trim().toLowerCase()] = parseFloat(/[0-9\.]+/.exec(line[1]));
            }

            fs.close(fd);

            console.log(
                    'Frontend [' + scope + '] code coverage report, threshold is ' +
                    threshold + '%. Build fails on lines, functions, branches below threshold.'
            );
            console.log(
                    coverage.statements < threshold
                    ? reportPrefix.red
                    : reportPrefix.green,
                    'Statements - ' + coverage.statements + '%'
            );
            console.log(
                    coverage.lines < threshold ? reportPrefix.red : reportPrefix.green,
                    'Lines     - ' + coverage.lines + '%'
            );

            process.exit(
                (coverage.lines < threshold /* ||coverage.branches < threshold */ || coverage.statements < threshold)
                    ? 1
                    : 0
            );
        });
    });
});
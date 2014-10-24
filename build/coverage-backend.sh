#!/bin/bash

MOCHA=node_modules/.bin/mocha
ISTANBUL=node_modules/.bin/istanbul

if [[ "$1" == "check" ]]; then
    CHECK="true"
elif [[ "$1" != "" ]]; then
    REPORTER=$1
else
    REPORTER="cobertura"
fi

# remove previous coverage reports
rm -rf tests/results/backend_coverage/coverage*

# test files must end with ".spec.js"
TESTS=$(find tests/backend -name "*.spec.js")

# instrument the code and create the baseline
$ISTANBUL instrument \
    -x **/app.js \
    --save-baseline \
    --baseline-file tests/results/backend_coverage/coverage-baseline.json \
    --embed-source \
    --output src-cov backend

# move original lib code and replace it by the instrumented one
mv backend ./src && mv src-cov backend

# sharereceive tests need the config.json file
# ln -s ../../src/config.json "$SCOPE"/src/config.json

# run mocha using the mocha-istanbul reporter *but* generate json so we can merge the results with the baseline
ISTANBUL_REPORTERS=json $MOCHA -R mocha-istanbul $TESTS

# move the coverage file to coverage dir
mv coverage-final.json tests/results/backend_coverage

# merge the reports
$ISTANBUL report $REPORTER --root tests/results/backend_coverage --dir tests/results/backend_coverage

# move the directories back to what they used to be
rm -rf backend
mv src/ backend

# check coverage
if [[ $CHECK == "true" ]]; then
    echo "Checking code coverage"
    $ISTANBUL check-coverage --lines 80 --statements 80 --branches 75 tests/results/backend_coverage/coverage-final.json
    if [ $? != 0 ]; then
        echo "INFO [coverage]: failed"
        exit 1
    else
        echo "INFO [coverage]: successful"
    fi
fi
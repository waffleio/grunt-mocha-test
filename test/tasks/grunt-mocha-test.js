/*jshint loopfunc: true */

var expect = require('chai').expect;
var path = require('path');
var fs = require('fs-extra');
var ChildProcess = require('cover-child-process').ChildProcess;
var Blanket = require('cover-child-process').Blanket;
var childProcess = new ChildProcess(new Blanket());
var gruntExec = 'node ' + path.resolve('node_modules/grunt-cli/bin/grunt');

var execScenario = function(scenario, callback) {
  var scenarioDir = __dirname + '/../scenarios/' + scenario;
  childProcess.exec(gruntExec, {cwd: scenarioDir}, callback);
};

describe('grunt-mocha-test', function() {
  it('should run tests from the supplied files', function(done) {
    execScenario('tests', function(error, stdout, stderr) {
      expect(stdout).to.match(/test1/);
      expect(stdout).to.match(/test2/);
      expect(stdout).to.match(/2 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should run tests from the supplied files with expand option', function(done) {
    execScenario('testsExpand', function(error, stdout, stderr) {
      expect(stdout).to.match(/test1/);
      expect(stdout).to.match(/test2/);
      expect(stdout).to.match(/2 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should report the number of test failures and exit grunt with an error on failed tests', function(done) {
    execScenario('testFailure', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/Aborted due to warnings./);
      expect(stderr).to.match(/1 failing/);
      done();
    });
  });

  it('should cleanly catch asynchronous test failures so that grunt does not exit early', function(done) {
    execScenario('asyncTestFailure', function(error, stdout, stderr) {
      expect(stdout).to.match(/Asynchronous test/);
      expect(stdout).to.match(/Aborted due to warnings./);
      expect(stderr).to.match(/1 failing/);
      done();
    });
  });

  it('should cleanly catch and log require exceptions thrown synchronously by Mocha so that grunt does not exit early', function(done) {
    execScenario('requireFailure', function(error, stdout, stderr) {
      expect(stdout).to.match(/Cannot find module 'doesNotExist/);
      expect(stdout).to.match(/test.js/);
      expect(stdout).to.match(/Aborted due to warnings./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should cleanly catch and log net connect exceptions thrown asynchronously by Mocha so that grunt does not exit early', function(done) {
    execScenario('connectFailure', function(error, stdout, stderr) {
      expect(stdout).to.match(/Aborted due to warnings./);
      expect(stderr).to.match(/1 failing/);
      done();
    });
  });

  it('should cleanly catch and log exceptions thrown asynchronously by tests that have a before that starts an HTTP server', function(done) {
    execScenario('asyncFailureWithBefore', function(error, stdout, stderr) {
      expect(stdout).to.match(/async tests/);
      expect(stdout).to.match(/2 passing/);
      expect(stdout).to.match(/Aborted due to warnings./);
      expect(stderr).to.match(/1 failing/);
      done();
    });
  });

  it('should support the require option', function(done) {
    execScenario('requireOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the colors option', function(done) {
    execScenario('colorsOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/\u001b\[4mRunning \"mochaTest:all\" \(mochaTest\) task\u001b\[24m\n\n\n  test\n\r    ✓ should be ok \n\n\n  1 passing/);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the require option with arrays', function(done) {
    execScenario('requireArrayOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the require option with complicated globals', function(done) {
    execScenario('requireSingleton', function(error, stdout, stderr) {
      expect(stdout).to.match(/test1/);
      expect(stdout).to.match(/test2/);
      expect(stdout).to.match(/2 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the require option with coffee-script', function(done) {
    execScenario('requireCompilersOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/test coffee-script/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the clearRequireCacheOption', function(done) {
    execScenario('clearRequireCacheOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/mochaTest:on/);
      expect(stdout).to.match(/mochaTest:off/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).not.to.match(/0 passing/);
      expect(stdout).not.to.match(/2 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the clearRequireCacheOption with the require option', function(done) {
    execScenario('clearRequireCacheAndRequireOptions', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the grep option', function(done) {
    execScenario('grepOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/tests that match grep/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the invert option', function(done) {
    execScenario('invertOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/tests that don't match grep/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the ignoreLeaks option', function(done) {
    execScenario('ignoreLeaksOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/Aborted due to warnings./);
      expect(stderr).to.match(/1 failing/);
      expect(stderr).to.match(/Error: global leak detected: leak/);
      done();
    });
  });

  it('should support the globals option', function(done) {
    execScenario('globalsOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the asyncOnly option', function(done) {
    execScenario('asyncOnlyOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/Aborted due to warnings./);
      expect(stderr).to.match(/1 failing/);
      expect(stderr).to.match(/Error: --async-only option in use without declaring/);
      done();
    });
  });

  it('should support the reporter option', function(done) {
    execScenario('reporterOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/<section class="suite">/);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the ui option', function(done) {
    execScenario('uiOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/test1/);
      expect(stdout).to.match(/test2/);
      expect(stdout).to.match(/2 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support using a custom ui option', function(done) {
    execScenario('uiOptionCustom', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support the timeout option', function(done) {
    execScenario('timeoutOption', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/Aborted due to warnings./);
      expect(stderr).to.match(/1 failing/);
      expect(stderr).to.match(/Error: timeout of 500ms exceeded/);
      done();
    });
  });

  it('should support the growl option', function(done) {
    execScenario('growlOption', function(error, stdout, stderr) { 
      // TODO: Let's just test that everything completed successfully
      // as there's no way of knowing if growl was actually called for now.
      // A possible option would be to mock the growl binaries in the 
      // growlOption scenario directory and have them do something that
      // the test can detect (HTTP server/request?). This would have to
      // be done for each platform though.
      expect(stdout).to.match(/test1/);
      expect(stdout).to.match(/test2/);
      expect(stdout).to.match(/2 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should support a destination file to write output', function(done) {
    var destinationFile = __dirname + '/../scenarios/destinationFile/output';

    // first remove the destination file
    if (fs.existsSync(destinationFile)) {
      fs.unlinkSync(destinationFile);
    }

    execScenario('destinationFile', function(error, stdout, stderr) {
      expect(stdout).to.match(/test1/);
      expect(stdout).to.match(/test2/);
      expect(stdout).to.match(/2 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');

      // now read the destination file
      var output = fs.readFileSync(destinationFile, 'utf8');
      expect(output).to.match(/test1/);
      expect(output).to.match(/test2/);
      expect(output).to.match(/2 passing/);

      done();
    });
  });

  it('should create parent directories for destination file', function(done) {
    var destinationDirectory = path.join(__dirname, '/../scenarios/destinationFileCreateDirectories/reports');
    var destinationFile = path.join(destinationDirectory, 'output');

    // first remove the destination directory
    if (fs.existsSync(destinationDirectory)) {
      fs.removeSync(destinationDirectory);
    }

    execScenario('destinationFileCreateDirectories', function(error, stdout, stderr) {
      expect(stdout).to.match(/test1/);
      expect(stdout).to.match(/test2/);
      expect(stdout).to.match(/2 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');

      // now read the destination file
      var output = fs.readFileSync(destinationFile, 'utf8');
      expect(output).to.match(/test1/);
      expect(output).to.match(/test2/);
      expect(output).to.match(/2 passing/);

      done();
    });
  });

  it('should support the quiet option', function(done) {
    var destinationFile = __dirname + '/../scenarios/quietOption/output';

    // first remove the destination file
    if (fs.existsSync(destinationFile)) {
      fs.unlinkSync(destinationFile);
    }

    execScenario('quietOption', function(error, stdout, stderr) {
      expect(stdout).to.not.match(/test1/);
      expect(stdout).to.not.match(/test2/);
      expect(stdout).to.not.match(/2 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');

      // now read the destination file
      var output = fs.readFileSync(destinationFile, 'utf8');
      expect(output).to.match(/test1/);
      expect(output).to.match(/test2/);
      expect(output).to.match(/2 passing/);

      done();
    });
  });

  it('should not run if the src config do not match any files', function(done) {
    execScenario('noFiles', function(error, stdout, stderr) {
      expect(stdout).to.match(/No files to check.../);
      expect(stdout).to.match(/Done, without errors./);
      expect(stdout).not.to.match(/0 passing/);
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should work with grunt-env', function(done) {
    execScenario('gruntEnvIntegration', function(error, stdout, stderr) {
      expect(stdout).to.match(/test/);
      expect(stdout).to.match(/1 passing/);
      expect(stdout).to.match(/Done, without errors./);
      expect(stderr).to.equal('');
      done();
    });
  });
});

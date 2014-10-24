var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

describe('Home Page smoke test', function() {

    before(function() {

    });

    after(function() {
        return this.browser.quit();
    });

    beforeEach(function() {
        return this.browser.get("http://localhost:3000");
    });

    it('should have basic title', function() {
        return this.browser.title().should.become("Andrei Zharov :: Personal site");
    });
});
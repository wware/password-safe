var cipherutils = require("./cipherutils.js");

(function() {
    var key = "a";
    var plaintext = "abc";
    var ciphertext = "";
    var plainSetter = function(x) {
        plaintext = x;
    };
    var cipherSetter = function(x) {
        ciphertext = x;
    };
    var plainGetter = function(x) {
        return plaintext;
    };
    var cipherGetter = function(x) {
        return ciphertext;
    };
    var keyGetter = function(x) {
        return key;
    };
    var threeStrikes = function() {
        throw "yikes";
    };
    var assertEquals = function(x, y) {
        if (x !== y) {
            throw "Failed assertion: " + x + " === " + y;
        }
    };
    var csync = cipherutils.CryptoSynchronizer(
        plainSetter, plainGetter,
        cipherSetter, cipherGetter,
        keyGetter,
        threeStrikes);
    csync.encrypt();
    assertEquals(ciphertext, "nop");
    plainSetter("");
    csync.decrypt();
    assertEquals(plaintext, "abc");
    key = "Z";
    csync.decrypt();
    csync.decrypt();
    try {
        csync.decrypt();
        throw "third bad decrypt should have failed";
    } catch (e) {
        assertEquals(e, "yikes");
    }
    key = "a";
    cipherSetter("xyz");
    csync.decrypt();
    assertEquals(plainGetter(), "klm");
})();

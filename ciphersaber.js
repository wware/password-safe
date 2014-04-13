if (typeof module !== 'undefined') {
    // dependency for node
    var cipherutils = require('./cipherutils.js');
}

var ciphersaber = ciphersaber ? ciphersaber : new function() {
    var pub = {};

    var _s;
    var numSetupLoops = 20;
    var saltLength = 10;

    var setup = function(key) {
        var i, j, k, x;
        _s = [];
        for (i = 0; i < 256; i++) {
            _s.push(i);
        }
        for (k = 0; k < numSetupLoops; k++) {
            for (i = j = 0; i < 256; i++) {
                j = (j + _s[i] + key.charCodeAt(i % key.length)) % 256;
                x = _s[i];
                _s[i] = _s[j];
                _s[j] = x;
            }
        }
    };

    var process = function(s) {
        var i = 0, j = 0, k = 0, t, s2 = '';
        for (k = 0; k < s.length; k++) {
            i = (i + 1) % 256;
            j = (j + _s[i]) % 256;
            t = _s[i];
            _s[i] = _s[j];
            _s[j] = t;
            t = (_s[i] + _s[j]) % 256;
            s2 += String.fromCharCode(t ^ s.charCodeAt(k));
        }
        return s2;
    };

    pub.encrypt = function(key, plaintext) {
        var salt = cipherutils.makeSalt(saltLength);
        setup(salt + key);
        return salt + process(plaintext);
    };

    pub.decrypt = function(key, s) {
        var salt = s.substring(0, saltLength);
        var ciphertext = s.substring(saltLength);
        setup(salt + key);
        return process(ciphertext);
    };

    return pub;
};

if (typeof module !== 'undefined') {
    // node.js require
    for (var key in ciphersaber) {
        module.exports[key] = ciphersaber[key];
    }
}

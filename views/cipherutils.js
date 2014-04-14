var cipherutils = cipherutils ? cipherutils : new function() {
    var pub = {};

    // 64 chars, excluding the easily-confused ones: O, I, l, 0, 1
    var charSet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz!@#$&+=23456789';

    var makeString = function(len, f) {
        var i, r = '';
        for (i = 0; i < len; i++) {
            r += f(i);
        }
        return r;
    };

    pub.makeSalt = function(len) {
        return makeString(len, function(i) {
            return String.fromCharCode(Math.floor(256 * Math.random()));
        });
    };

    var zeroString = makeString(function(i) {
        return String.fromCharCode(0);
    });

    pub.hash = function(cipher, pw) {
        return cipher.encrypt(pw, zeroString);
    };

    pub.confirmHash = function(cipher, pw, expected) {
        return expected && (cipher.decrypt(pw, expected) === zeroString);
    };

    // 22 chars => 128 bits of entropy
    // 16 chars => 96 bits of entropy
    // 11 chars => 64 bits of entropy
    pub.makePassword = function(len) {
        var i, s = '', n = charSet.length;
        for (i = 0; i < len; i++) {
            s += charSet[Math.floor(n * Math.random())];
        }
        return s;
    };

    return pub;
};

if (typeof module !== 'undefined') {
    // node.js require
    for (var key in cipherutils) {
        module.exports[key] = cipherutils[key];
    }
}

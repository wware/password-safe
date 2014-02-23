var ciphersaber = function() {
    var _s;
    var numSetupLoops = 20;
    var saltLength = 10;
    var digitSet = '0123456789';
    var charSet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz!@#$&' + digitSet;

    var makeString = function(f) {
        var i, r = '';
        for (i = 0; i < saltLength; i++) {
            r += f(i);
        }
        return r;
    };

    var makeSalt = function() {
        return makeString(function(i) {
            return String.fromCharCode(Math.floor(256 * Math.random()));
        });
    };

    var zeroString = makeString(function(i) {
        return String.fromCharCode(0);
    });

    var makePassword = function() {
        var entropyBits = 128;
        var i, s = '', n = charSet.length;
        var m = Math.ceil(entropyBits * Math.log(2) / Math.log(n));
        for (i = 0; i < m; i++) {
            s += charSet[Math.floor(n * Math.random())];
        }
        return s;
    };

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

    var encrypt = function(key, plaintext) {
        var salt = makeSalt();
        setup(salt + key);
        return salt + process(plaintext);
    };

    var decrypt = function(key, s) {
        var salt = s.substring(0, saltLength);
        var ciphertext = s.substring(saltLength);
        setup(salt + key);
        return process(ciphertext);
    };

    var hash = function(pw) {
   	    return encrypt(pw, zeroString);
    };

    var confirmHash = function(pw, expected) {
        return expected && (decrypt(pw, expected) === zeroString);
    };

    return {
        makePassword: makePassword,
        encrypt: encrypt,
        decrypt: decrypt,
        hash: hash,
        confirmHash: confirmHash
    };
};

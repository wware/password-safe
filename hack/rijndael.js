/*
 *  jsaes version 0.1  -  Copyright 2006 B. Poettering
 *
 *  This program is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU General Public License as
 *  published by the Free Software Foundation; either version 2 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
 *  02111-1307 USA
 */

/*
 * Adapted from https://code.google.com/p/js-mcrypt/source/browse/trunk/rijndael.js
 * Cipher-block chaining added, see
 * https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher-block_chaining_.28CBC.29
 *
 * This is a javascript implementation of the rijndael block cipher. Key lengths
 * of 128, 192 and 256 bits, and block lengths of 128, 192, and 256 bit in any
 * combination are supported.
 *
 * The well-functioning of the encryption/decryption routines has been
 * verified for different key lengths with the test vectors given in
 * FIPS-197, Appendix C.
 */

var rijndael = function () {
    var publicInterface = {};
    var BlockEncrypt = function (block, key) {
        block = CopyBlock(block);
        crypt(block, key, true);
        return block;
    };
    var BlockDecrypt = function (block, key) {
        block = CopyBlock(block);
        crypt(block, key, false);
        return block;
    };
    var CopyBlock = function (block) {
        var newblock = new Array(16);
        for (i = 0; i < 16; i++) {
            newblock[i] = block[i];
        }
        return newblock;
    };
    var ZeroBlock = function () {
        var block = new Array(16);
        for (i = 0; i < 16; i++) {
            block[i] = 0;
        }
        return block;
    };
    var XorBlock = function (blk1, blk2) {
        var block = new Array(16);
        for (i = 0; i < 16; i++) {
            block[i] = blk1[i] ^ blk2[i];
        }
        return block;
    };
    var StrBlock = function (str, n) {
        var block = new Array(16);
        for (i = 0; i < 16; i++) {
            block[i] = str.charCodeAt(n + i);
        }
        return block;
    };

    publicInterface.Encrypt = function (str, key) {
        var i, blk, previousBlock = null;
        var n = str.length;
        var numblocks = Math.floor((n - 1) / 16) + 2;
        for (i = n; i < 16 * numblocks; i++) {
            str += "\0";
        }
        var lst = [n];
        for (i = 0; i < numblocks; i++) {
            blk = StrBlock(str, i * 16);
            if (previousBlock !== null) {
                blk = XorBlock(blk, previousBlock);
            }
            blk = BlockEncrypt(blk, key);
            lst.push(blk);
            previousBlock = blk;
        }
        return lst;
    };
    publicInterface.Decrypt = function (lst, key) {
        var n = lst[0];
        var i, j, str = "",
            blk, nblk, previousBlock = null;
        var numblocks = lst.length - 1;
        for (i = 1; i <= numblocks; i++) {
            blk = nblk = lst[i];
            blk = BlockDecrypt(blk, key);
            if (previousBlock !== null) {
                blk = XorBlock(blk, previousBlock);
            }
            previousBlock = nblk;
            for (j = 0; j < 16; j++) {
                str += String.fromCharCode(blk[j]);
            }
        }
        for (i = n; i < str.length; i++) {
            if (str[i] !== "\0") {
                return "Decryption failure";
            }
        }
        return str.substr(0, n);
    };

    //private

    var sizes = [16, 24, 32];

    //key bytes	16,	24,	32		block bytes
    var rounds = [
        [10, 12, 14], //	16
        [12, 12, 14], //	24
        [14, 14, 14]
    ]; //	32

    var expandedKeys = {}; //object to keep keys we've already expanded in.

    var ExpandKey = function (key) {
        if (!expandedKeys[key]) {
            var kl = key.length,
                ks, Rcon = 1;
            ks = 15 << 5;
            keyA = new Array(ks);
            for (var i = 0; i < kl; i++)
            keyA[i] = key.charCodeAt(i);
            for (i = kl; i < ks; i += 4) {
                var temp = keyA.slice(i - 4, i);
                if (i % kl === 0) {
                    temp = [Sbox[temp[1]] ^ Rcon, Sbox[temp[2]],
                    Sbox[temp[3]], Sbox[temp[0]]];
                    if ((Rcon <<= 1) >= 256) Rcon ^= 0x11b;
                } else if ((kl > 24) && (i % kl == 16)) temp = [Sbox[temp[0]], Sbox[temp[1]],
                Sbox[temp[2]], Sbox[temp[3]]];
                for (var j = 0; j < 4; j++)
                keyA[i + j] = keyA[i + j - kl] ^ temp[j];
            }
            expandedKeys[key] = keyA;
        }
        return expandedKeys[key];
    };

    var crypt = function (block, key, encrypt) {
        var i, SRT;
        var bB = block.length;
        var kB = key.length;
        var bBi = 0;
        var kBi = 0;
        switch (bB) {
            case 32:
                bBi += 2;
                break;
            case 24:
                bBi++;
                break;
            case 16:
                break;
            default:
                throw 'rijndael: Unsupported block size: ' + block.length;
        }
        switch (kB) {
            case 32:
                kBi += 2;
                break;
            case 24:
                kBi++;
                break;
            case 16:
                break;
            default:
                throw 'rijndael: Unsupported key size: ' + key.length;
        }
        var r = rounds[bBi][kBi];
        key = ExpandKey(key);
        var end = r * bB;
        if (encrypt) {
            AddRoundKey(block, key.slice(0, bB));
            SRT = ShiftRowTab[bBi];
            for (i = bB; i < end; i += bB) {
                SubBytes(block, Sbox);
                ShiftRows(block, SRT);
                MixColumns(block);
                AddRoundKey(block, key.slice(i, i + bB));
            }
            SubBytes(block, Sbox);
            ShiftRows(block, SRT);
            AddRoundKey(block, key.slice(i, i + bB));
        } else { //decrypt
            AddRoundKey(block, key.slice(end, end + bB));
            SRT = ShiftRowTab_Inv[bBi];
            ShiftRows(block, SRT);
            SubBytes(block, Sbox_Inv);
            for (i = end - bB; i >= bB; i -= bB) {
                AddRoundKey(block, key.slice(i, i + bB));
                MixColumns_Inv(block);
                ShiftRows(block, SRT);
                SubBytes(block, Sbox_Inv);
            }
            AddRoundKey(block, key.slice(0, bB));
        }
    };

    /* The following lookup tables and functions are for internal use only! */
    var Sbox = new Array(99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171,
    118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253,
    147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154,
    7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227,
    47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170,
    251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245,
    188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61,
    100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224,
    50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213,
    78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221,
    116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29,
    158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161,
    137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22);
    //row	0	1	2	3		block Bytes
    var rowshifts = [
        [0, 1, 2, 3], //16
        [0, 1, 2, 3], //24
        [0, 1, 3, 4]
    ]; //32

    var i, j;
    var ShiftRowTab = Array(3);
    for (i = 0; i < 3; i++) {
        ShiftRowTab[i] = Array(sizes[i]);
        for (j = sizes[i]; j >= 0; j--)
        ShiftRowTab[i][j] = (j + (rowshifts[i][j & 3] << 2)) % sizes[i];
    }
    var Sbox_Inv = new Array(256);
    for (i = 0; i < 256; i++)
    Sbox_Inv[Sbox[i]] = i;
    var ShiftRowTab_Inv = Array(3);
    for (i = 0; i < 3; i++) {
        ShiftRowTab_Inv[i] = Array(sizes[i]);
        for (j = sizes[i]; j >= 0; j--)
        ShiftRowTab_Inv[i][ShiftRowTab[i][j]] = j;
    }
    var xtime = new Array(256);
    for (i = 0; i < 128; i++) {
        xtime[i] = i << 1;
        xtime[128 + i] = (i << 1) ^ 0x1b;
    }

    var SubBytes = function (state, sbox) {
        for (var i = state.length - 1; i >= 0; i--)
        state[i] = sbox[state[i]];
    };

    var AddRoundKey = function (state, rkey) {
        for (var i = state.length - 1; i >= 0; i--)
        state[i] ^= rkey[i];
    };

    var ShiftRows = function (state, shifttab) {
        var h = state.slice(0);
        for (var i = state.length - 1; i >= 0; i--)
        state[i] = h[shifttab[i]];
    };

    var MixColumns = function (state) {
        for (var i = state.length - 4; i >= 0; i -= 4) {
            var s0 = state[i + 0],
                s1 = state[i + 1];
            var s2 = state[i + 2],
                s3 = state[i + 3];
            var h = s0 ^ s1 ^ s2 ^ s3;
            state[i + 0] ^= h ^ xtime[s0 ^ s1];
            state[i + 1] ^= h ^ xtime[s1 ^ s2];
            state[i + 2] ^= h ^ xtime[s2 ^ s3];
            state[i + 3] ^= h ^ xtime[s3 ^ s0];
        }
    };

    var MixColumns_Inv = function (state) {
        for (var i = state.length - 4; i >= 0; i -= 4) {
            var s0 = state[i + 0],
                s1 = state[i + 1];
            var s2 = state[i + 2],
                s3 = state[i + 3];
            var h = s0 ^ s1 ^ s2 ^ s3;
            var xh = xtime[h];
            var h1 = xtime[xtime[xh ^ s0 ^ s2]] ^ h;
            var h2 = xtime[xtime[xh ^ s1 ^ s3]] ^ h;
            state[i + 0] ^= h1 ^ xtime[s0 ^ s1];
            state[i + 1] ^= h2 ^ xtime[s1 ^ s2];
            state[i + 2] ^= h1 ^ xtime[s2 ^ s3];
            state[i + 3] ^= h2 ^ xtime[s3 ^ s0];
        }
    };

    return publicInterface;
};

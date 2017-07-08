const CHROMECAST_URL = 'https://clients5.google.com/cast/chromecast/home';

const request = require('request');
const config = require('./config.json');

exports.parse = (callback) => {
    request({
        url: CHROMECAST_URL,
        headers: {
            cookie: config.googleCookies
        }
    }, (error, response, body) => {
        if (error) {
            callback(error, null);
            return;
        }

        let arrays = eval(body.match(/JSON\.parse\('.+?'\)/)[0])[0];

        let images = [];

        for (let array of arrays) {
            let image = {};

            if (array[8]) {
                if (array[8].length >= 1 && array[8][0]) {
                    image.title = array[8][0];
                }
            } else if (array[10]) {
                if (array[10].length >= 1 && array[10][0]) {
                    image.title = array[10][0];
                }
            }

            if (array[1]) {
                image.author = array[1];
            } else if (array[8]) {
                if (array[8].length >= 3 && array[8][2]) {
                    image.author = array[8][2];
                }
            } else if (array[10]) {
                if (array[10].length >= 3 && array[10][2]) {
                    image.author = array[10][2];
                }
            }

            if (array[26]) {
                if (array[26].length >= 1 && array[26][0][2]) {
                    image.category = array[26][0][2];
                }

                if (array[26].length >= 2 && array[26][1][2]) {
                    image.subCategory = array[26][1][2];
                }
            }

            if (array[8]) {
                if (array[8].length >= 2 && array[8][1]) {
                    image.subSubCategory = array[8][1];
                }
            } else if (array[10]) {
                if (array[10].length >= 2 && array[10][1]) {
                    image.subSubCategory = array[10][1];
                }
            }

            image.url = array[0].replace(/s\d+-w\d+-h\d+-/, 's%size-w%width-h%height-');

            if (array[9]) {
                image.pageUrl = array[9];
            }

            images.push(image);
        }

        callback(null, images);
    })
};

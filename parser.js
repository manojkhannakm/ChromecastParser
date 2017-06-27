'use strict';

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

        for (let i in arrays) {
            let array = arrays[i];

            let title, author, category, subCategory, subSubCategory, url, pageUrl;

            if (array[8] != null) {
                if (array[8].length >= 1) {
                    title = array[8][0];
                }
            } else if (array[10] != null) {
                if (array[10].length >= 1) {
                    title = array[10][0];
                }
            }

            if (array[1] != null) {
                author = array[1];
            } else if (array[8] != null) {
                if (array[8].length >= 3) {
                    author = array[8][2];
                }
            } else if (array[10] != null) {
                if (array[10].length >= 3) {
                    author = array[10][2];
                }
            }

            if (array[26] != null) {
                if (array[26].length >= 1) {
                    category = array[26][0][2];
                }

                if (array[26].length >= 2) {
                    subCategory = array[26][1][2];
                }
            }

            if (array[8] != null) {
                if (array[8].length >= 2) {
                    subSubCategory = array[8][1];
                }
            } else if (array[10] != null) {
                if (array[10].length >= 2) {
                    subSubCategory = array[10][1];
                }
            }

            url = array[0].replace(/s\d+-w\d+-h\d+-/, 's%size-w%width-h%height-');

            if (array[9] != null) {
                pageUrl = array[9];
            }

            let image = {};

            if (title != null && title.length > 0) {
                image.title = title;
            }

            if (author != null && author.length > 0) {
                image.author = author;
            }

            if (category != null && category.length > 0) {
                image.category = category;
            }

            if (subCategory != null && subCategory.length > 0) {
                image.subCategory = subCategory;
            }

            if (subSubCategory != null && subSubCategory.length > 0) {
                image.subSubCategory = subSubCategory;
            }

            if (url != null && url.length > 0) {
                image.url = url;
            }

            if (pageUrl != null && pageUrl.length > 0) {
                image.pageUrl = pageUrl;
            }

            images.push(image);
        }

        callback(null, images);
    })
};

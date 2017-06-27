'use strict';

const fs = require('fs');
const readline = require('readline');
const async = require('async');
const mkdirp = require('mkdirp');
const request = require('request');
const config = require('./config.json');
const parser = require('./parser.js');

process.stdout.write('Chromecast Parser\n\n');

let imagesFile = config.imagesFile,
        imagesFolder = config.imagesFolder,
        imagesSize = config.imagesSize;

let images = [];

async.series([
    (callback) => {
        process.stdout.write('Reading images file...');

        fs.readFile(imagesFile, (error, data) => {
            if (!error) {
                images = JSON.parse(data);

                process.stdout.write('Successful!\n');
                process.stdout.write('Read ' + images.length + ' image(s)!\n\n');
            } else {
                process.stdout.write('Failed!\n\n');
            }

            callback();
        });
    },
    (callback) => {
        let loop = true;

        let rl = readline.createInterface({
            input: process.stdin
        });
        rl.on('line', (line) => {
            loop = false;

            rl.close();
        });

        process.stdout.write('(Note: Press enter to stop)\n\n');

        let parseCount = 0;

        async.doWhilst((callback) => {
            parseCount++;

            process.stdout.write('#' + parseCount + '\n');
            process.stdout.write('Parsing images json...');

            parser.parse((error, tempImages) => {
                if (!error) {
                    let imageCount = 0;

                    for (let tempImage of tempImages) {
                        let addImage = true;

                        for (let image of images) {
                            if (tempImage.pageUrl == 'https://www.google.com/chromecast/backdrop/'
                                    || tempImage.pageUrl == 'https://www.google.com/culturalinstitute/project/art-project') {
                                if (tempImage.url == image.url) {
                                    addImage = false;
                                    break;
                                }
                            } else {
                                if (tempImage.pageUrl == image.pageUrl) {
                                    addImage = false;
                                    break;
                                }
                            }
                        }

                        if (addImage) {
                            images.push(tempImage);

                            imageCount++;
                        }
                    }

                    process.stdout.write('Successful!\n');
                    process.stdout.write('Parsed ' + imageCount + ' image(s)!\n\n');
                } else {
                    process.stdout.write('Failed!\n\n');
                }

                callback();
            });
        }, () => {
            return loop;
        }, (error) => {
            callback();
        });
    },
    (callback) => {
        process.stdout.write('Writing images file...');

        fs.writeFile(imagesFile, JSON.stringify(images, null, 4), (error) => {
            if (!error) {
                process.stdout.write('Successful!\n');
                process.stdout.write('Wrote ' + images.length + ' image(s)!\n\n');
            } else {
                process.stdout.write('Failed!\n\n');
            }

            callback();
        });
    },
    (callback) => {
        if (imagesFolder == null || imagesFolder == '') {
            return;
        }

        let imageWidth = 800, imageHeight = 600, imageSize = 800;

        if (imagesSize != null) {
            imageWidth = parseInt(imagesSize.split('x')[0]);
            imageHeight = parseInt(imagesSize.split('x')[1]);
            imageSize = Math.max(imageWidth, imageHeight);
        }

        let loop = true;

        let rl = readline.createInterface({
            input: process.stdin
        });
        rl.on('line', (line) => {
            loop = false;

            rl.close();
        });

        process.stdout.write('(Note: Press enter to stop)\n\n');

        let imageCount = 0;

        async.eachSeries(images, (image, callback) => {
            if (!loop) {
                callback();
                return;
            }

            imageCount++;

            let imageUrl = image.url.replace('%size', imageSize)
                    .replace('%width', imageWidth)
                    .replace('%height', imageHeight);

            let imageFolder = imagesFolder + '/';

            if (image.category != null) {
                imageFolder += image.category + '/';
            }

            mkdirp(imageFolder, (error) => {
                let imageFile = imageFolder + imageUrl.substring(imageUrl.lastIndexOf('/') + 1,
                        imageUrl.indexOf('=', imageUrl.lastIndexOf('/'))) + '.jpg';

                fs.access(imageFile, 'f', (error) => {
                    if (!error) {
                        callback();
                        return;
                    }

                    process.stdout.write('Downloading image ' + imageCount + ' of ' + images.length + '...');

                    request(imageUrl, (error, response, body) => {
                        if (!error && response.headers['content-type'].startsWith('image')) {
                            process.stdout.write('Successful!\n');
                        } else {
                            process.stdout.write('Failed!\n');
                        }

                        callback();
                    }).pipe(fs.createWriteStream(imageFile));
                });
            });
        }, (error) => {
            rl.close();

            callback();
        })
    }
]);

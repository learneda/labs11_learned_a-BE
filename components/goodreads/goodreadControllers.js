require('dotenv').config();
const cheerio = require('cheerio');
const axios = require('axios');
const db = require('../../dbConfig');
var books = require('google-books-search');


var xpath = require('xpath'),
  dom = require('xmldom').DOMParser;

module.exports = {
  async searchBooks(req, res, next) {
    if (req.body.q) {
      books.search(req.body.q, function(error, results) {
        if ( ! error ) {
            console.log(results);
            res.status(200).json(results)
        } else {
            console.log(error);
        }
      });
    } else {
      res.json({err: 'q required in body of post request'})
    }
  },
}



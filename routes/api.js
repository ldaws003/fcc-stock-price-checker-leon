/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const express     = require('express');
const bodyParser  = require('body-parser');
const fetch = require('node-fetch');
var StockHandler = require('../controllers/stockHandler.js');
var asyncMethod = require('async');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
  
  var stockGetter = new StockHandler();
  
  var stockInfo;
  
  var stockPriceChecker = function(stock, like, ip, callback){
    asyncMethod.series([
      function(callback){
        stockGetter.addStock(stock, callback);
      },
      function(callback){
        stockGetter.addLikes(stock, like, ip, callback);
      },
      function(callback){
        stockGetter.getJSON(stock, callback);
      }
    ], function(err, data){
      if(err) console.log(err);
      
      stockInfo = {stockData: data[2]}; 
      callback();
    });
      
  }
  

  app.route('/api/stock-prices')
    .get(async function (req, res){
      var like = req.query.like;
      var stock = req.query.stock;
      var ip = req.connection.remoteAddress;
    
      if(Array.isArray(stock)){
        stock.forEach((ele, i) => {
          stock[i] = stock[i].toUpperCase();
        });
      } else {
        stock = stock.toUpperCase();      
      }
    
    
    asyncMethod.series([
      function(callback){
        stockPriceChecker(stock, like, ip, callback);
      }, 
      function(callback){
        
        if(stockInfo.stockData.length === 1 ){
          stockInfo.stockData = stockInfo.stockData[0];
        }
        
        callback(null, 'send');
      }
    
    ], function(err, data){
      if(err) console.log(err);    
      if(data[1] === 'send'){
        if(Array.isArray(stockInfo.stockData)){
          stockInfo.stockData[0].rel_likes = stockGetter.getRelLikes(stockInfo.stockData[0], stockInfo.stockData[1]);
          stockInfo.stockData[1].rel_likes = stockGetter.getRelLikes(stockInfo.stockData[1], stockInfo.stockData[0]);
          delete stockInfo.stockData[0].likes;
          delete stockInfo.stockData[1].likes;
          res.json(stockInfo);
        } else {
          res.json(stockInfo);        
        }        
      }
    });
    
  });
    
}

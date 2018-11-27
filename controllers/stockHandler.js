'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const express     = require('express');
const bodyParser  = require('body-parser');
const fetch = require('node-fetch');
var app = express();
var asyncMethod = require('async');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const project = 'stockInfo';

function StockHandler() {
  
  this.addStock = function(stock, callback){
    
    var stockArr = [];
    
    if(Array.isArray(stock)){
      stock.forEach((ele) => stockArr.push(ele));    
    } else {
      stockArr.push(stock);
    }
    
    asyncMethod.each(stockArr, function(stocks, callback){
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project).findOne({stock: stocks}, function(err, data){
          if(err) console.log(err);
          if(!data){
            
            var saveObj = {
              stock: stocks,
              likes: 0,
              ip: []
            };
            db.collection(project).insertOne(saveObj, function(err, data){
              if(err) console.log(err);
              db.close();
              callback();
            });
          } else {
            callback();
          }
        });      
      });     
    
    }, function(err, data){
      if(err) console.log(err);
      callback();
    });  
  };
  
  this.addLikes = function(stock, likes, ip, callback){
    if(!likes) {callback(); return;}
    
    var stockArr = [];
    
    if(Array.isArray(stock)){
      stock.forEach((ele) => stockArr.push(ele));    
    } else {
      stockArr.push(stock);
    }
    
    asyncMethod.each(stockArr, function(likeUpdate, callback){
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) console.log(err);
        db.collection(project).findOne({stock: likeUpdate}, function(err, data){
          if(err) console.log(err);
          
          if(!data.ip.includes(ip)){
            db.collection(project).findOneAndUpdate(
              {stock: likeUpdate},
              {$inc: {likes: 1},
               $push: {ip: ip}},
              {new: true, upsert: true}, function(err, data){
                if(err) console.log(err);
                callback();
              });          
          } else {
            callback();
          }       
          
          
        });       
      
      });          
    }, function(err){
      if(err) console.log(err);
      callback();
    });
  
  };
  
  this.getRelLikes = function(obj1, obj2){
    return obj1.likes - obj2.likes;
  };
  
  this.fetchStockData = async function(stock){
    var uri = this.getUri(stock);
    var response = await fetch(uri);
    var data = await response.json();
    return data.latestPrice;    
  };
    
  this.getUri = function(stock){
    return   "https://api.iextrading.com/1.0/stock/"+stock+"/quote";
  };
  
  this.getJSON = function(stock, callback){
    
    var stockArr = [];
    
    if(Array.isArray(stock)){
      stock.forEach((ele) => stockArr.push(ele));    
    } else {
      stockArr.push(stock);
    }
    
    var stockInfo = [];
    
    //creat an objecf with the latest price inside
    
    //create code to get the data from database + outside api
    asyncMethod.each(stockArr, function(stocks, callback){
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) console.log(err);
        db.collection(project).findOne({stock: stocks}, async function(err, data){
          if(err) console.log(err);
          
          
          var latestPrice = await this.fetchStockData(data.stock);
          
          stockInfo.push(JSON.parse(JSON.stringify({stock: data.stock,
                                                    likes: data.likes,
                                                    price: String(latestPrice)})));
          
          
          
          db.close();
          callback();
        }.bind(this));       
      
      }.bind(this));          
    }.bind(this), function(err){
      if(err) console.log(err);
      callback(null, stockInfo);
    });
    
   // return stockInfo;    
  };

};

module.exports = StockHandler;
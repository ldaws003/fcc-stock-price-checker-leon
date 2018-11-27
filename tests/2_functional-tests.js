/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
         
          assert.equal(res.body.stockData.stock, 'GOOG');

          assert.isString(res.body.stockData.price);
          console.log('type of likes : ', typeof res.body.stockData.likes);
          assert.typeOf(res.body.stockData.likes, 'number');
         
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
          
          assert.equal(res.body.stockData.stock, 'GOOG');

          assert.isString(res.body.stockData.price);

          assert.isAbove(res.body.stockData.price, 0);
         
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
          

          assert.equal(res.body.stockData.stock, 'GOOG');
         
          assert.isString(res.body.stockData.price);          
         
          assert.isAbove(res.body.stockData.likes, 0);
     
          assert.equal(res.body.stockData.likes, 1);
         
          done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft'], like: true})
        .end(function(err, res){
                             
          
          assert.isArray(res.body.stockData);
          
          
          res.body.stockData.forEach((ele, i) => {
            assert.isString(ele.price);
          });
     
          res.body.stockData.forEach((ele, i) => {
            assert.notProperty(ele, 'likes');
          });
    
          res.body.stockData.forEach((ele, i) => {
            assert.typeOf(ele.rel_likes, 'number');
          });
         
          done();
        });
        
      });
      
      test('2 stocks with like', function(done) {
        
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft'], like: true})
        .end(function(err, res){
          
          
          assert.isArray(res.body.stockData);


          res.body.stockData.forEach((ele, i) => {
            assert.isString(ele.price);
          });

          res.body.stockData.forEach((ele, i) => {
            assert.notProperty(ele, 'likes');
          });

          res.body.stockData.forEach((ele, i) => {
            assert.typeOf(ele.rel_likes, 'number');
          });
          
          res.body.stockData.forEach((ele,i) => {
            assert.equal(ele.rel_likes, 0);
          });
         
          done();
        });
        
      });
      
    });

});

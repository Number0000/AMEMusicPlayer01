/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global local */

(function(exports){
    
    var WordCache = function(){
        this.cachedwords = [];
        this.queue = [];
        this.data = JSON.parse(localStorage.getItem('wordcache') || '{}');
        this.listeners = [];
    };
    
    WordCache.prototype.pop = function(){
        if (this.queue.length === 0) {
            return null;
        }
        
        var item = this.queue[0];
        this.queue.splice(0, 1);
        return item;
    };
    WordCache.prototype.saveCache = function() {
        local.Storage.setItem('wordcache', JSON.stringify(this.data));
    };
    
    WordCache.prototype.store = function (word,data){
        console.log('store',word, data);
        if (this.cachedwords.indexOf(word) === -1){
            this.cachedwords.push(word);
        }
        var idx = this.queue.indexOf(word);
        if (idx !== -1){
            this.queue.splice(idx, 1);
        }
        this.data[word] = data;
        this.callFulfilledListListeners();
        this.saveCache();
    };
    
    WordCache.prototype.callFulfilledListListeners = function(){
        console.log('callFulfilledListListeners', this.listeners);
        //callback(words)
        var _this= this;
        this.listeners.forEach(function(item){
            console.log('check listener', item);
            
            var anymissing = false;
            var result = [];
            for (var i = 0; i < item.words.length; i++){
                var word = item.words[i];
                var worddata = _this.data[word];
                result[i] = worddata;
                if (typeof(worddata) === 'undefined'){
                    anymissing = true;
                }
            }
            
            if(!anymissing){
                if(!item.fulfilled){
                    console.log('we can proceed', item, result);
                    item.fulfilled = true;
                    item.callback(result);
                }
            }
        });
        this.listeners = this.listeners.filter(function(item){
            return !item.fulfilled;
        });
    };
    WordCache.prototype.lookupWords = function(words, callback){
        var _this = this;
        words.forEach(function(word){
            if(_this.queue.indexOf(word) === -1 &&
                _this.cachewords.indexOf(word) === -1 &&
                typeof(_this.data[word]) === 'undefined'){
                        _this.queue.push(word);
                    }
        });
        this.listeners.push({
            words: words,
            fulfilled: false,
            callback: callback 
        });
        this.callFulfilledListListeners();
    }
    
    exports.WordCache = WordCache;
    
})(window);



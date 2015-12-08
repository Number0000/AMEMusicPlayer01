/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global defaultValue, value */

var FuzzySet = function (arr,useOutstanding, gramSizeLower, gramSizeUpper){
    var fuzzyset = {
        version: '0.0.1'
    };
    
    //default options
    arr = arr || [];
    fuzzyset.gramSizeLower = gramSizeLower || 2;
    fuzzyset.gramSizeUpper = gramSizeUpper || 3;
    fuzzyset.useOutstanding = useOutstanding || true;
    
    //define all objects functions and attibutes
    fuzzyset.exactSet = {};
    fuzzyset.matchDict = {};
    fuzzyset.items = {};
    
    //helper functions
    var Outstanding = function (str1, str2){
        var current = [], prev, value;
        
        for (var i = 0; i <= str2.length; i++){
            for (var j = 0; j <= str1.length; j++){
                if(i && j){
                    if(str1.charAt(j -1) === str2.charAt(i - 1)){
                        value = prev;
                    } else {
                        value = i + j;
                    }}
            }
            prev = current [j];
            current[j] = value;
        }
    return current.pop();
    };
    
    //return an edit distance from 0 to 1
    var _distance = function (str1, str2){
        if(str1 === null && str2 === null) throw 'Trying to compare two null values';
        if(str1 === null || str2 === null) throw 0;
        str1 = String(str1);
        str2 = String(str2);
        
        var distance = Outstanding(str1, str2);
        if(str1.length > str2.length){
            return 1 - distance / str1.length;
        } else {
            return 1 - distance / str2.length;
        }
    };
    
    var _nonWordRe = /[^\w, ]+/;
    
    var _iterateGrams = function(value, gramSize){
        gramSize = gramSize || 2;
        var simplified = '-' + value.toLowerCase().replace(_nonWordRe, '') + '-',
                lenDiff = gramSize - simplified.length,
                results = [];
            if (lenDiff > 0){
                for(var i = 0; i<lenDiff; ++i){
                    value += '-';
                }
            }
            for (var i = 0; i< simplified.length -gramSize + 1; ++i){
                results. push(simplified.slice(i, i + gramSize));
            }
            return results;
    };
    
    var _gramCounter = function(value, gramSize){
        gramSize = gramSize || 2;
        var result = {},
            grams = _iterateGrams(value, gramSize),
            i = 0;
        for (i; i< grams.length; ++i){
            if(grams[i] in result) {
                result[grams[i]] += 1;
            } else {
                result[grams[i]] = 1;
            }
        }
        return result;
    };
    
    //-----------------------------------------------------
    //IMPORTANT PLACE TO CHANGE
    //-----------------------------------------------------
    //MAIN FUNCTIONS
    fuzzyset.get = fuction(value, defaultValue); {
        var result = this._get(value);
        if (!result && defaultValue){
            return defaultValue;
        }
        return result;
    };
    
    fuzzyset._get = function(value){
        var normalizedValue = this._normalizedStr(value),
                result = this.exactSet[normalizedValue];
        if(result){
            return [[1,result]];
        }
        var result = [];
        for (var gramSize = this.gramSizeUpper; gramSize > gramSizeLower; --gramSize){
            results = this._get(value, gramSize);
            if(results){
                return results;
            }
        }
        return null;
    };
    
    fuzzyset._get = function(value,gramSize){
        var normalizedValue = this.normalizeStr(value),
                matches = {},
                gramCounts = _gramCounter(normalizedValue, gramSize),
                items = this.items[gramSize],
                sumOfSquareGramCounts = 0,
                gram,
                gramCount,
                i,
                index,
                otherGramCount;
        
        for(gram in gramCounts){
            gramCount = gramCounts [gram];
            sumOfSquareGramCounts += Math.pow(gramCount, 2);
            if (gram in this.matchDict){
                for(i = 0; i < this.matchDict[gram].length; ++i) {
                    index = this.matchDict[gram][i][0];
                    otherGramCount = this.matchDict[gram][i][1];
                    if(index in matches){
                        matches[index] += gramCount * otherGramCount;
                    } else {
                        matches[index] = gramCount * otherGramCount;
                    }
                }
            }
        }
        
        function isEmptyObject(obj){
            for(var prop in obj){
                if(obj.hasOwnProperty(prop)){
                    return false;
                } else {
                return true;
                }
            }
        }
        
        if(isEmptyObject(matches)){
            return null;
        }
        
        var vectorNormal = Math.sqrt(sumOfSquareGramCounts),
                result = [],
                matchScore;
        //build a results list of [score, str]
        for(var matchIndex in matches) {
            matchScore = matches[matchIndex];
            results.push([matchScore / (vectorNormal * items[matchIndex][0]),
                items[matchIndex][1]]);
        }
        
        var sortDecending = function(a, b){
            if (a[0] < b[0]){
                return 1;
            } else if (a[0] > b[0]){
                return -1;
            } else {
                return 0;
            }
        };
        results.sort(sortDecending);
        if (this.useOutstanding) {
            var newResults = [],
                    endIndex = Math.min(50, results.length);
            //truncate somewhat arbitrarily to 50
            for (var i = 0; i < endIndex; ++i) {
                newResults.push([_distance(result[i][1], normalizedValue), results[i][1]]);
            }
            results = newResults;
            results.sort(sortDecending);
        }
        var newResults = [];
        for (var i = 0; i < results.length; ++i) {
            if (results[i][0] === results[0][0]){
                newResults.push([results[i][0], this.exactSet[i][1]]);
            }
        }
        return newResults;
    };
    fuzzyset.add = function (value){
        var normalizedValue = this.normalizeStr(value);
        if (normalizedValue in this.exactSet){
            return false;
        }
        
        var i = this.gramSizeLower;
        for (i; i < this.gramSizeUpper + 1; ++i){
            this._add(value, i);
        }
    };
    
    fuzzyset._add = function(value, gramSize){
        var normalizedValue = this.__normalizeStr(value),
                items = this.items[gramSize] || [],
                index = items.length;
        
        items.push(0);
        var gramCounts = _gramCounter(normalizedValue, gramSize),
                sumOfSquareGramCounts = 0,
                gram, gramCount;
        for (var gram in gramCounts){
            gramCount = gramCounts[gram];
            sumOfSquareGramCounts += Math.pow(gramCount, 2);
            if (gram in this.matchDict){
                this.matchDict[gram].push([index, gramCount]);
            } else {
                this.matchDict[gram] = [[index, gramCount]];
            }
        }
        var vectorNormal = Math.sqrt(sumOfSquareGramCounts);
        items[index] = [vectorNormal, normalizedValue];
        this.items[gramSize] = items;
        this.exactSet[normalizedValue] = value;
    };
    
    fuzzyset.normalizeStr = function (str){
        if (Object.prototype.toString.call(str) !== 'object String') throw 'Must use a string as argument to FuzzySet functions';
        return str.toLowerCase();
    };
    
    //return length of items in set
    fuzzyset.length = function(){
        var count = 0,
            prop;
            for(prop in this.exactSet) {
                if(this.exactSet.hasOwnProperty(prop)){
                    count +=1;
                }
            }
            return count;
    };
    
    //return set is empty
    fuzzyset.isEmpty = function(){
        for(var prop in this.exactSet){
            if (this.exactSet.hasOwnProperty(prop)){
                return false;
            }
        }
        return true;
    };
    
    //return list of values loaded into set
    fuzzyset.values = function(){
        var values = [],
                prop;
        for (prop in this.exactSet){
            if(this.exactSet.hasOwnProperty(prop)){
                values.push(this.exactSet[prop]);
            }
        }
        return values;
    };
    
    //initialization
    var i = fuzzyset.gramSizeLower;
    for (i; i < fuzzyset.gramSizeUpper + 1; ++i){
        fuzzyset.items[i] = [];
    }
    
    //add all the items to the set
    for (i = 0; i < arr.length; ++i){
        fuzzyset.add(arr[i]);
    }
    
    return fuzzyset;      
};


(function (global) {

/**************************
* Puzzle Main Programme
***************************/

function Puzzle ($div ,scale) {
    this.$div = $div;
    this.scale = scale;
    this.init(scale);
}

Puzzle.prototype = {
    constructor: Puzzle,
    $div: null,
    scale: null,
    matrix: null,
    initSerial: null,
    
    init: function (scale) {
        this._initMatrix(scale);
        this.initSerial = this._getRandomSerial(scale);
        var index = 0;
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                this.matrix[i][j] = new Block(this, this.initSerial[index], i, j);
                index++;
            }
        }
        this.checkVic();
    },

    reset: function (num) {
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                this.matrix[i][j].remove();
                this.matrix[i][j] = null;
            }
        }
        if (num && num > 0) {
            num = parseInt(num);
            this.scale = num;
        }
        this.init(this.scale);
    },

    revert: function () {
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                this.matrix[i][j].remove();
                this.matrix[i][j] = null;
            }
        }
        var index = 0;
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                this.matrix[i][j] = new Block(this, this.initSerial[index], i, j);
                index++;
            }
        }
        this.checkVic();
    },
    
    _initMatrix: function (s) {
        var matrix = [];
        for (var i = 0; i < s; i++) {
            matrix[i] = [];
            for (var j = 0; j < s; j++) {
                matrix[i][j] = null;
            }
        }
        this.matrix = matrix;
    },
    
    _getRandomSerial: function (scale) {
        var initSerial = [];
        for (var s = 0, sMax = scale * scale; s < sMax; s++) {
            initSerial[s] = s;
        }
        for (var i = initSerial.length - 1; i > 0; i--) {
            var randomIndex = parseInt(Math.random() * i);  //in this case a random serial must can be solved
            //var randomIndex = Math.round(Math.random() * i);
            var temp = initSerial[i];
            initSerial[i] = initSerial[randomIndex];
            initSerial[randomIndex] = temp;
        }
        //return [4, 7, 0, 6, 3, 2, 8, 5, 1]; // debug
        return initSerial;
    },

    getCurrentSerial: function () {
        var arr = [];
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                arr.push(this.matrix[i][j].index);
            }
        }
        //arr["scale"] = this.scale;
        return arr;
    },

    getBlockByPositionNum: function (num) {
        var x, y;
        x = Math.floor(num / this.scale);
        y = num - x * this.scale;
        return this.matrix[x][y];
    },
    
    _debug: function () {
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                try {
                    console.log(this.matrix[i][j].index + ":" + "x:" + this.matrix[i][j].x + "y:" + this.matrix[i][j].y);
                } catch(e) {
                    console.log(e);
                }
            }
        }
    },
    
    _cheat: function (a, b) {
        var blockA, blockB;
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                if (this.matrix[i][j].index == a) {
                    blockA = this.matrix[i][j];
                    if (blockB) break;
                    continue;
                }
                if (this.matrix[i][j].index == b) {
                    blockB = this.matrix[i][j];
                    if (blockA) break;
                }
            }
        }
        this._swap(blockA.x, blockA.y, blockB.x, blockB.y);
    },
    
    _swap: function (x1, y1, x2, y2) {
        var temp;
        this.matrix[x1][y1].move(x2, y2);
        this.matrix[x2][y2].move(x1, y1);
        temp = this.matrix[x1][y1];
        this.matrix[x1][y1] = this.matrix[x2][y2];
        this.matrix[x2][y2] = temp;
        this.checkVic();
    },
    
    pushBlock: function (block) {
        var x, y, temp;
        if ($.isNumeric(block)) {
            block = this._convertNumToBlock(block);
            if (!block) return false;
        }
        x = block.x;
        y = block.y;
        if (this.matrix[x - 1] && this.matrix[x - 1][y].index === 0) {
            this._swap(x - 1, y, x, y);
            return true;
        }
        if (this.matrix[x + 1] && this.matrix[x + 1][y].index === 0) {
            this._swap(x + 1, y, x, y);
            return true;
        }
        if (this.matrix[x][y + 1] && this.matrix[x][y + 1].index === 0) {
            this._swap(x, y + 1, x, y);
            return true;
        }
        if (this.matrix[x][y - 1] && this.matrix[x][y - 1].index === 0) {
            this._swap(x, y - 1, x, y);
            return true;
        }
        return false;
    },
    
    _convertNumToBlock: function (num) {
        var block;
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                if (this.matrix[i][j].index == num) {
                    block = this.matrix[i][j];
                    return block;
                }
            }
        }
        return null;
    },
    
    checkVic: function () {
        var step = 1,
            overflow = this.scale * this.scale;
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                if (this.matrix[i][j].index !== step) {
                    return false;
                }
                step++;
                if (step >= overflow) {
                    setTimeout(function () {
                        alert("Congratulations!");
                    }, 500);
                }
            }
        }
    }
}

function Block (puzzle, index, x, y) {
    this.init(puzzle, index, x, y);
}

Block.prototype = {
    constructor: Block,
    $div: null,
    x: null,
    y: null,
    index: null,
    
    init: function (puzzle, index, x, y) {
        var that = this;
        this.x = x;
        this.y = y;
        this.index = index;
        if (index) {
            this.$div = $("<div>" + index + "</div>").addClass("block").css({
                "top": x * 100,
                "left": y * 100
            }).appendTo(puzzle.$div);
            this.$div.click(function () {
                puzzle.pushBlock(that);
            });
        }
    },
    
    move: function (x, y) {
        this.x = x;
        this.y = y;
        if (!this.$div) return false;
        this.$div.animate({
            "top": x * 100,
            "left": y * 100
        }, 300);
        return true;
    },

    remove: function () {
        if (this.$div) this.$div.remove();
    }
};

global.Puzzle = Puzzle;

/**************************
* Puzzle Solution
***************************/

function solve (method, arr, scale) {
    var startTime, endTime, solution, result;
    if (!scale) {
        if (arr["scale"]) {
            scale = arr["scale"];
        } else {
            scale = 3;
        }
    }
    startTime = ( new Date() ).valueOf();
    solution = method(arr, scale);
    endTime = ( new Date() ).valueOf();
    if (solution == null) {
        console.log('No solution!');
        return null;
    }
    result = {
        "solution": solution,
        "elapsedTime": endTime - startTime
    };
    console.log(result);
    return result;
}

//Algorithms

var solutionMethods = {

"BFS": function (arr, scale) {
    function _swap (ar, a, b) {
        var narr = ar.slice(0);
        var temp = narr[a];
        narr[a] = narr[b];
        narr[b] = temp;
        return narr;
    }

    function _getBlankIndex(ar) {
        var i;
        for (i = 0; i < ar.length; i++) {
            if (ar[i] == 0) break;
        }
        return i;
    }

    function _getMovableIndex (ar, i, scale) {
        var result = [],
            max = scale * scale;
        
        //   N
        // W 0 E
        //   S      W->E->N->S
        if ( (i - 1 >= 0) && (i / scale - parseInt(i / scale) != 0) ) result.push(i - 1);
        if ( (i + 1 < max) && ( (i + 1) / scale - parseInt( (i + 1) / scale ) != 0) ) result.push(i + 1);
        if (i - scale >= 0) result.push(i - scale);
        if (i + scale < max) result.push(i + scale);
        return result;
    }

    function _checkResult (a) {
        for (var i = 0; i < a.length - 1; i++) {
            if (a[i] != i + 1) return false;
        }
        return true;
    }

    function _Tree (a, parent, i, level, root) {
        this.a = a;
        this.parent = parent || null;
        this.root = root || this;
        this.leftChild = null;
        this.rightChild = null;
        if (i || i === 0) {
            this.i = i;
        } else {
            this.i = null;
        }
        if (level) {
            this.level = level;
            if (!this.root.levels[level]) {
                this.root.levels[level] = [];
            }
            this.root.levels[level].push(this);
        } else {
            this.level = 0;
            this.levels = [];
            this.levels[0] = [];
            this.levels[0].push(this);
        }

        //this.children = {};
    }
    _Tree.prototype.append = function (a, i) {
        //search the tree if this node already exists in the tree
        var searchResult = this.root.find(a);
        if (searchResult[0] == 0) return false;

        var level = this.level + 1;
        var tree = new _Tree(a, this, i, level, this.root);
        //this.children[i] = tree;
        if (searchResult[0] == 1) {
            searchResult[1].leftChild = tree;
        } else if (searchResult[0] == 2) {
            searchResult[1].rightChild = tree;
        }

        return tree;
    };
    _Tree.prototype.find = function (a) {
        var result;
        for (var k = 0; k < this.a.length; k++) {
            if (a[k] < this.a[k]) {
                if (this.leftChild) {
                    return this.leftChild.find(a);
                } else {
                    return [1, this];
                }
            } else if (a[k] > this.a[k]) {
                if (this.rightChild) {
                    return this.rightChild.find(a);
                } else {
                    return [2, this];
                }
            } else {  // a[k] == this.a[k]
                continue;
            }
        }
        if (!result) return [0, this];
        return result;
    };

    var result = [], endFlag = false, l = 0;
    if (_checkResult(arr)) return result;

    //debug use
    // var ddd = _getBlankIndex([2, 3, 6, 1, 5, 0, 4, 7, 8]);
    // console.log(ddd);
    // console.log(_getMovableIndex([2, 3, 6, 1, 5, 0, 4, 7, 8], ddd, 3));

    //check whether there is answer or not
    //check odd-even
    var S = 0,
        gxSum = (scale * scale - 1) * (scale * scale - 2) / 2,
        oddEvenFlag = (gxSum & 1) ? 1 : 0;
    for (var g = 0; g < arr.length; g++) {
        for (var h = 0; h < g; h++) {
            if (arr[h] == 0) continue;
            if (arr[h] < arr[g]) S++;
        }
    }
    if (oddEvenFlag) {
        if (!(S & 1)) return null;
    } else {
        if (S & 1) return null;
    }
    
    var t = new _Tree(arr);
    var c = 0;
    while (l < 1000) {
        if (!t.levels[l]) return null;
        for (var n = 0; n < t.levels[l].length; n++) {
            var blank = _getBlankIndex(t.levels[l][n].a);
            var routes = _getMovableIndex(t.levels[l][n].a, blank, scale);
            for (var k = 0; k < routes.length; k++) {
                var newArr = _swap(t.levels[l][n].a, routes[k], blank);
                if (_checkResult(newArr)) {
                    c++;
                    result.push(routes[k]);
                    var pNode = t.levels[l][n];
                    while (pNode.parent) {
                        result.push(pNode.i);
                        pNode = pNode.parent;
                    }
                    endFlag = true;
                    break;
                }
                if (t.levels[l][n].append(newArr, routes[k])) c++;
            }
            if (endFlag) break;
        }
        if (endFlag) break;
        l++;
    }
    console.log(c + " cases are searched.");
    console.log(result);
    if (l >= 1000) {
        alert("BFS costet too long time and should be paused.");
        return [];
    }
    return result;
},

//not implemented yet
// "BFS_improved": function (arr, scale) {
//     return null;
// },

//A*
"A_Star": function (arr, scale) {
    function _swap (ar, a, b) {
        var narr = ar.slice(0);
        var temp = narr[a];
        narr[a] = narr[b];
        narr[b] = temp;
        return narr;
    }

    function _getBlankIndex(ar) {
        var i;
        for (i = 0; i < ar.length; i++) {
            if (ar[i] == 0) break;
        }
        return i;
    }

    function _getMovableIndex (ar, i, scale) {
        var result = [],
            max = scale * scale;
        if ( (i - 1 >= 0) && (i / scale - parseInt(i / scale) != 0) ) result.push(i - 1);
        if ( (i + 1 < max) && ( (i + 1) / scale - parseInt( (i + 1) / scale ) != 0) ) result.push(i + 1);
        if (i - scale >= 0) result.push(i - scale);
        if (i + scale < max) result.push(i + scale);
        return result;
    }

    function _checkResult (a) {
        for (var i = 0; i < a.length - 1; i++) {
            if (a[i] != i + 1) return false;
        }
        return true;
    }

    function Tree (arr, parent, i, s, root) {
        this.a = arr;
        this.p = parent || null;
        if (i || i === 0) {
            this.i = i;
        } else {
            this.i = null;
        }
        this.s = s || 0;
        this.r = root || this;
        this.pr = this.getPriority();
    }
    Tree.prototype.append = function (arr, i) {
        var node;
        node = new Tree(arr, this, i, this.s + 1, this.r);
        return node;
    };
    Tree.prototype.clearMem = function () {
        delete this.a;
        delete this.s;
        delete this.pr;
    };
    Tree.prototype.getPriority = function () {
        var f, g, h, k;
        //if (!this.a) return Infinity;
        g = this.s;
        h = 0;
        //k = scale * scale * 9;
        for (var i = 0; i < this.a.length; i++) {
            h += getManhattanDistance(i, this.a[i], scale);
        }
        return (h * 2 + g); 
        //return (h * 3 + g); //the most optimized g/h when scale3
    };
    var getManhattanDistance = function (i, index, scale) {
        var x, y, x0, y0;
        if (index == 0) {
            return 0;
        } else {
            index--;
        }
        x = parseInt(index / scale);
        y = index - x * scale;
        x0 = parseInt(i / scale);
        y0 = i - x0 * scale;
        return ( Math.abs(x- x0) + Math.abs(y - y0) );
    };

    function CaseHashTable () {
        this.length = 0;
    }
    CaseHashTable.prototype.insert = function (input) {
        var hash;
        if (typeof input == "number") {
            hash = input;
        } else {
            hash = this.getHash(input);
        }
        if (this.find(hash)) {
            return false;
        } else {
            this[hash] = 1;
            return true;
        }
    };
    CaseHashTable.prototype.find = function (s) {
        var hash;
        if (typeof s == "number") {
            hash = s;
        } else {
            hash = this.getHash(s);
        }
        if (this[hash]) {
            return true;
        } else {
            return false;
        }
    };
    //Cantor expansion
    CaseHashTable.prototype.getHash = function (arr) {
        var hash = 0, count;
        for (var i = arr.length - 1; i >= 0; i--) {
            count = 0;
            for (var j = 0; j < i; j++) {
                if (arr[j] > arr[i]) count++;
            }
            hash += fac(i) * count;
        }
        //var hash = arr.toString();
        return hash;
    };
    var fac = function (num) {
        if (num === 0) {
            return 1;
        } else {
            return num * fac (num - 1);
        }
    };

    function PQueue () {
        this.heap = [];
    }
    PQueue.prototype.getSize = function () {
        return this.heap.length;
    };
    PQueue.prototype.deleteMax = function () {
        var ele, last, minChild, minChildP, lastP, leftChildP, rightChildP,
            size = this.getSize();
            i = 0;
        if (size <= 0) {
            return null;
        }
        ele = this.heap[0];
        last = this.heap.pop();
        size --;
        if (size == 0) {
            return ele;
        }
        lastP = last.pr;
        while (i < size) {
            if (2 * i + 1 >= size) {
                this.heap[i] = last;
                return ele;
            } else {
                if (2 * i + 2 >= size) {
                    minChild = 2 * i + 1;
                    minChildP = this.heap[minChild].pr;
                } else {
                    leftChildP = this.heap[2 * i + 1].pr;
                    rightChildP = this.heap[2 * i + 2].pr;
                    if (leftChildP < rightChildP) {
                        minChild = 2 * i + 1;
                        minChildP = leftChildP;
                    } else {
                        minChild = 2 * i + 2;
                        minChildP = rightChildP;
                    }
                }
                if (lastP < minChildP) {
                    this.heap[i] = last;
                    return ele;
                } else {
                    this.heap[i] = this.heap[minChild];
                    i = minChild;
                }
            }
        }
        console.log('heap error');
        return null;
    };
    PQueue.prototype.insert = function (ele) {
        var temp,
            i = this.getSize(),
            eleP = ele.pr;
        while (i > 0) {
            temp = parseInt((i - 1) / 2);
            if (eleP >= this.heap[temp].pr) {
                this.heap[i] = ele;
                return true;
            }
            this.heap[i] = this.heap[temp];
            i = temp;
        }
        if (i == 0) {
            this.heap[i] = ele;
            return true;
        }
        return false;
    };

    var result = [],
        endFlag = false;
    if (_checkResult(arr)) return result;

    //check whether there is answer or not
    //check odd-even
    var S = 0,
        gxSum = (scale * scale - 1) * (scale * scale - 2) / 2,
        oddEvenFlag = (gxSum & 1) ? 1 : 0;
    for (var v = 0; v < arr.length; v++) {
        for (var w = 0; w < v; w++) {
            if (arr[w] == 0) continue;
            if (arr[w] < arr[v]) S++;
        }
    }
    if (oddEvenFlag) {
        if (!(S & 1)) return null;
    } else {
        if (S & 1) return null;
    }

    var caseTree = new Tree(arr),
        caseHash = new CaseHashTable(),
        pQ = new PQueue(),
        c = 0;
    
    pQ.insert(caseTree);

    while (pQ.getSize()) {
        var currentCaseTN = pQ.deleteMax();
        var blank = _getBlankIndex(currentCaseTN.a);
        var routes = _getMovableIndex(currentCaseTN.a, blank, scale);
        for (var l = 0; l < routes.length; l++) {
            var newArr = _swap(currentCaseTN.a, routes[l], blank);

            var hash = caseHash.getHash(newArr);
            if (caseHash.find(hash)) {
                continue;
            }
            c++;

            if (_checkResult(newArr)) {
                result.push(routes[l]);
                var pNode = currentCaseTN;
                while (pNode.p) {
                    result.push(pNode.i);
                    pNode = pNode.p;
                }
                endFlag = true;
                break;
            }

            caseHash.insert(hash);
            var newTreeNode = currentCaseTN.append(newArr, routes[l]);
            pQ.insert(newTreeNode);
        }
        if (endFlag) break;
        currentCaseTN.clearMem();
    }
    console.log(c + " cases are searched.");
    console.log(result);
    return result;
},

//IDA*
"IDA*": function (arr, scale) {
    var result = [],
        endFlag = false;

    function _swap (ar, a, b) {
        var narr = ar.slice(0);
        var temp = narr[a];
        narr[a] = narr[b];
        narr[b] = temp;
        return narr;
    }

    function _getBlankIndex (ar) {
        var i;
        for (i = 0; i < ar.length; i++) {
            if (ar[i] == 0) break;
        }
        return i;
    }

    function _getMovableIndex (ar, i, scale) {
        var result = [],
            max = scale * scale;
        if ( (i - 1 >= 0) && (i / scale - parseInt(i / scale) != 0) ) result.push(i - 1);
        if ( (i + 1 < max) && ( (i + 1) / scale - parseInt( (i + 1) / scale ) != 0) ) result.push(i + 1);
        if (i - scale >= 0) result.push(i - scale);
        if (i + scale < max) result.push(i + scale);
        return result;
    }

    function getManhattanDistance (i, index, scale) {
        var x, y, x0, y0;
        if (index == 0) {
            return 0;
        } else {
            index--;
        }
        x = parseInt(index / scale);
        y = index - x * scale;
        x0 = parseInt(i / scale);
        y0 = i - x0 * scale;
        return ( Math.abs(x- x0) + Math.abs(y - y0) );
    }

    //heuristic function
    function H(arr) {
        var h = 0;
        for (var i = 0; i < arr.length; i++) {
            h += getManhattanDistance(i, arr[i], scale);
        }
        return h;
    }

    //check whether there is answer or not
    //check odd-even
    var S = 0,
        gxSum = (scale * scale - 1) * (scale * scale - 2) / 2,
        oddEvenFlag = (gxSum & 1) ? 1 : 0;
    for (var v = 0; v < arr.length; v++) {
        for (var w = 0; w < v; w++) {
            if (arr[w] == 0) continue;
            if (arr[w] < arr[v]) S++;
        }
    }
    if (oddEvenFlag) {
        if (!(S & 1)) return null;
    } else {
        if (S & 1) return null;
    }
    var c = 0;

    //IDDFS with heuristic estimate
    function search (ar, g, bound) {
        var f, h, min, blank, routes, currentArr, t;

        c++; //debug

        h = H(ar);
        if (h == 0) return 0;
        f = g + h;
        if (f > bound) return f;

        min = Infinity;
        blank = _getBlankIndex(ar);
        routes = _getMovableIndex(ar, blank, scale);
        for (var l = 0; l < routes.length; l++) {
            var currentArr = _swap(ar, routes[l], blank);
            t = search(currentArr, g + 1, bound);
            if (t == 0) {
                result.push(routes[l]);
                return 0;
            }
            if (t < min) min = t;
        }
        return min;
    }

    //main procedure
    var b = H(arr);
    while (b < 10000) {
        var t = search(arr, 0, b);
        if (t == 0) {
            console.log(c + " cases are searched.");//debug
            console.log(result);
            return result;
        }
        b = t;
        //console.log('Bound increased:' + b);
    }

    console.log(c + " cases are searched.");//debug
    console.log(result);
    return null;
}

};

var currentSolution = solutionMethods['A_Star'];

Puzzle.prototype.getAllSolutionMethods = function () {
    var result = [];
    for (var f in solutionMethods) {
        result.push(f);
    }
    return result;
};

Puzzle.prototype.setCurrentSolutionMethod = function (f) {
    if (solutionMethods[f]) {
        currentSolution = solutionMethods[f];
        return f;
    }
    return false;
};

Puzzle.prototype.getCurrentSolutionMethod = function () {
    for (var f in solutionMethods) {
        if (solutionMethods[f] == currentSolution) {
            return f;
        }
    }
    return null;
}

Puzzle.prototype.solve = function () {
    var that = this;
    var result = solve(currentSolution, this.getCurrentSerial(), this.scale);
    if (!result) return "No solution!";
    var solution = result['solution'];
    var timer = setInterval(function () {
        if (solution.length > 0) {
            var block = that.getBlockByPositionNum(solution.pop());
            that.pushBlock(block);
        }
        if (solution.length <= 0) {
            clearInterval(timer);
        }
    }, 500);
    return "elapsedTime:" + result['elapsedTime'] / 1000 + "seconds";
};

//solve(solutionMethods["BFS"], [1, 2, 3, 4, 5, 6, 0, 7, 8], 3);
// solve(solutionMethods["BFS"], [5, 7, 6, 1, 0, 8, 4, 2, 3], 3);
// solve(solutionMethods["A_Star"], [5, 7, 6, 1, 0, 8, 4, 2, 3], 3);
// solve(solutionMethods["IDA*"], [5, 7, 6, 1, 0, 8, 4, 2, 3], 3);
//solve(solutionMethods["A_Star"], [4, 3, 7, 10, 14, 6, 13, 11, 9, 12, 0, 8, 1, 2, 15, 5], 4);

})(window);
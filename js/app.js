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
    while (l < 1000) {
        if (!t.levels[l]) return null;
        for (var n = 0; n < t.levels[l].length; n++) {
            var blank = _getBlankIndex(t.levels[l][n].a);
            var routes = _getMovableIndex(t.levels[l][n].a, blank, scale);
            for (var k = 0; k < routes.length; k++) {
                var newArr = _swap(t.levels[l][n].a, routes[k], blank);
                //console.log(newArr);
                if (_checkResult(newArr)) {
                    result.push(routes[k]);
                    var pNode = t.levels[l][n];
                    while (pNode.parent) {
                        result.push(pNode.i);
                        pNode = pNode.parent;
                    }
                    endFlag = true;
                    break;
                }
                t.levels[l][n].append(newArr, routes[k]);
            }
            if (endFlag) break;
        }
        if (endFlag) break;
        l++;
        console.log(l);
    }
    if (l >= 1000) {
        alert("BFS costet too long time and should be paused.");
        return [];
    }
    return result;
},

//not implemented yet
"BFS_improved": function (arr, scale) {
    return null;
},

"A_Star": function (arr, scale) {
    return null;

    function PQueue () {}
    PQueue.prototype.init = function () {};
    PQueue.prototype.getSize = function () {};
    // PQueue.prototype.getMax = function () {};
    PQueue.prototype.deleteMax = function () {};
    PQueue.prototype.insert = function () {};

    function Tree () {}
    Tree.prototype.append = function () {};
    Tree.prototype.find = function () {};
    Tree.prototype.getPriority = function () {};

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

    var result = [],
        t = new Tree();

    do {
        //
    } while (1);

    return result;
}

};

var currentSolution = solutionMethods['BFS'];

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

//solve(_solveBFS, [1, 2, 3, 4, 5, 6, 0, 7, 8], 3);
//solve(_solveBFS, [2, 3, 6, 1, 5, 0, 4, 7, 8], 3);

})(window);
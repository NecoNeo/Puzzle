(function (global) {

//Puzzle Main Programme

function Puzzle ($div ,spec) {
    this.$div = $div;
    this.spec = spec;
    this.init(spec);
}

Puzzle.prototype = {
    constructor: Puzzle,
    $div: null,
    spec: null,
    matrix: null,
    
    init: function (spec) {
        this._initMatrix(spec);
        var randomSerial = this._getRandomSerial(spec);
        var index = 0;
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                this.matrix[i][j] = new Block(this, randomSerial[index], i, j);
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
    
    _getRandomSerial: function (spec) {
        var initSerial = [];
        for (var s = 0, sMax = spec * spec; s < sMax; s++) {
            initSerial[s] = s;
        }
        for (var i = initSerial.length - 1; i > 0; i--) {
            var randomIndex = parseInt(Math.random() * i);
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
        arr["spec"] = this.spec;
        return arr;
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
            overflow = this.spec * this.spec;
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
        });
        return true;
    },
};

global.Puzzle = Puzzle;

//Puzzle Solution

function Solve (method, arr, spec) {
    var startTime, endTime, solution, result;
    if (!spec) {
        if (arr["spec"]) {
            spec = arr["spec"];
        } else {
            spec = 3;
        }
    }
    startTime = ( new Date() ).valueOf();
    solution = method(arr, spec);
    endTime = ( new Date() ).valueOf();
    result = {
        "solution": solution,
        "elapsedTime": endTime - startTime
    };
    return result;
}

function _solveBFS (arr, spec) {
    function _swap (ar, a, b) {
        var temp = ar[a];
        ar[a] = ar[b];
        ar[b] = temp;
    }

    function _getMovableIndex (ar, i, spec) {
        var result = [],
            max = spec * spec;
        //   N
        // W 0 E
        //   S      W->E->N->S
        if ( (i - 1 >= 0) && (i / spec - parseInt(i / spec) != 0) ) result.push(i - 1);
        if ( (i + 1 < max) && ( (i + 1) / spec - parseInt( (i + 1) / spec ) != 0) ) result.push(i + 1);
        if (i - spec >= 0) result.push(i - spec);
        if (i + spec < max) result.push(i + spec);
        return result;
    }

    function _checkResult (a) {
        for (var i = 0; i < a.length - 1; i++) {
            if (a[i] != i + 1) return false;
        }
        return true;
    }

    function _Tree (a, parent, i) {
        this.a = a;
        this.parent = parent || null;
        if (i || i === 0) {
            this.i = i;
        } else {
            this.i = null;
        }
        this.children = {};
    }
    _Tree.prototype.append = function (a, i) {
        var tree = new _Tree(a, this, i);
        this.children[i] = tree;
        return tree;
    };

    var result = [];
    if (_checkResult()) return result;
    //check 
}

})(window);
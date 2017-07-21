const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(40, 40);

const next = document.getElementById('next').getContext('2d');

next.scale(40, 40);

var game = {
		tet : [],
		next : [],
		pos: {x: 0, y: 0},
		dropEvery: 1000,
		time : 0,
		dropCount : 0,
		pause : -1,
		score: 0,
		pit: [],
		color: [
		null,
		'red',
		'orange',
		'blue',
		'purple',
		'GreenYellow',
		'cyan',
		'DeepSkyBlue',
		]
};

document.addEventListener('keydown', function (event) {
    if (event.keyCode == 37) {
        playerMove(-1);
    } else if (event.keyCode == 39) {
        playerMove(1);
    } else if (event.keyCode == 40) {
        playerDrop();
    } else if (event.keyCode == 13) {
        playerRotate(-1);
    } else if (event.keyCode == 38) {
        playerRotate(1);
    } else if (event.keyCode == 32) {
    	gamePause();
    }
});

function pitClean() {
	var j = 0;
 	for (let i = game.pit.length - 1; i > 0; --i) {
        while (j < game.pit[i].length && game.pit[i][j] != 0) {
         		j++;
            }
        if ( j == game.pit[i].length) {
        	const row = game.pit.splice(i, 1)[0].fill(0);
        	game.pit.unshift(row);
        	++i;
        	game.score += 10 * ((game.dropCount / 10 | 0) + 1);
    	}
    	j = 0;
    }
}

function NewTet(index)
{
	if (index == 0) {
		return [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0],
		];
	}
	else if (index == 1) {
		return [
			[0, 2, 2],
			[2, 2, 0],
			[0, 0, 0],
		];
	}
	else if (index == 2) {
		return [
			[3, 3, 0],
			[0, 3, 3],
			[0, 0, 0],
		];
	}
	else if (index == 3) {
		return [
			[0, 4, 0, 0],
			[0, 4, 0, 0],
			[0, 4, 0, 0],
			[0, 4, 0, 0],
		];
	}
	else if (index == 4) {
		return [
			[5, 5],
			[5, 5],
		];
	}
	else if (index == 5) {
		return [
			[0, 6, 0],
			[0, 6, 0],
			[0, 6, 6],
		];
	}
	else if (index == 6) {
		return [
			[0, 7, 0],
			[0, 7, 0],
			[7, 7, 0],
		];
	}
}

function merge()
{
	for (let i = 0; i != game.tet.length; i++) {
		for (let j = 0; j != game.tet[i].length; j++) {
			if (game.tet[i][j] != 0)
				game.pit[i + game.pos.y][j + game.pos.x] = game.tet[i][j];
		}
	}
}

function resetGame()
{
	game.pos.y = 0;
	game.tet = game.next;
	game.pos.x = (game.pit[0].length / 2 | 0) - (game.tet[0].length / 2 | 0);
	game.next = NewTet((7 * Math.random() | 0));
	game.dropCount++;
	pitClean();
	if (game.dropCount % 10 == 0) {
		game.dropEvery -= 50;
	}
	if (collision()) {
	}
}

function collision()
{
	for (let i = 0; i != game.tet.length; i++) {
		for (let j = 0; j != game.tet[i].length; j++) {
			if (game.tet[i][j] != 0 && 
				(game.pit[i + game.pos.y] &&
				game.pit[i + game.pos.y][j + game.pos.x]) != 0)
				return true;
		}
	}
	return false;
}

function playerMove(dir) {
	if (game.pause == -1)
		game.pos.x += dir;
	if (collision())
		game.pos.x -= dir;
}

function playerDrop() {
	if (game.pause == -1) {
		game.time = 0;
		game.pos.y++;
	}
	if (collision()) {
		game.pos.y--;
		merge();
		resetGame();
	}
}

function playerRotate(dir)
{
	if (game.pause == -1) {
		for (let i = 0; i < game.tet.length; i++) {
			for (let j = 0; j < i; j++) {
				[game.tet[i][j], game.tet[j][i]] = [game.tet[j][i], game.tet[i][j]];
			}
		}
		if (dir > 0) {
        	game.tet.forEach(function(row) {row.reverse()});
    	} else {
        	game.tet.reverse();
    	}
	}
	let x = game.pos.x;
	let off = 1;
	while (collision())	{
		game.pos.x += off;
		if (game.pos.x - x >= game.tet[0].length) {
			off = -off;
			game.pause.x = x;
		}
		else if (off == -1 && x - game.pos.x >= 4) {
			playerRotate(-dir);
		}
	}
}

function drawNext(tet) {
    tet.forEach(function(row, j) {
        row.forEach(function(value, i) {
            if (value != 0) {
                next.fillStyle = game.color[value];
                next.fillRect(i,
                            	j + (4 - tet.length),
	                            1, 1);
            }
        });
    });
}

function drawTet(tet, offset) {
    tet.forEach(function(row, j) {
        row.forEach(function(value, i) {
            if (value != 0) {
                context.fillStyle = game.color[value];
                context.fillRect(i + offset.x,
                                 j + offset.y,
                                 1, 1);
            }
        });
    });
}

function gamePause () {
	game.pause *= -1;
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    next.fillStyle = '#000';
    next.fillRect(0, 0, canvas.width, canvas.height);

    drawTet(game.pit, {x: 0, y: 0});
    drawTet(game.tet, game.pos);
    drawNext(game.next);
}

var timeKeeper = 0;

function mainGame(time = 0)
{
	timeKeeper = time - timeKeeper;
	game.time += timeKeeper;
	timeKeeper = time;
	if (game.pause == -1)
	{
		document.getElementById('score').innerText = game.score;
		if (game.time > game.dropEvery) {
				playerDrop();
				time = 0;
			}
		draw();
	}
	requestAnimationFrame(mainGame);
}

for (let i = 0; i != 20; i++) {
        game.pit.push(new Array(12).fill(0));
    }
game.next = NewTet((7 * Math.random() | 0));
resetGame();
console.log(game.pit.length)
mainGame();
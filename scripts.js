window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.font = '40px Helvetica'
    ctx.textAlign = 'center'
    
    class Player {
        constructor(game) {
            this.game = game
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 5;
            this.spriteWidth = 255;
            this.spriteHeight = 256;
            this.width = this.spriteWidth
            this.height = this.spriteHeight
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = 5;
            this.image = document.getElementById('bull');
        }
        restart() {
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;
        }
        draw(context) {

            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteWidth, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore()
                context.stroke();
                context.beginPath();
                context.moveTo(this.collisionX, this.collisionY);
                context.lineTo(this.game.mouse.x, this.game.mouse.y);
                context.stroke()
            }
        }
        update() {
            this.dx = this.game.mouse.x - this.collisionX
            this.dy = this.game.mouse.y - this.collisionY
            const angle = Math.atan2(this.dy, this.dx) 
            if (angle < -2.74 || angle > 2.74) this.frameY = 6;
            else if (angle < -1.96) this.frameY = 7;
            else if (angle < -1.17) this.frameY=0
            else if (angle < -0.39) this.frameY = 1;
            else if (angle < 0.39) this.frameY = 2;
            else if (angle < 1.17) this.frameY = 3;
            else if (angle < 1.96) this.frameY = 4;
            else if (angle < 2.74) this.frameY = 5;


            const dist = Math.hypot(this.dy, this.dx)
            if (dist > this.speedModifier) {
                this.speedX = (this.dx)/dist || 0
                this.speedY = (this.dy)/dist || 0
            } else {
                this.speedX = 0 
                this.speedY = 0
            }
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5 - 100

            if (this.collisionX < this.collisionRadius) {
                this.collisionX = this.collisionRadius
            } else if (this.collisionX > this.game.width - this.collisionRadius) {
                this.collisionX = this.game.width - this.collisionRadius
            }

            if (this.collisionY < this.game.topMargin + this.collisionRadius) {
                this.collisionY = this.game.topMargin + this.collisionRadius
            } else if (this.collisionY > this.game.height - this.collisionRadius) {
                this.collisionY = this.game.height - this.collisionRadius
            }
            //check collision with obstacle
            // [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
            this.game.obstacles.forEach(obstacle => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle)
                if (collision) {
                    const unit_x = dx /distance;
                    const unit_y = dy/distance;
                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x
                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y
                }
                
            })
        }

    }

    class Obstacle {
        constructor (game) {
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 40
            this.image = document.getElementById('obstacles')
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 70;
            this.frameX = Math.floor(Math.random() * 4)
            this.frameY = Math.floor(Math.random() * 3)
        }
        draw (context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore()
                context.stroke();
            }
        }
        update() {

        }
    }

    class Eggs {
        constructor(game) {
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin));
            this.image = document.getElementById('egg');
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.hatchTimer = 0;
            this.hatchInterval = 3000;
            this.marked = false;
        }
        draw(context) {
            context.drawImage(this.image, this.spriteX, this.spriteY)
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore()
                context.stroke();
                context.fillText((Math.floor(this.hatchTimer)/1000).toFixed(1), this.collisionX, this.collisionY - this.collisionRadius * 2.5);
            }
        }
        update(dT) {
            this.spriteX =  this.collisionX - this.width * 0.5;
            this.spriteY =  this.collisionY - this.height * 0.5 - 30;
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies];
            collisionObjects.forEach(object => {
               let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
               if (collision) {
                const unit_x = dx / distance;
                const unit_y = dy / distance;
                this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
               }
            })
            if (this.hatchTimer > this.hatchInterval || this.collisionY < this.game.topMargin) {
                this.marked = true;
                this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY))
                this.game.removeGameObjects();
            } else {
                this.hatchTimer += dT
            }
        }
    }

    class Larva {
        constructor(game, x, y) {
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.collisionRadius = 30;
            this.image = document.getElementById('larva');
            this.spriteWidth = 150;
            this.spriteHeight = 150;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.marked = false;
            this.speedY = 1 + Math.random();
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 2);
        }
        draw(context) {
            context.drawImage(this.image, this.frameX, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore()
                context.stroke();
            }
        }
        update() {
            this.collisionY -= this.speedY;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 40;
            if (this.collisionY < this.game.topMargin) {
                this.marked = true;
                this.game.removeGameObjects();
                if (!this.game.gameOver) this.game.savedHatchlings += 1;
                for (let i = 0; i < 3; i++) {
                    this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, 'yellow'));
                }
            }
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.eggs]
            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
                if (collision) {
                 const unit_x = dx / distance;
                 const unit_y = dy / distance;
                 this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                 this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
             })
             this.game.enemies.forEach(enemy => {
                if (this.game.checkCollision(this, enemy)[0] && !this.game.gameOver) {
                    this.marked = true;
                    this.game.removeGameObjects();
                    if (!this.game.gameOver) this.game.lostHatchlings += 1;
                    for (let i = 0; i < 5; i++) {
                        this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, 'blue'))
                    }
                }
             })
        }
    }

    class Enemy {
        constructor(game) {
            this.game = game;
            this.collisionRadius = 30;
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
            this.speedX = Math.random() * 3 + 0.5;
            this.image = document.getElementById('toads');
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 4)
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2)
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore()
                context.stroke();
            }
        }
        update() {
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height + 40;
            this.collisionX -= this.speedX
            if (this.spriteX + this.width < 0 && !this.game.gameOver) {
                this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
                this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
                this.frameY = Math.floor(Math.random() * 4);

            }
            let collisionObjects = [this.game.player, ...this.game.obstacles];
            collisionObjects.forEach(object => {
               let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
               if (collision) {
                const unit_x = dx / distance;
                const unit_y = dy / distance;
                this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
               }
            })
        }
    }

    class Particle {
        constructor(game, x, y, color) {
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.color = color;
            this.radius = Math.floor(Math.random() * 10 + 5);
            this.speedX = Math.random() * 6 -3;
            this.speedY = Math.random() * 2 + 0.5;
            this.angle = 0;
            this.va = Math.random() * 0.1 + 0.01;
            this.marked = false;
        }
        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.restore();
        }
    }

    class Firefly extends Particle {
        update() {
            this.angle += this.va;
            this.collisionX += Math.cos(this.angle) * this.speedX;
            this.collisionY -= this.speedY;
            if (this.collisionY < 0 - this.radius) {
                this.marked = true;
                this.game.removeGameObjects()
            }
        }
    }
    

    class Spark extends Particle {
        update() {
            this.angle += this.va * 0.5;
            this.collisionX -= Math.cos(this.angle) * this.speedX;
            this.collisionY -= Math.sin(this.angle) * this.speedY;
            this.radius -= 0.05;
            if (this.radius < 0.2) {
                this.marked = true
                this.game.removeGameObjects();
            };
            
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.player = new Player(this);
            this.fps = 70;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.eggTimer = 0;
            this.eggInterval = 1000;
            this.numberOfObstacles = 10;
            this.maxEggs = 10;
            this.topMargin = 260;
            this.debug = false;
            this.obstacles = [];
            this.eggs = [];
            this.enemies = [];
            this.gameObjects = [];
            this.hatchlings = [];
            this.particles = []
            this.savedHatchlings = 0;
            this.lostHatchlings = 0;
            this.winningScore = 5;
            this.gameOver = false;
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

            // event listeners
            canvas.addEventListener('mousedown', (e) => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = true;
            });
            canvas.addEventListener('mouseup', (e) => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = false;
            });
            canvas.addEventListener('mousemove', (e) => {
                if (this.mouse.pressed) {
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                }
            })
            window.addEventListener('keydown', (e) => {
                if (e.key == 'd') this.debug = !this.debug;
                else if (e.key == 'r') this.restart()
            })
        }
        render(context, dT) {
            if (this.timer > this.interval) {
                context.clearRect(0,0, this.width, this.height);
                this.gameObjects = [...this.eggs, ...this.obstacles, this.player, ...this.enemies, ...this.hatchlings, ...this.particles];
                this.gameObjects.sort((a,b) => {
                    return a.collisionY - b.collisionY
                }).forEach(object => {
                    object.draw(context);
                    object.update(dT);
                })
                this.timer = 0;
            }
            this.timer += dT

            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver) {
                this.addEgg()
                this.eggTimer = 0;
            } else {
                this.eggTimer += dT
            }
            context.save();
            context.textAlign = 'left';
            context.fillText('Score: ' + (this.savedHatchlings - this.lostHatchlings), 25, 50);
            context.restore();

            if (this.savedHatchlings >= this.winningScore) {
                this.gameOver = true;
                context.save();
                context.fillStyle = 'rgba(0,0,0,0.5';
                context.fillRect(0, 0, this.width, this.height);
                context.fillStyle = 'white';
                context.textAlgin = 'center';
                let message1;
                let message2;
                if (this.lostHatchlings <= 5) {
                    message1 = 'You Win';
                    message2 = 'You saved most hatchlings'
                } else {
                    message1 = 'Boo';
                    message2 = 'You killed lots of hatchlings: ' + this.lostHatchlings
                }
                context.font = '130px Helvetica';
                context.fillText(message1, this.width * 0.5, this.height * 0.5 - 10);
                context.font = '40px Helvetica';
                context.fillText(message2, this.width * 0.5, this.height * 0.5 + 30);
                context.fillText('Final Score ' + (this.savedHatchlings - this.lostHatchlings) + '. Press `R` to play again', this.width * 0.5, this.height * 0.5 + 80)
                context.restore();
            }
        }
        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX
            const dy = a.collisionY - b.collisionY
            const distance = Math.hypot(dy, dx)
            const sumOfRadii = a.collisionRadius + b.collisionRadius
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
        }
        addEgg() {
            this.eggs.push(new Eggs(this));
        }
        addEnemy() {
            this.enemies.push(new Enemy(this))
        }
        removeGameObjects() {
            this.eggs = this.eggs.filter(egg => !egg.marked);
            this.hatchlings = this.hatchlings.filter(hatchling => !hatchling.marked);
            this.particles = this.particles.filter(particle => !particle.marked);
        }
        restart() {
            this.player.restart();
            this.obstacles = [];
            this.gameObjects = [];
            this.hatchlings = [];
            this.particles = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }
            this.lostHatchlings = 0;
            this.savedHatchlings = 0;
            this.gameOver = false;
            this.init()

        }
        init() {
            for (let i = 0; i < 3; i++) {
                this.addEnemy();
                console.log(this.enemies)
            }
            let attempts = 0;
            while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
                let testObstacle = new Obstacle(this);
                let overlap = false
                this.obstacles.forEach(obstacle => {
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY;
                    const distanceBuffer = 100;
                    const distance = Math.hypot(dy, dx)
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer
                    if (distance < sumOfRadii) {
                        overlap = true
                    }
                });
                const margin = testObstacle.collisionRadius * 3;
                if (!overlap && 
                    testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width &&
                    testObstacle.collisionY > this.topMargin + margin && testObstacle.collisionY < this.height - margin
                    ) {
                    this.obstacles.push(testObstacle)
                }

                attempts ++
            }
        }

    }

    const game = new Game(canvas);
    game.init()
    console.log(game)

    let lastTime = 0;
    function animate(timeStamp) {
        const dT = timeStamp - lastTime;
        lastTime = timeStamp
        game.render(ctx, dT);
        requestAnimationFrame(animate)
    }
    animate(0)
})

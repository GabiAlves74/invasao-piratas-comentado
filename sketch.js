// Váriáveis constantes do motor de física
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

// Váriáveis globais do jogo
var engine, world, backgroundImg,
waterSound,
pirateLaughSound,
backgroundMusic,
cannonExplosion;
var canvas, angle, tower, ground, cannon, boat;

// Variáveis matriz vazias
var balls = [];
var boats = [];

//Variável matriz vazia, variáveis para carregamento de arquivo JSON e SpriteSheet (animação do barco)
var boatAnimation = [];
var boatSpritedata, boatSpritesheet;

//Variável matriz vazia, variáveis para carregamento de arquivo JSON e SpriteSheet (animação do barco quebrado)
var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

//Variável matriz vazia, variáveis para carregamento de arquivo JSON e SpriteSheet (animação respingos de água)
var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

//Placar inicial
var score = 0;

//Variaveis com sinalizações 'false' por padrão, para que o estado e o som não sejam executados em loop
var isGameOver = false;
var isLaughing= false;

//Função para carregamento de imagens (gif, animações) e sons do jogo
function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  backgroundMusic = loadSound("./assets/background_music.mp3");
  waterSound = loadSound("./assets/cannon_water.mp3");
  pirateLaughSound = loadSound("./assets/pirate_laugh.mp3");
  cannonExplosion = loadSound("./assets/cannon_explosion.mp3");
  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");
  brokenBoatSpritedata = loadJSON("assets/boat/broken_boat.json");
  brokenBoatSpritesheet = loadImage("assets/boat/broken_boat.png");
  waterSplashSpritedata = loadJSON("assets/water_splash/water_splash.json");
  waterSplashSpritesheet = loadImage("assets/water_splash/water_splash.png");
}

//Função para a criação do cenário
function setup() {
  //tamanho do espaço do jogo
  canvas = createCanvas(1200,600);
  // criação do motor de física
  engine = Engine.create();
  // criação do mundo físico
  world = engine.world;
  // Definição do raio do ângulo (graus)
  angleMode(DEGREES)
  // valor do ângulo
  angle = 15

 // Criação do chão físico para que os objetos do jogo não caiam 
  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

 // Criação do corpo físico da torre  
  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  // Criação do objeto canhão
  cannon = new Cannon(180, 110, 100, 50, angle);

  // Carregamento dos frames da animação barco
  var boatFrames = boatSpritedata.frames;
  // Loop para verficar comprimento da matriz boatFrames
  for (var i = 0; i < boatFrames.length; i++) {
    // obter posição dos quadros em boatframes
    var pos = boatFrames[i].position;
    // obter posição da imagem do arquivo spritesheet,correspondente a posição obtida em var pos
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    // envio da imagem para a matriz (para que as imagens sigam a sequência correta)
    boatAnimation.push(img);
  }

  // Carregamento dos frames da animação barco quebrado
  var brokenBoatFrames = brokenBoatSpritedata.frames;
  // Loop para verficar comprimento da matriz de barcos quebrados
  for (var i = 0; i < brokenBoatFrames.length; i++) {
     // obter posição dos quadros em brokenboatframes
    var pos = brokenBoatFrames[i].position;
    // obter posição da imagem do arquivo spritesheet,correspondente a posição obtida em var pos
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
     // envio da imagem para a matriz (para que as imagens sigam a sequência correta)
    brokenBoatAnimation.push(img);
  }

  // Carregamento dos frames da animação respingo de água
  var waterSplashFrames = waterSplashSpritedata.frames;
  // Loop para verficar comprimento da matriz de respingos de água
  for (var i = 0; i < waterSplashFrames.length; i++) {
    // obter posição dos quadros em watersplashframes
    var pos = waterSplashFrames[i].position;
    // obter posição da imagem do arquivo spritesheet,correspondente a posição obtida em var pos
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
     // envio da imagem para a matriz (para que as imagens sigam a sequência correta)
    waterSplashAnimation.push(img);
  }
}

// função desenhar (para que os objetos sejam exibidos na tela)
function draw() {
  //definição do fundo
  background(189);
  image(backgroundImg, 0, 0, width, height);

  // condicional para verificar se a música de fundo esta em execução e toca-la caso não esteja
  if (!backgroundMusic.isPlaying()) {
    backgroundMusic.play();
    backgroundMusic.setVolume(0.1);
  }
 // atualização continua do motor de física
  Engine.update(engine);
 
  // caracteristicas do objeto chão encapsuladas
  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  // caracteristicas do objeto torre encapsuladas
  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();
 // chamada de função 
  showBoats();

  // loop para exibição de bolas de canhnão e verificação de colisão bola x barco
   for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }
 // exibição do canhão
  cannon.display();
  
// adição de texto 'Pontuação'
  fill("#6d4c41");
  textSize(40);
  text(`Pontuação: ${score}`, width - 200, 50);
  textAlign(CENTER, CENTER);
}

// função para verificar colisão com barco
function collisionWithBoat(index) {
  // verificação de comprimento matriz boats
  for (var i = 0; i < boats.length; i++) {
    // condicional para desconsiderar objetos indefinidos
    if (balls[index] !== undefined && boats[i] !== undefined) {
      // Verificação de colisão
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);
      // condicional para definir o que deverá acontecer se colisão for verdadeira
      if (collision.collided) {
        score+=5
          boats[i].remove(i);
        

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

// função tecla pressionada
function keyPressed() {
  // condicional para verificar se seta para baixo foi pressionada
  if (keyCode === DOWN_ARROW) {
    // criação de novas bolas de canhão
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    // definição de trajetória da bola
    cannonBall.trajectory = [];
    // definição de ângulo da bola de acordo com posição do canhão
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    // adição de bolas a matriz
    balls.push(cannonBall);
  }
}

// função bola de canhão
function showCannonBalls(ball, index) {
  // condicional para exibir objeto bola e adicionar animação a ele
  if (ball) {
    ball.display();
    ball.animate();
    // condicional para verificar se bola caiu na água adição de som de respingos
    if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
      waterSound.play()  
      // remoção da bola que caiu na água
      ball.remove(index);
      
    }
  }
}

// função para criação de barcos
function showBoats() {
  // condicional para criação de novos barcos (verificando se há algum na matriz e se o barco que está na tela está alcançando a torre)
  if (boats.length > 0) {
    if (
      boats.length < 4 &&
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );
    // adição do barco a matriz
      boats.push(boat);
    }
    // loop para adicionar velocidade ao barco
    for (var i = 0; i < boats.length; i++) {
      Matter.Body.setVelocity(boats[i].body, {
        x: -0.9,
        y: 0
      });

      boats[i].display();
      boats[i].animate();
      // condicional para verificação de colisão com a torre
      var collision = Matter.SAT.collides(this.tower, boats[i].body);
      if (collision.collided && !boats[i].isBroken) {
          //Adicionar a sinalização isLaughing e a configuração isLaughing para true para tocar o som de risada
          if(!isLaughing && !pirateLaughSound.isPlaying()){
            pirateLaughSound.play();
            isLaughing = true
          }
          // alteração do gamestate
        isGameOver = true;
        gameOver();
      }
    }
    // criando novos barcos
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

// função tecla pressionada adiciona som ao tiro do canhão e cria as bolas
function keyReleased() {
  if (keyCode === DOWN_ARROW && !isGameOver) {
    cannonExplosion.play();
    balls[balls.length - 1].shoot();
  }
}

// função de chamada do sweet alert para reiniciar jogo
function gameOver() {
  swal(
    {
      title: `Fim de Jogo!!!`,
      text: "Obrigada por jogar!!",
      imageUrl:
        "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
      imageSize: "150x150",
      confirmButtonText: "Jogar Novamente"
    },
    function(isConfirm) {
      if (isConfirm) {
        location.reload();
      }
    }
  );
}

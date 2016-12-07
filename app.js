var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app = express();

// criando o server
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(8000);
io.set("origins", "*:*");


var config = require('./public/initial-config.json');


var currentPrice = config.initialPrice;
var currentBidder = config.initialBidder;

var globalNames = config.globalNames;
var usedNames = [];
var users = 0;

function sugestUsername(){
	var i = 0;
	while (usedNames.indexOf(globalNames[i])>-1){
		i = Math.floor(Math.random() * (globalNames.length));
	}
	return globalNames[i];
}


var pt = false;
// Verifica se ocorre timeout, no caso, se pararam de bidar.
var myTimeout = setTimeout(function(){
	whenTimeout();
}, config.initialTimeout);
var waiting;


// Chamado quando há uma nova conexão de cliente
io.on('connection', function (socket) {
	console.log('Server: Um novo cliente se conectou.');

	//Enviar as configurações iniciais
	socket.emit('initial config',
		{
			names: globalNames, 
			price: currentPrice, 
			name: currentBidder, 
			title: config.title,
			description: config.description, 
			pic: config.pic
		})

	// Preciso avisar para o cliente quem é o currentBidder e qual é o currentPrice
	//socket.emit('bidUpdate', {name: currentBidder, price: currentPrice});
	
	// Quando algum cliente faz o bid
	socket.on('bid', function (data) {
		if (!pt){
			resetTimeout();
			currentPrice = data.price;
			currentBidder = data.name;
			// Manda para o cliente que clicou
			socket.emit('bidUpdate', {name: currentBidder, price: currentPrice});
			// Manda para os outros clientes
			socket.broadcast.emit('bidUpdate', {name: currentBidder, price: currentPrice});
		}
	});
	
	// Quando cliente pergunta se o Username desejado está disponível
	socket.on('username disponivel?', function(username){
		
		if (usedNames.indexOf(username) > -1){
			// Nao disponivel, sugerir um username
			console.log('Server: O username desejado não está disponível. Sugerindo um novo username...');
			socket.emit('reply sobre username', {disponivel: false, sugestao: sugestUsername(), finished: pt});
		}
		else {
			// Disponivel
			usedNames.push(username)
			console.log('Server: O username desejado está disponível!')
			socket.emit('reply sobre username', {disponivel: true, sugestao: username, finished: pt});
		}
	});

	socket.on('estou liberando este username', function(username){
		// TODO
	});

	// SYN - recebido pelos clientes
	socket.on('ok, confirma fim do leilao?',function(data){
		users--;
		console.log('Server: Cliente confirmou que recebeu a mensagem.');
		console.log('Server: Faltam ' + users + ' mensagens de confirmação chegarem.')
		//socket.emit('confirmado fim do leilao', {name: currentBidder, price: currentPrice});
		//clearTimeout(myTimeout);
		//myTimeout = setTimeout(function(){
		//	initialize();
		//}, 30000);
		//users--;
		if (users == 0){
			// Confirma para tdos fim do leilao
			console.log('Server: Avisando todos os clientes.')
			io.emit('confirmado fim do leilao', {name: currentBidder, price: currentPrice});
			//socket.emit('confirmado fim do leilao', {name: currentBidder, price: currentPrice});
			//socket.broadcast.emit('confirmado fim do leilao', {name: currentBidder, price: currentPrice});
		}
	});

	

});


// TODO: Criar classe para título/produto/descriçao


// TODO: Criar timeout e funcao para timeout
function whenTimeout(){
	// ACK - 3 way handshake
	pt = true; 
	clearTimeout(waiting);

	users = (Object.keys(io.sockets.sockets)).length;
	io.emit('fim do leilao', {end: true});
	
	// user parece ser undefined o.O?
	console.log("Server: Mensagem enviada para todos os usuários conectados.\nTotal de "
	 + users + " mensagens.");

	waiting = setTimeout(function(){
		if (users != 0){
			whenTimeout();
		}
	}, config.waitTimeout);
	
}

function resetTimeout(){
	clearTimeout(myTimeout);
	myTimeout = setTimeout(function(){
		whenTimeout();
	}, config.bidTimeout);
}


function initialize(){
	currentPrice = config.initialPrice;
	currentBidder = config.initialBidder;
	usedNames = [];
	users = 0;
	pt = false;
	myTimeout = setTimeout(function(){
		whenTimeout();
	}, config.initialTimeout);
	waiting = null;
}




app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.use('/templates', express.static(__dirname + '/views/templates/'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


module.exports = app;

import {Component} from 'angular2/core';



@Component({
    selector: 'auction-app',
    templateUrl: 'templates/product.html'
})

//TODO: LAST BID FROM & SHOW YOUR NAME

export class AppComponent {
    price: number = 0.0;
    lastBid: number = 0.0;
    socket = null;
    bidValue = '';
    currentBidder = '';
    user = '';
    ableToBid: boolean = false

    names = []; 
    
    title: string; // Definir o titulo
    description: string; // Definir a descriçao
    pic: string; // Definir pic

     // gera username aleatorio
    generateRandomUsername(){
        var i = Math.floor(Math.random() * (this.names.length));
        this.socket.emit('username disponivel?', this.names[i]);
        console.log('Client: o username \"' + this.names[i] + '\" está disponivel?');
    }

    constructor(){
        // Funcoes para o leilao
        
        
        
        // DEFINIR O SEU IP PARA CONEXÕES EM REDES LOCAIS
        this.socket = io.connect('192.168.1.170:8000');
        //this.socket = io.connect('http://localhost:8000');
        
        // Quando o bid sofreu update
        this.socket.on('bidUpdate', function(data){
            if (data.price > this.price){
                this.price = data.price;
                this.currentBidder = data.name;
            }
            
        }.bind(this));

        this.socket.on('initial config', function(data){
            this.price = data.price;
            this.currentBidder = data.name;
            this.title = data.title;
            this.description = data.description;
            this.pic = data.pic;
            this.names = data.names
            this.generateRandomUsername();

        }.bind(this));

        // O que fazer quando recebe a resposta do servidor
        this.socket.on('reply sobre username', function(data){
            if (data.disponivel == false){
                // TODO: Funcoes para quando o usuario nao gostar do nome escolhido
                // e ou quiser trocar de nome
                this.user = data.sugestao;
                this.ableToBid = !data.finished;
            }
            else {
                this.user = data.sugestao;
                this.ableToBid = !data.finished;
            }
            console.log('Client: Server me recomendou utilizar \"'
             + this.user + '\" como username.');
        }.bind(this));

        this.socket.on('fim do leilao', function(data){
            console.log('Client: Aparentemente server declarou fim do leilão.');
            console.log('Client: Server, você confirma?');
            this.socket.emit('ok, confirma fim do leilao?', 'sim');
        }.bind(this));

        this.socket.on('confirmado fim do leilao', function(data){
            console.log('Client: Server confirmou. Finalizando o leilão...');
            this.ableToBid = false;
            alert('Fim do leilao!\nVencedor: ' + data.name + '\nOferta: R$ ' + data.price);
        }.bind(this));
        console.log('User connected');  

        
    }

   

    // libera o username
    freeUsername(){
        this.socket.emit('estou liberando este username', this.user);
    }



    bid(){
        this.lastBid = parseInt(this.bidValue);
        if ( this.lastBid > this.price && this.ableToBid){
            this.socket.emit('bid', {name: this.user, price: this.lastBid});
        }
        this.bidValue = '';
    }
}
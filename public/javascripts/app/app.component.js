System.register(['angular2/core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent() {
                    // Funcoes para o leilao
                    this.price = 0.0;
                    this.lastBid = 0.0;
                    this.socket = null;
                    this.bidValue = '';
                    this.currentBidder = '';
                    this.user = '';
                    this.ableToBid = false;
                    this.names = [];
                    // DEFINIR O SEU IP PARA CONEXÕES EM REDES LOCAIS
                    this.socket = io.connect('192.168.1.170:8000');
                    //this.socket = io.connect('http://localhost:8000');
                    // Quando o bid sofreu update
                    this.socket.on('bidUpdate', function (data) {
                        if (data.price > this.price) {
                            this.price = data.price;
                            this.currentBidder = data.name;
                        }
                    }.bind(this));
                    this.socket.on('initial config', function (data) {
                        this.price = data.price;
                        this.currentBidder = data.name;
                        this.title = data.title;
                        this.description = data.description;
                        this.pic = data.pic;
                        this.names = data.names;
                        this.generateRandomUsername();
                    }.bind(this));
                    // O que fazer quando recebe a resposta do servidor
                    this.socket.on('reply sobre username', function (data) {
                        if (data.disponivel == false) {
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
                    this.socket.on('fim do leilao', function (data) {
                        console.log('Client: Aparentemente server declarou fim do leilão.');
                        console.log('Client: Server, você confirma?');
                        this.socket.emit('ok, confirma fim do leilao?', 'sim');
                    }.bind(this));
                    this.socket.on('confirmado fim do leilao', function (data) {
                        console.log('Client: Server confirmou. Finalizando o leilão...');
                        this.ableToBid = false;
                        alert('Fim do leilao!\nVencedor: ' + data.name + '\nOferta: R$ ' + data.price);
                    }.bind(this));
                    console.log('User connected');
                }
                // gera username aleatorio
                AppComponent.prototype.generateRandomUsername = function () {
                    var i = Math.floor(Math.random() * (this.names.length));
                    this.socket.emit('username disponivel?', this.names[i]);
                    console.log('Client: o username \"' + this.names[i] + '\" está disponivel?');
                };
                // libera o username
                AppComponent.prototype.freeUsername = function () {
                    this.socket.emit('estou liberando este username', this.user);
                };
                AppComponent.prototype.bid = function () {
                    this.lastBid = parseInt(this.bidValue);
                    if (this.lastBid > this.price && this.ableToBid) {
                        this.socket.emit('bid', { name: this.user, price: this.lastBid });
                    }
                    this.bidValue = '';
                };
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'auction-app',
                        templateUrl: 'templates/product.html'
                    }), 
                    __metadata('design:paramtypes', [])
                ], AppComponent);
                return AppComponent;
            }());
            exports_1("AppComponent", AppComponent);
        }
    }
});
//# sourceMappingURL=app.component.js.map
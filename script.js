var list ={
    games_5x7:[],
    games_9x11:[],
    games_13x31:[],
    games_19x43:[]
};

var game = {
    game_id:0,
    key:"",
    level:"",
    rows:0,
    columns:0,
    gameTable:null,
    isPlaying:false,
    startDate:null,
    IAPlayer:false,
    totalSquares:0,
    tableHTMLElements:null
};

var players = {
    player1:null,
    player2:null,
    turn:-1,

    last_winner:-1,

    setTurn:function(turn){
        this.turn = turn;
        if(turn==2){ //player remoto/IAPlayer
            document.getElementById("player1").style.fontWeight="normal";
            document.getElementById("player2").style.fontWeight="bold";
        }
        else{
            document.getElementById("player2").style.fontWeight="normal";
            document.getElementById("player1").style.fontWeight="bold";
        }
    },

    changeTurn:function() {
        if (this.turn == 1) {
            this.setTurn(2);
        }
        else {
            this.setTurn(1);
        }
    },
    chooseWhoStarts:function(){
        //se o jogo se inicia pela primeira vez um jogador e escolhido
        //senao comeca o jogador que venceu o ultimo jogo
        if(this.last_winner==-1){ //jogo inicia-se pela primeira vez
            this.setTurn(Math.floor((Math.random()*2)+1));
        }
        else this.turn = this.last_winner;
    }
};

function Player (name, player1){
    this.name = name;
    this.score = 0;
    this.playingTime = 0; //em ms
    this.startDate;
    this.isPlaying=false;
    
    //atualizar label com o nome do jogador
    (function(){
	if(player1)
            document.getElementById("player1").innerHTML = name;
	else
	    document.getElementById("player2").innerHTML = name;
    })();
}

function IAPlayer(rows, cols, gameTable){
    var freeCells = []; //array de pontos

    (function() {
        //preencher freeCells com todas as posicoes validas
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++)
                if ((i % 2 == 0 && j % 2 != 0) || (i % 2 != 0 && j % 2 == 0)) {
                    var p = new Point(i, j);
                    freeCells.push(p);
                }
        }
        //atualizar label
        document.getElementById("player2").innerHTML="PC";
    })();

    //escolhe um ponto que ainda nao tenha sido escolhido,
    //atualizando o array durante a pesquisa
    this.choosePos = function(){
        var index, p;
        do {
            index = Math.floor(Math.random() * (freeCells.length));
            p = freeCells[index];
            freeCells.splice(index,1); //remover ponto no index
        } while(gameTable[p.x][p.y]!=0);
    return p;
    };

    this.name="PC";
    this.score = 0;
    this.playingTime=0; //em ms
}

function Point(l,c){
    this.x=l;
    this.y=c;
}

function Matrix (rows, columns) {
    this.rows=rows;
    this.columns=columns;
    this.myarray = new Array(this.rows);

    var i,j;
    for (i = 0; i < this.columns; i++) {
        this.myarray[i] = new Array(this.rows);
    }

    //inicializar
    for(i=0; i<this.myarray.length; i++)
        for(j=0; j<this.myarray.length; j++)
            this.myarray[i][j]=0;

    return this.myarray;
}

function showRightHighScore() {

    if (document.getElementById("select_beginner").checked==true)
        updateTable(5,7);
    else if (document.getElementById("select_intermediate").checked==true)
        updateTable(9,11);
    else if (document.getElementById("select_advanced").checked==true)
        updateTable(13,31);
    else if (document.getElementById("select_expert").checked==true)
        updateTablae(19,43);
}


//adicionar estrutura ao array correspondente
function addAndUpdate(winner){
    var p = {
        name: winner.name,
        score: winner.score,
        time: winner.playingTime
    };
    
    if(game.rows==5 && game.columns==7){ //2x3
        if (localStorage.getItem("highScore_5x7")!=null)
            list.games_5x7 = JSON.parse(localStorage.getItem("highScore_5x7"));
        
        list.games_5x7.push(p);
        list.games_5x7=sortAndreduceArray(list.games_5x7);
        localStorage.setItem("highScore_5x7",JSON.stringify(list.games_5x7));
    }
    
    if(game.rows==9 && game.columns==11){ //2x3
        if (localStorage.getItem("highScore_9x11")!=null)
            list.games_9x11 = JSON.parse(localStorage.getItem("highScore_9x11"));
        
        list.games_9x11.push(p);
        list.games_9x11=sortAndreduceArray(list.games_9x11);
        localStorage.setItem("highScore_9x11",JSON.stringify(list.games_9x11));
    }

    if(game.rows==13 && game.columns==31){ //2x3
        if (localStorage.getItem("highScore_13x31")!=null)
            list.games_13x31 = JSON.parse(localStorage.getItem("highScore_13x31"));
        
        list.games_13x31.push(p);
        list.games_13x31=sortAndreduceArray(list.games_13x31);
        localStorage.setItem("highScore_13x31",JSON.stringify(list.games_13x31));
    }

    if(game.rows==19 && game.columns==43){ //2x3
        if (localStorage.getItem("highScore_19x43")!=null)
            list.games_19x43 = JSON.parse(localStorage.getItem("highScore_19x43"));
        
        list.games_19x43.push(p);
        list.games_19x43=sortAndreduceArray(list.games_19x43);
        localStorage.setItem("highScore_19x43",JSON.stringify(list.games_19x43));
    }
    updateTable();
}


function updateTable(l,c){

    if (document.getElementById("online").checked==true)
        return;
    
    
    var array=null;

    //para quando chamada pela mudanca nas opcoes da dimensao do tabuleiro
    if(typeof (l)=='undefined' && typeof (c)=='undefined' ){
        if(game.rows==5 && game.columns==7) //2x3
            array= JSON.parse(localStorage.getItem("highScore_5x7"));
        
        else if(game.rows==9 && game.columns==11) //4x5
            array= JSON.parse(localStorage.getItem("highScore_9x11"));
        
        else if(game.rows==13 && game.columns==31) //6x8
            array= JSON.parse(localStorage.getItem("highScore_13x31"));
        
        else if(game.rows==19 && game.columns==43) //9x11
            array= JSON.parse(localStorage.getItem("highScore_19x43"));
    }

    else {
        if(l==5 && c==7){ //2x3
            if (JSON.parse(localStorage.getItem("highScore_5x7"))!=null)
                array= JSON.parse(localStorage.getItem("highScore_5x7"));
            else array=list.games_5x7;
        }
        else if(l==9 && c==11){
            if (JSON.parse(localStorage.getItem("highScore_9x11"))!=null)
                array= JSON.parse(localStorage.getItem("highScore_9x11"));
            else array=list.games_9x11;
        }
        else if(l==13 && c==31){
            if (JSON.parse(localStorage.getItem("highScore_13x31"))!=null)
                array= JSON.parse(localStorage.getItem("highScore_13x31"));
            else array=list.games_13x31;
        }
        else if(l==19 && c==43){ //9x11
            if (JSON.parse(localStorage.getItem("highScore_19x43"))!=null)
                array= JSON.parse(localStorage.getItem("highScore_19x43"));
            else array=list.games_19x43;
        }
    }
    
    if (array.length==0)
        return;
    
    
    var table=document.getElementById("table_top");
    table.innerHTML=""; //limpar
    table.innerHTML=""; //limpar
    var row = document.createElement("tr");
    var name=document.createElement("th");
    var score=document.createElement("th");
    var time=document.createElement("th");
    name.textContent="Name\u00A0";
    score.textContent="Score\u00A0";
    time.textContent="Time";
    row.appendChild(name);
    row.appendChild(score);
    row.appendChild(time);
    table.appendChild(row);


    for(var i=0; i<array.length; i++) {
        var temp = array[i];
        var row = document.createElement("tr");
        for (var j = 0; j < 3; j++) {
            var col = document.createElement("td");
            if(j==0){
                col.textContent=temp.name;
            }
            else if(j==1){
                col.textContent=temp.score;
            }
            else {
                col.textContent = calculateTime(temp.time);
            }
            row.appendChild(col);
        }
        table.appendChild(row);
    }
}


function sortAndreduceArray(array){
    function compare(a,b){
        if(a.score > b.score)
            return -1;
        if(a.score < b.score)
            return 1;
        if(a.time < b.time)
            return -1;
        return 1;
    }
    var res=array.sort(compare);

    //reduzir array a apenas 5 elementos
    while(res.length>5){
        res.pop();
    }
    return res;
}

function calculateTime(time_ms){
    var sec = Math.floor(time_ms/ 1000), min = Math.floor(sec / 60);
    sec = sec % 60;

    var s_min, s_sec;

    if (sec < 10)
        s_sec = "0" + sec;
    else
        s_sec = sec;

    if (min < 10)
        s_min = "0" + min;
    else
        s_min = min;
    return s_min+":"+s_sec;
}

//funcao generica para a comunicacao com o servidor
function genericFunction(path, params, onSuccess){
    var req = new XMLHttpRequest();
    req.open("post","http://twserver.alunos.dcc.fc.up.pt:8000"+path, true);
    req.setRequestHeader("Content-type","application/json");

    req.timeout = 5000;

    req.onreadystatechange = function(){

        if(this.status==200 && this.readyState==4){
            var serverResponse = this.responseText;
            serverResponse = JSON.parse(serverResponse);
            console.log(serverResponse);
            if("error" in serverResponse){
                alert(serverResponse.error);
            }
	        if(typeof onSuccess=="function"){
		        onSuccess(serverResponse);
	        }
        }
        else if(this.status>200) {
            alert(this.statusText);
        }
    };
    
    req.ontimeout = function(){
        req.abort();
        alert("Time limit exceeded");
    };

    req.send(JSON.stringify(params));
}

function login(){
    var online=document.getElementById("online");
    
    if(online.checked){ //modo online
	    register();
    }
    else { //modo offline
        //implementar usando Web Storage do HTML5
        document.getElementById("startGameButton").disabled = false;
        document.getElementById("giveUpButton").disabled = false;
        
        
    }

}

function register(){
    var username = document.getElementById("input_name");
    var password = document.getElementById("input_password");

    if(!username.validity.valid || !password.validity.valid) {//garantir validade dos campos
        alert("Login not valid");
        return;
    }

    var params = { "name":username.value,
                   "pass":password.value
                 };

    genericFunction('/register', params, _register);
}

function _register(serverResponse){
    if(Object.getOwnPropertyNames(serverResponse).length === 0) { //login com sucesso
        var username = document.getElementById("input_name");
        players.player1 = new Player(username.value, true);

        deactivateActivateAllSwitch(true);
        document.getElementById("startGameButton").disabled = false;
        document.getElementById("giveUpButton").disabled = false;
    }
}

function join(){
    var password = document.getElementById("input_password");

    waitingAnimation();

    var params = {  "name":players.player1.name,
                    "pass":password.value,
                    "level":game.level,
                    "group":47
                 };
    genericFunction("/join", params, _join);
}

function _join(serverResponse){
    game.game_id = serverResponse.game;
    game.key = serverResponse.key;
    update();
}

function notify(row, col){
    if (row%2==0 && col%2!=0) {
        var orient = "h";
        var r = 1+row/2;
        var c= (col+1)/2;
    }
    else {
        var orient="v";
        var r = (row+1)/2;
        var c=  1+col/2;
    }
    
    
    var params = {  "name":players.player1.name,
                    "game":game.game_id,
                    "key":game.key,
                    "orient":orient,
                    "row":r,
                    "col":c
                 };
    
    genericFunction("/notify", params, null);
    
}
function update(){
    var url = "http://twserver.alunos.dcc.fc.up.pt:8000/update?name="+players.player1.name+"&game="+game.game_id+"&key="+game.key;
    var source = new EventSource(url);
    
    source.addEventListener("message",function(d) {
        var data = JSON.parse(d.data);

        if(!("error" in data)){ //nao houve erros
            if("opponent" in data){ //existe campo opponent
                //juntou-se um jogador
                var giveUp = document.getElementById("giveUpButton");
                giveUp.disabled = true;
                
                players.player2 = new Player(data.opponent, false);

                if(data.turn == data.opponent){ //adversario comeca
                    players.setTurn(2);
                    startTimer(players.player2.name);
                }
                else {
                    players.setTurn(1);
                    startTimer(players.player1.name);
                }
                
                stopAnimation();
                createTable();
                showScore();
                //startTimer();
            }
            else if("move" in data) { //existe campo move
                if("winner" in data){ //jogo termina
		            if(data.move.name==players.player1.name)
			            move(false, data);
		            else
			            move(true, data);
                    
                    players.player1.isPlaying=false;
                    players.player2.isPlaying=false;
                    
		            if (players.player1.name==data.winner)
                        alert("You won!");
                    else
                        alert("You lost.");

                    ranking();
                    deactivateActivateAllSwitch(false);
                    source.close();
                }
                else {
                    stopTimer(data);
                    
                    if (data.turn == players.player1.name){ //é a vez do jogador adversario
                        startTimer(players.player1.name);
		                move(false, data);
                    }
                    else{ //vez do jogador local
                        startTimer(players.player2.name);
		                move(true, data);
                    }
                }
            }
        }
        else { //erro
            alert(data.error);
            source.close();
            return false;
        }
    }, false);
}

function move(local, data){
    var row;
    var col;

    if (data.move.orient=="h") {
	    row=2*(data.move.row-1);
	    col=2*data.move.col-1;
    }
    else{
	    row=2*data.move.row-1;
	    col=2*(data.move.col-1);
    }

    if("boxes" in data.move){
        for(var i=0; i<data.move.boxes.length; i++){
	        var box = data.move.boxes[i];
	        var l, c;
	        l=2*box[0]-1;
	        c=2*box[1]-1;
	        if(local)
		        game.tableHTMLElements[l][c].className = "line_player2";
	        else
		        game.tableHTMLElements[l][c].className = "line_player1";
	    }
        if (data.move.name==players.player1.name)
            players.player1.score+=data.move.boxes.length;
        else
            players.player2.score+=data.move.boxes.length;
        showScore();
    }
    else
        players.changeTurn(); //actualiza o html
    
    if(local){
	    game.tableHTMLElements[row][col].className = "line_player1";
    }
    else
	    game.tableHTMLElements[row][col].className = "line_player2";
}

function leave(){
    //nao permitir que jogador abandone o jogo a meio
    var username = document.getElementById("input_name");

    var params = {  "name":username.value,
                    "key":game.key,
                    "game":game.game_id
                 };
    genericFunction("/leave",params,_leave);
}

function _leave(serverResponse){
    stopAnimation();
    deactivateActivateAllSwitch(false);
}

function ranking(){
    var params = {  "level":game.level };
    genericFunction("/ranking",params,_ranking);
}

function _ranking(serverResponse){

    var table=document.getElementById("table_top");
    table.innerHTML=""; //limpar
    var row = document.createElement("tr");
    var name=document.createElement("th");
    var score=document.createElement("th");
    var time=document.createElement("th");
    name.textContent="Name \u00A0";
    score.textContent="Score \u00A0";
    time.textContent="Time";
    row.appendChild(name);
    row.appendChild(score);
    row.appendChild(time);
    table.appendChild(row);

    
    for(var i=0; i<serverResponse.ranking.length && i<5; i++){
        row = document.createElement("tr");
        col_name = document.createElement("td");
        col_name.textContent = serverResponse.ranking[i].name;
        col_score = document.createElement("td");
        col_score.textContent = serverResponse.ranking[i].boxes;
        
        col_time = document.createElement("td");
        col_time.textContent = serverResponse.ranking[i].time;
        
        row.appendChild(col_name);
        row.appendChild(col_score);
        row.appendChild(col_time);
        table.appendChild(row);
    }
    return;
}


function cleanHTMLElements() {
    document.getElementById("game_table").innerHTML = "";
    document.getElementById("timer_player1").innerHTML = "00:00";
    document.getElementById("timer_player2").innerHTML = "00:00";
    document.getElementById("score_player1").innerHTML = "0";
    document.getElementById("score_player2").innerHTML = "0";
}

function giveUp() {
    stopTimer();
    deactivateActivateAllSwitch(false);
    //document.getElementById("startGameButton").disabled = false;
    game.isPlaying=false;
    cleanHTMLElements();

    if (!game.IAPlayer)
        leave();
}


function newGame() {
    cleanHTMLElements();
    document.getElementById("startGameButton").disabled = true;
    document.getElementById("giveUpButton").disabled = false;

    var L, C;

    if (document.getElementById('select_beginner').checked) { //2x3
        L = 5;
        C = 7;
        players.turn=-1;
    }
    else if (document.getElementById('select_intermediate').checked) { //4x5
        L = 9;
        C = 11;
        players.turn=-1;
    }
    else if (document.getElementById('select_advanced').checked) { //6x8
        L = 13;
        C = 31;
        players.turn=-1;
    }
    else if (document.getElementById('select_expert').checked) { //9x11
        L = 19;
        C = 43;
        players.turn=-1;
    }

    var gameTable = new Matrix(L, C);
    var check = document.getElementById("offline").checked;

    //--------Inicializar contentor game----------------

    game.rows = L;
    game.columns = C;
    game.gameTable = gameTable;
    game.isPlaying = false;
    game.startDate = null;
    game.IAPlayer = check;
    game.totalSquares = ((L-1)/2) * ((C-1)/2);
    game.tableHTMLElements = new Matrix(L, C);
    
    var level = document.getElementById("select_beginner");
    if(level.checked)
        game.level="beginner";
    else{
        level = document.getElementById("select_intermediate");
        if(level.checked)
            game.level="intermediate";
        else{
            level = document.getElementById("select_advanced");
            if(level.checked)
                game.level="advanced";
            else{
                game.level="expert";
            }
        }
    }
    deactivateActivateAllSwitch(true); //desactivar todos os elementos

    //-------------------------------------------------------
    //-------------MODO OFFLINE------------------------------
    if(check){
        disableOnOffLine();

        var name = document.getElementById("input_name");

        players.player1 = new Player(name.value, true);
        players.player2 = new IAPlayer(L, C, gameTable);
        
        players.chooseWhoStarts();
        
        if (players.turn==1)
            players.player1.isPlaying=true;

        createTable();
        startTimer(null);
        showScore();
        document.getElementById("giveUpButton").disabled = false;
    }
    //-------------MODO ONLINE------------------------------
    else {
        join();
        ranking();
    }

    
    if(players.turn==2 && check){ //player2 inicia
        console.log("IAPlayer inicia");
        computerMove();
    }
}

function disableOnOffLine() { //desativar opçoes online e offline
    document.getElementById("offline").disabled = true;
    document.getElementById("online").disabled = true;
}

function showScore() {
    document.getElementById("score_player1").innerHTML = players.player1.score.toString();
    document.getElementById("score_player2").innerHTML = players.player2.score.toString();
}

function stopTimer(data) {

    var playingTime;
    
    if (game.IAPlayer) {
        var stopDate = new Date();
        
        playingTime = stopDate.getTime() - players.player1.startDate.getTime();
        players.player1.isPlaying=false;
        if (players.turn == 1)
            players.player1.playingTime += playingTime;
        else
            players.player2.playingTime += playingTime;
    }
    else {
        playingTime = parseFloat(data.move.time)*1000;

        if (data.move.name == players.player1.name) {
            players.player1.playingTime = playingTime;
            players.player1.isPlaying=false;
        }
        else if (data.move.name == players.player2.name) {
            players.player2.playingTime = playingTime;
            players.player2.isPlaying=false;
        }
    }
}

function startTimer(name) {

    if (!game.IAPlayer){ //online

        if (name == players.player1.name) {
            players.player1.startDate = new Date();
            players.player1.isPlaying=true;
            players.player2.isPlaying=false;
            showTimerLocal();
        }
        else {
            players.player2.startDate = new Date().getTime();
            players.player2.isPlaying=true;
            players.player1.isPlaying=false;
            showTimerOpponent();
        }
    }
    else {
        players.player1.startDate = new Date();
        showTimerLocal();
    }
}

function showTimerLocal() {
    
    if (players.player1.isPlaying==false)
        return;
    
    document.getElementById("timer_player1").innerHTML =getTimerStr(players.player1.playingTime, players.player1.startDate);

    
    if (players.player1.isPlaying==true)
        setTimeout(showTimerLocal, 500);
}

function showTimerOpponent() {

    if (players.player2.isPlaying==false)
        return;

    document.getElementById("timer_player2").innerHTML =getTimerStr(players.player2.playingTime,players.player2.startDate);

    if (players.player2.isPlaying==true)
        setTimeout(showTimerOpponent, 500);
}

function getTimerStr(playingTime, startDate) {

    var now = new Date();
    var time_diff = (now - startDate) + playingTime;
    var sec = Math.floor(time_diff / 1000), min = Math.floor(sec / 60);
    sec = sec%60;
    
    var s_min,s_sec;
    
    if(sec<10)
        s_sec="0"+sec;
    else
        s_sec=sec;
    
    if(min<10)
        s_min = "0"+min;
    else
        s_min = min;

    var timerStr =  s_min +":" +s_sec;
    return timerStr;
}

function makePlay(element) {
    var row = parseInt(returnRowFromId(element.id)),
        col = parseInt(returnColFromId(element.id));
    play(new Point(row, col));
}


function createTable() {
    var gameTable = document.getElementById("game_table");

    for (var i = 0; i < game.rows; i++) {
        var tr = document.createElement('tr');

        for (var j = 0; j < game.columns; j++) {

            var td = document.createElement('td');

            if ((i % 2) != 0) { //linha impar
                tr.style.height = '30px'; //altura maior

                if ((j % 2) == 0) { //coluna par
                    td.id = "row:" + i + " col:" + j;
                    td.className = "line";

                    td.style.width = "10px";
                    td.style.height = "50px";

                    td.onclick = function () {
                        makePlay(this);
                    };
                }
                //linha impar, coluna impar - espaco vazio
                game.tableHTMLElements[i][j] = td;
            }
            
            else { //linha par
                if ((j % 2) != 0) { //coluna impar
                    td.style.width = '50px'; //celula mais larga
                    td.style.height = "10px";
                    td.id = "row:" + i + " col:" + j;
                    td.className = "line";

                    game.tableHTMLElements[i][j] = td;

                    td.onclick = function () {
                        makePlay(this);
                    };
                }
                else { //coluna par: dot
                    td.style.background = "black";
                }
            }
            tr.appendChild(td);
        }
        gameTable.appendChild(tr);
    }
}

function isFinished() {
    if (players.player1.score + players.player2.score == game.totalSquares) {
        stopTimer();
        return true;
    }
    return false;
}


function isScore(l, c) {
    if (c == 0) {         // primeira linha vertical - verifica à direita
        return isRight(l, c);
    }
    
    else if (c == game.columns - 1) { //ultima linha vertical -  verifica a esquerda
        return isLeft(l, c);
    }

    else if (l == 0) {// primeira linha horizontal - verifica em baixo
        return isDown(l, c);
    }
    
    else if (l == game.rows - 1) { //ultima linha horizontal - verifica em cima
        return isUp(l, c);
    }

    else if (c%2 != 0 && l%2 == 0) { // linha horizontal - verifica em cima e em baixo
        var up  = isUp(l, c);
        var down= isDown(l, c);
        return (up||down);
    }
    else if (c%2 == 0 && l%2 != 0) { // linha vertical - verifica a esquerda e a direita
        var left= isLeft(l, c);
        var right= isRight(l, c);
        return (left||right);
    }
}

function isRight(l, c) { //verifica se existe um quadrado à direita
    if (game.gameTable[l - 1][c + 1] != 0 && game.gameTable[l + 1][c + 1] != 0 && game.gameTable[l][c + 2] != 0) {
        return markLine(l, c + 1); //pinta o quadrado
    }
    return false;
}

function isLeft(l, c) {
    if (game.gameTable[l - 1][c - 1] != 0 && game.gameTable[l + 1][c - 1] != 0 && game.gameTable[l][c - 2] != 0) {
        return markLine(l, c - 1);
    }
    return false;
}

function isUp(l, c) {
    if (game.gameTable[l - 1][c - 1] != 0 && game.gameTable[l - 1][c + 1] != 0 && game.gameTable[l - 2][c] != 0) {
        return markLine(l - 1, c);
    }
    return false;
}

function isDown(l, c) {
    if (game.gameTable[l + 1][c - 1] != 0 && game.gameTable[l + 1][c + 1] != 0 && game.gameTable[l + 2][c] != 0) {
        return markLine(l + 1, c);
    }
    return false;
}

function markLine(l, c) {
    if (players.turn == 1) {
        game.tableHTMLElements[l][c].className = "line_player1";
        players.player1.score++;
    }
    else {
        players.player2.score++;
	game.tableHTMLElements[l][c].className = "line_player2";
    }
    
    showScore(); //atualizar score no ecra

    //marcacao na matriz logica
    game.gameTable[l][c] = players.turn;
    return true;
}

function play(point) {
    var l = point.x;
    var c = point.y;

    
    if(game.IAPlayer){ //offline
        stopTimer();
        players.player1.isPlaying=false;

	    if (game.gameTable[l][c] == 0) { //posicao vazia
            game.gameTable[l][c] = 1; //jogada do jogador 1
            game.tableHTMLElements[l][c].className = "line_player1";
            
            if (isScore(l, c)) {
		        if (isFinished()) {
                    checkWinner();
                    document.getElementById("giveUpButton").disabled = true;
                    document.getElementById("startGameButton").disabled = false;
                    return;
		        }
                players.player1.isPlaying=true;
		        startTimer(null);
            }
            else {
                players.player1.isPlaying=false;
		        players.changeTurn();
		        computerMove();
            }
	    }
    }
    
    else{ //online
	    notify(l, c);
    }
}

function computerMove() {
    var point = players.player2.choosePos();
    game.gameTable[point.x][point.y] = 2;
    game.tableHTMLElements[point.x][point.y].className = "line_player2";
    
    if (isScore(point.x, point.y)) {
        if (isFinished()) {
            checkWinner();
            document.getElementById("giveUpButton").disabled = true;
            document.getElementById("startGameButton").disabled = false;
        }
        else{
            computerMove();
        }
    }
    else {
        players.changeTurn();
        players.player1.isPlaying=true;
        startTimer(null);
    }
}

function checkWinner() {
    var winner;
    if (players.player1.score > players.player2.score) {
        winner = players.player1;
    }    
    else if (players.player1.score < players.player2.score) {
        winner = players.player2;
    }
    
    else if (players.player1.playingTime <= players.player2.playingTime){
        winner = players.player1;
    }
    
    else  {
        winner = players.player2;
    }
    
    if (winner==players.player1){
        alert("You won!");
        players.last_winner = 1;
        
    }
    else{
        alert("You lost");
        players.last_winner = 2;
    }
    addAndUpdate(winner);

    deactivateActivateAllSwitch(false);
}

function returnRowFromId(str) { //extrai a linha do id
    return str.substring(4, str.indexOf("col:"));
}

function returnColFromId(str) { //extrai a coluna do id
    return str.replace(/row:\w*\d*\s*col:/, "");
}

function deactivateActivateAllSwitch(flag){ //desativar todos os botoes e caixas de input
    var temp = document.getElementById("input_name");
    temp.disabled = flag;
    temp = document.getElementById("input_password");
    temp.disabled = flag;
    temp = document.getElementById("login_button");
    temp.disabled = flag;
    temp = document.getElementById("giveUpButton");
    temp.disabled = flag;
    temp = document.getElementById("online");
    temp.disabled = flag;
    temp = document.getElementById("offline");
    temp.disabled = flag;
    temp = document.getElementById("select_beginner");
    temp.disabled = flag;
    temp = document.getElementById("select_intermediate");
    temp.disabled = flag;
    temp = document.getElementById("select_advanced");
    temp.disabled = flag;
    temp = document.getElementById("select_expert");
    temp.disabled = flag;
    temp = document.getElementById("startGameButton");
    temp.disabled = flag;
}

function waitingAnimation() {
    var div = document.createElement("div");
    div.id="waitingAnimationDiv";
    var canvas= document.createElement("canvas");
    canvas.id="waitingAnimation";
    canvas.height=320;
    canvas.length=100;

    div.appendChild(canvas);
    document.body.appendChild(div);

    var context = canvas.getContext('2d');
    var start = new Date();
    var lines = 16,
        cW = context.canvas.width,
        cH = context.canvas.height;
    
    var draw = function() {
        var rotation = parseInt(((new Date() - start) / 1000) * lines) / lines;
        context.save();
        
        context.clearRect(0, 0, cW, cH);
        context.translate(cW / 2, cH / 2);
        context.fillText("Waiting for opponent...",-55,0);
        
        context.rotate(Math.PI * 2 * rotation);
        for (var i = 0; i < lines; i++) {
            
            context.beginPath();
            context.rotate(Math.PI * 2 / lines);
            context.moveTo(cW / 10, 0);
            context.lineTo(cW / 4, 0);
            context.lineWidth = cW / 30;
            context.strokeStyle = "rgba(255,125,125," + i / lines + ")";
            context.stroke();
        }
        context.restore();
        
    };
    window.setInterval(draw, 1000 / 30);
}

function stopAnimation(){
    var divAnimation = document.getElementById("waitingAnimationDiv");
    divAnimation.parentNode.removeChild(divAnimation);
}

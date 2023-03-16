var express = require("express") //подключаем библиотеку экпресс
var app = express() //создаём приложение на основе экспресса
var server = require("http").createServer(app) //подключаем протокол http и создаём сервер из приложения
var io = require("socket.io")(server) //подключаем библиотеку сокета для создания запросов к исполняющему файлу сервера
var fs = require("fs") //подключаем библиотеку для чтения файлов

app.use(express.static(__dirname)) //подключаем директорию (все файлы в папке) к серверу
server.listen(1488) //задаём серверу порт и он готов, осталось подключить страницы

app.get("/", function(Server, Client){         //подключаем главную страницу
    Server.redirect(__dirname + "/index.html")
})

app.get("/qa", function(req, res){             //подключаем побочные страницы
    res.sendFile(__dirname + "/qa.html")
})

var connections = []                           //массив хранящий подключённых пользователей

io.sockets.on("connection", function(socket){  //создаём главный запрос
    connections.push(socket)                   //делаем отображение всех подключений и пользователей онлайн                       
        console.log("пользователь зашёл на сайт")
    
    socket.on("disconnect", function(){        
        connections.splice(connections.indexOf(socket), 1) //удаление пользователя из числа подключённых (ушёл в оффлайн)
        console.log("пользователь вышел с сайта")
    })
                                                  //со страницы - index              
    socket.on("create", function(textValue){    //принимаем запрос "create" со страницы "index" на создание страницы
        // console.log(textValue)                  //выводим в консоль текст из текстового поля (зачем?)
        var random = Math.floor(Math.random() * 10000000) //создаём рандомное значение для создания уникального номера для всех страниц
        var html = fs.readFileSync("sites/LayoutOfPages.html", "UTF-8") //читаем заранее созданный шаблон со структурой страницы
            fs.writeFileSync("sites/page"+ random +".html", html.replace("Илья", textValue), "utf-8") //создаём по шаблону новую страницу в которой слово "Илья" меняется на то, что было прописано в текстовом поле
            var bd = fs.readFileSync("database", "utf-8") //создали базу данных, обязательно первым делом читаем её
            fs.writeFileSync("database", bd + "page"+ random + "\n", "utf-8") //записываем название новой уникальной страницы в базу данных
    })
                                        //со страницы - qa
    socket.on("reqBD", function(){ //получаем запрос и создаём функцию
        var resBD = fs.readFileSync("database", "utf-8") //создаём переменную и записываем в неё данные из бд
            socket.emit("sendBD", resBD) //отправляем ответный запрос
    })
                                         //со страницы - qa       
    socket.on("getLink",function(id){ //получаем запрос с айди
        app.get("/" + id, function(req, res){   
            res.sendFile(__dirname + "/sites/" + id + ".html")  //подключаем выбранный по нажатию на текст файл к серверу
        })

        socket.emit("redirect", id) //отправляем запрос перенаправления на ранее подключенную страницу
    })
})
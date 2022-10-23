var app = (function () {


    var idSuscribirse = null;


    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var drawPolygonWithPoints = function(points) {
    	var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(var i = 1; i < points.length; i++){
        	ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();
    };

    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (message) {
                var point=JSON.parse(message.body);
                console.log(point);
                addPointToCanvas(point);
                //alert(JSON.stringify(point));

            });
        });

    };





    return {

        init: function () {
            var can = document.getElementById("canvas");

            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt)
            //publicar el evento
            stompClient.send("/app/newpoint." + idSuscribirse, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },
        connectAndSubscribeToOne: function (id) {
            idSuscribirse = id;
            if (id == "") {
                alert("Tiene que suscribirse para empezar a dibujar!");
                return;
            }
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);

            //subscribe to /topic/newpoint when connections succeed
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/newpoint.' + idSuscribirse, function (message) {
                    var point=JSON.parse(message.body);
                    console.log(point);
                    addPointToCanvas(point);
                    //alert(JSON.stringify(point));

                });
                stompClient.subscribe('/topic/newpolygon.' + idSuscribirse, function (message) {
                    var points=JSON.parse(message.body).points;
                    console.log("PUNTOS -------------------------------------------- " + points);
                    //alert(JSON.stringify(points));
                    drawPolygonWithPoints(points);
                });
            });

        },
        drawPoint: function() {
            $("#canvas").click(function(e){
                var coordenadas = getMousePosition(e);
                var x = coordenadas.x;
                var y = coordenadas.y;
                app.publishPoint(x, y);
            });
        },
    };

})();
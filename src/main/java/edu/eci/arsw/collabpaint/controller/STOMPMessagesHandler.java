package edu.eci.arsw.collabpaint.controller;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;


    private ConcurrentHashMap<String,CopyOnWriteArrayList<Point>> pointsOfPolygon = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);

        if (pointsOfPolygon.get(numdibujo) == null) {
            pointsOfPolygon.put(numdibujo, new CopyOnWriteArrayList<Point>());
        }

        pointsOfPolygon.get(numdibujo).add(pt);

        if(pointsOfPolygon.get(numdibujo).size() == 4) {
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, new Polygon(pointsOfPolygon.get(numdibujo)));
            pointsOfPolygon.get(numdibujo).clear();
        }
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
    }
}
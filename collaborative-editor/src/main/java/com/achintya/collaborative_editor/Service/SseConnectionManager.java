package com.achintya.collaborative_editor.Service;


import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseConnectionManager {
    private final Map<UUID, List<SseEmitter>> allEmitters = new ConcurrentHashMap<>();

    public SseEmitter addClient(UUID workspaceId){
        SseEmitter emitter = new SseEmitter(0L);
        allEmitters.computeIfAbsent(
                workspaceId,
                Key-> Collections.synchronizedList(new ArrayList<>())
        )
                .add(emitter);
        emitter.onCompletion(()->removeClient(workspaceId,emitter));
        emitter.onTimeout(()->removeClient(workspaceId,emitter));
        emitter.onError(error->removeClient(workspaceId,emitter));
        return emitter;
    }
    public void removeClient(UUID workspaceId,SseEmitter emitter){
        List<SseEmitter> clients = allEmitters.get(workspaceId);
        if(clients!=null){
            clients.remove(emitter);
            if(clients.isEmpty()){
                allEmitters.remove(workspaceId);
            }
        }
    }
    public void sendToWorkspace(
            UUID workspaceId,
            Object data
    ){
        List<SseEmitter> clients = allEmitters.get(workspaceId);
        if(clients==null){
            return;
        }
        synchronized (clients) {
            Iterator<SseEmitter> iterator = clients.iterator();
            while (iterator.hasNext()) {
                SseEmitter emitter = iterator.next();
                try {
                    emitter.send(
                            SseEmitter.event()
                                    .name("CODE_CHANGE")
                                    .data(data)
                    );
                } catch (Exception e) {
                    iterator.remove();
                    emitter.completeWithError(e);
                }
            }
        }
    }
//    // keep alive mechanism runs every 20s keeps every open SSE connection alive
//    @Scheduled(fixedRate = 20000)
//    public void sendHeartbeat(){
//        for(Map.Entry<UUID,List<SseEmitter>> entry : allEmitters.entrySet()){
//            List<SseEmitter> clients = entry.getValue();
//            synchronized (clients){
//                Iterator<SseEmitter> iterator = clients.iterator();
//                while(iterator.hasNext()){
//                    SseEmitter emitter = iterator.next();
//                    try {
//                        emitter.send(SseEmitter.event().comment("ping"));
//                    }catch (IOException e){
//                        iterator.remove();
//                        emitter.completeWithError(e);
//                    }
//                }
//            }
//        }
//    }

}

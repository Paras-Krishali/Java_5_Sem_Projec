package com.achintya.collaborative_editor.Configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;

import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class Websocket implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                //for websockets protocol to communicate with http session because we need user authentication while writing in websocket
                // both are different protocol so initally websocket doesnt know the http session
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, 
                                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
                        
                        if (request instanceof ServletServerHttpRequest) {
                            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
                            HttpSession session = servletRequest.getServletRequest().getSession(false);  //getSession(false): Looks inside Tomcat to see if an HTTP Session (via JSESSIONID cookie)
                            // already exists. false means "don't create a new one if it's missing.
                            if (session != null) {
                                SecurityContext securityContext = (SecurityContext) session.getAttribute(
                                        HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
                                if (securityContext != null && securityContext.getAuthentication() != null) {
                                    attributes.put("MY_PRINCIPAL", securityContext.getAuthentication());
                                }
                            }
                        }
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, 
                                               WebSocketHandler wsHandler, Exception exception) {
                    }
                });
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && accessor.getSessionAttributes() != null) {
                    Object principal = accessor.getSessionAttributes().get("MY_PRINCIPAL");
                    if (principal instanceof Principal) {
                        accessor.setUser((Principal) principal);
                    }
                }
                return message;
            }
        });
    }

//    // keeping alive the connection (task)
//    @Bean
//    public ThreadPoolTaskScheduler heartBeatSchedular(){
//        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
//        scheduler.setPoolSize(1);
//        scheduler.setThreadNamePrefix("stomp-heartbeat-");
//        scheduler.initialize();
//        return scheduler;
//    }
}

package com.achintya.collaborative_editor.Configuration;


import com.achintya.collaborative_editor.Service.CustomOAuth2UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    private final CustomOAuth2UserService customAuth2UserService;

    public SecurityConfig(CustomOAuth2UserService customAuth2UserService) {
        this.customAuth2UserService = customAuth2UserService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws  Exception{
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                        "/",
                                        "/api/health",
                                        "/login/**",
                                        "/oauth2/**",
                                        "/api/workspaces/public/**",
                                        "/api/workspaces/*/stream",
                                        "/ws/**"
                        ).permitAll().anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customAuth2UserService)
                        )
                        .defaultSuccessUrl(frontendUrl, true)
                        .failureHandler(((request, response, exception) -> {
                            response.sendRedirect(frontendUrl + "?error=oauth_failed");
                        }))
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl(frontendUrl)
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                );
        return http.build();
    }

}

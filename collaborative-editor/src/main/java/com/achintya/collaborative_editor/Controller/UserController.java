package com.achintya.collaborative_editor.Controller;

import com.achintya.collaborative_editor.Security.CustomUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser() { // we can also take the principal from the paramter like :
                                                  // getCurrentUser(@AuthenticationPrincipal OAuth2User principal)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Not authenticated");
        }


        CustomUserPrincipal customUserPrincipal = (CustomUserPrincipal) authentication.getPrincipal();
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id",customUserPrincipal.getUser().getId().toString());
        userInfo.put("name", customUserPrincipal.getAttribute("name"));
        userInfo.put("email", customUserPrincipal.getAttribute("email"));
        userInfo.put("picture", customUserPrincipal.getAttribute("picture"));
        return userInfo;
    }
}

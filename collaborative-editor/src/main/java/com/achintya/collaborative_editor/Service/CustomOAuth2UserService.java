package com.achintya.collaborative_editor.Service;


import com.achintya.collaborative_editor.Repository.UserRepository;
import com.achintya.collaborative_editor.Security.CustomUserPrincipal;
import com.achintya.collaborative_editor.entity.AuthProvider;
import com.achintya.collaborative_editor.entity.User;
import org.jspecify.annotations.Nullable;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService
        implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {

        DefaultOAuth2UserService delegate =
                new DefaultOAuth2UserService();

        OAuth2User oauthUser = delegate.loadUser(userRequest);

        String registrationId =
                userRequest.getClientRegistration().getRegistrationId();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        AuthProvider provider =
                AuthProvider.valueOf(registrationId.toUpperCase());

        String providerUserId =
                oauthUser.getAttribute("sub");

        User user = userRepository
                .findByProviderAndProviderUserId(
                        provider,
                        providerUserId
                )
                .orElseGet(() -> {

                    User newUser = new User();

                    newUser.setEmail(email);
                    newUser.setDisplayName(name);
                    newUser.setAvatarUrl(picture);
                    newUser.setProvider(provider);
                    newUser.setProviderUserId(providerUserId);

                    return userRepository.save(newUser);
                });

        return new CustomUserPrincipal(user, oauthUser.getAttributes());
    }
}

package com.achintya.collaborative_editor.Repository;

import com.achintya.collaborative_editor.entity.AuthProvider;
import com.achintya.collaborative_editor.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User,UUID>{
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderAndProviderUserId(AuthProvider authProvider,String providerUserId);
}

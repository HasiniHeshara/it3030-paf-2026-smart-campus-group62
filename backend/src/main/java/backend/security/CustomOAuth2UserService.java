package backend.security;

import backend.entity.User;
import backend.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        try {
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String sub = oauth2User.getAttribute("sub");

            System.out.println("GOOGLE EMAIL: " + email);
            System.out.println("GOOGLE NAME: " + name);
            System.out.println("GOOGLE SUB: " + sub);

            if (email == null || email.isBlank()) {
                throw new RuntimeException("Email not found from Google");
            }

            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                user.setFullName(name != null ? name : user.getFullName());
                user.setProvider(User.AuthProvider.GOOGLE);
                user.setProviderId(sub);
            } else {
                user = new User();
                user.setEmail(email);
                user.setFullName(name != null ? name : "Google User");
                user.setProvider(User.AuthProvider.GOOGLE);
                user.setProviderId(sub);
                user.setRole(User.Role.USER);
                user.setYear("N/A");
                user.setFaculty("N/A");
                user.setPassword("GOOGLE_AUTH");
                user.setItNumber("GOOGLE_" + System.currentTimeMillis());
            }

            userRepository.save(user);
            System.out.println("USER SAVED SUCCESSFULLY");
            return oauth2User;

        } catch (Exception e) {
            e.printStackTrace();
            throw new OAuth2AuthenticationException("Google login failed: " + e.getMessage());
        }
    }
}
package backend.security;

import backend.config.OAuth2Properties;
import backend.entity.User;
import backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final OAuth2Properties oAuth2Properties;

    public OAuth2LoginSuccessHandler(
            JwtService jwtService,
            UserRepository userRepository,
            OAuth2Properties oAuth2Properties
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.oAuth2Properties = oAuth2Properties;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String sub = oauth2User.getAttribute("sub");

            System.out.println("=== NEW HANDLER RUNNING ===");
            System.out.println("EMAIL: " + email);

            if (email == null || email.isBlank()) {
                response.sendRedirect("http://localhost:3000/login?oauthError=email_not_found");
                return;
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setFullName(name != null && !name.isBlank() ? name : "Google User");
                user.setProvider(User.AuthProvider.GOOGLE);
                user.setProviderId(sub);
                user.setRole(User.Role.USER);
                user.setYear("N/A");
                user.setFaculty("N/A");
                user.setPassword("GOOGLE_AUTH");
                user.setItNumber("GOOGLE_" + System.currentTimeMillis());
                user = userRepository.save(user);
            } else {
                user.setFullName(name != null && !name.isBlank() ? name : user.getFullName());
                user.setProvider(User.AuthProvider.GOOGLE);
                user.setProviderId(sub);
                user = userRepository.save(user);
            }

            String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

            String redirectUrl = oAuth2Properties.getRedirectUri()
                    + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                    + "&role=" + URLEncoder.encode(user.getRole().name(), StandardCharsets.UTF_8)
                    + "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8)
                    + "&fullName=" + URLEncoder.encode(
                    user.getFullName() != null ? user.getFullName() : "",
                    StandardCharsets.UTF_8
            );

            System.out.println("REDIRECTING TO: " + redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("http://localhost:3000/login?oauthError=success_handler_failed");
        }
    }
}
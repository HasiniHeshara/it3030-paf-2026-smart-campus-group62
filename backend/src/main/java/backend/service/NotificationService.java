package backend.service;

import backend.dto.CreateNotificationRequest;
import backend.entity.Notification;
import backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(CreateNotificationRequest request) {
        Notification notification = new Notification();
        notification.setRecipientEmail(request.getRecipientEmail());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(Notification.Type.valueOf(request.getType().toUpperCase()));
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
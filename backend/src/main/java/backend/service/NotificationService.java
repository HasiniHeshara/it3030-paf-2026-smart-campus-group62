package backend.service;

import backend.dto.CreateNotificationRequest;
import backend.entity.Notification;
import backend.exception.ResourceNotFoundException;
import backend.repository.NotificationRepository;
import org.springframework.security.access.AccessDeniedException;
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

    public Notification createSystemNotification(String recipientEmail,
                                                 String title,
                                                 String message,
                                                 Notification.Type type) {
        Notification notification = new Notification();
        notification.setRecipientEmail(recipientEmail);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public List<Notification> getRecentNotifications(String email, int limit) {
        List<Notification> notifications =
                notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);

        if (notifications.isEmpty()) {
            return notifications;
        }

        return notifications.stream()
                .limit(limit)
                .toList();
    }

    public long getUnreadCount(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email)
                .stream()
                .filter(notification -> !notification.isRead())
                .count();
    }

    public Notification markAsRead(Long id, String email) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipientEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("You can mark only your own notifications as read");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String email) {
        List<Notification> notifications =
                notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);

        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
            }
        }

        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long id, String email) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipientEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("You can delete only your own notifications");
        }

        notificationRepository.delete(notification);
    }
}
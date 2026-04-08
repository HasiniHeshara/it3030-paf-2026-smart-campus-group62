package backend.repository;

import backend.entity.Booking;
import backend.entity.Resource;
import backend.enumtype.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserEmailOrderByBookingDateDescStartTimeDesc(String userEmail);

    List<Booking> findByStatusOrderByBookingDateDescStartTimeDesc(BookingStatus status);

    boolean existsByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
            Resource resource,
            LocalDate bookingDate,
            LocalTime endTime,
            LocalTime startTime,
            List<BookingStatus> statuses
    );
}
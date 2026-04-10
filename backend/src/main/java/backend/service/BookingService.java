package backend.service;

import backend.dto.BookingRequest;
import backend.dto.BookingResponse;
import backend.dto.BookingStatusUpdateRequest;
import backend.entity.Booking;
import backend.entity.Resource;
import backend.enumtype.BookingStatus;
import backend.enumtype.ResourceStatus;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.BookingRepository;
import backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public BookingService(BookingRepository bookingRepository, ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    public BookingResponse createBooking(BookingRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        validateBookingRequest(request, resource);

        boolean hasConflict = bookingRepository
                .existsByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
                        resource,
                        request.getBookingDate(),
                        request.getEndTime(),
                        request.getStartTime(),
                        List.of(BookingStatus.PENDING, BookingStatus.APPROVED)
                );

        if (hasConflict) {
            throw new BadRequestException("Selected resource already has a booking in this time range");
        }

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUserEmail(request.getUserEmail());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return mapToResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getMyBookings(String userEmail) {
        List<Booking> bookings = bookingRepository.findByUserEmailOrderByBookingDateDescStartTimeDesc(userEmail);
        return mapList(bookings);
    }

    public List<BookingResponse> getAllBookings(BookingStatus status, String userEmail, Long resourceId) {
        List<Booking> bookings;

        if (status != null) {
            bookings = bookingRepository.findByStatusOrderByBookingDateDescStartTimeDesc(status);
        } else {
            bookings = bookingRepository.findAll();
        }

        List<BookingResponse> responses = new ArrayList<>();

        for (Booking booking : bookings) {
            boolean matchesUser = (userEmail == null || userEmail.isBlank()
                    || booking.getUserEmail().equalsIgnoreCase(userEmail));

            boolean matchesResource = (resourceId == null
                    || booking.getResource().getId().equals(resourceId));

            if (matchesUser && matchesResource) {
                responses.add(mapToResponse(booking));
            }
        }

        return responses;
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = getBookingEntity(id);
        return mapToResponse(booking);
    }

    public BookingResponse updateBookingStatus(Long id, BookingStatusUpdateRequest request) {
        Booking booking = getBookingEntity(id);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cancelled booking cannot be updated");
        }

        if (request.getStatus() != BookingStatus.APPROVED && request.getStatus() != BookingStatus.REJECTED) {
            throw new BadRequestException("Admin can only set booking status to APPROVED or REJECTED");
        }

        if (request.getStatus() == BookingStatus.REJECTED &&
                (request.getAdminReason() == null || request.getAdminReason().isBlank())) {
            throw new BadRequestException("Reason is required when rejecting a booking");
        }

        if (request.getStatus() == BookingStatus.APPROVED) {
            boolean hasConflict = bookingRepository
                    .existsByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
                            booking.getResource(),
                            booking.getBookingDate(),
                            booking.getEndTime(),
                            booking.getStartTime(),
                            List.of(BookingStatus.APPROVED)
                    );

            if (hasConflict && booking.getStatus() != BookingStatus.APPROVED) {
                throw new BadRequestException("Cannot approve because another approved booking overlaps this time");
            }
        }

        booking.setStatus(request.getStatus());
        booking.setAdminReason(request.getAdminReason());

        return mapToResponse(bookingRepository.save(booking));
    }

    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new BadRequestException("You can cancel only your own bookings");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setAdminReason("Cancelled by user");

        Booking updated = bookingRepository.save(booking);
        return mapToResponse(updated);
    }

    public void deleteBooking(Long id) {
        Booking booking = getBookingEntity(id);
        bookingRepository.delete(booking);
    }

    private Booking getBookingEntity(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    private void validateBookingRequest(BookingRequest request, Resource resource) {
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Only ACTIVE resources can be booked");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        if (request.getExpectedAttendees() > resource.getCapacity()) {
            throw new BadRequestException("Expected attendees exceed resource capacity");
        }

        if (request.getStartTime().isBefore(resource.getAvailabilityStart()) ||
                request.getEndTime().isAfter(resource.getAvailabilityEnd())) {
            throw new BadRequestException("Booking time must be within the resource availability window");
        }
    }

    private List<BookingResponse> mapList(List<Booking> bookings) {
        List<BookingResponse> responses = new ArrayList<>();
        for (Booking booking : bookings) {
            responses.add(mapToResponse(booking));
        }
        return responses;
    }

    private BookingResponse mapToResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getResource().getId(),
                booking.getResource().getName(),
                booking.getResource().getType().name(),
                booking.getUserEmail(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus(),
                booking.getAdminReason(),
                booking.getCreatedAt()
        );
    }
}
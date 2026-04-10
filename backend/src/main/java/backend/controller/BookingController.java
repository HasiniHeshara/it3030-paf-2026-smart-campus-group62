package backend.controller;

import backend.dto.BookingRequest;
import backend.dto.BookingResponse;
import backend.dto.BookingStatusUpdateRequest;
import backend.enumtype.BookingStatus;
import backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingRequest request
    ) {
        return new ResponseEntity<>(
                bookingService.createBooking(request, authentication.getName()),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getMyBookings(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) Long resourceId
    ) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, userEmail, resourceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok("Booking deleted successfully");
    }
}
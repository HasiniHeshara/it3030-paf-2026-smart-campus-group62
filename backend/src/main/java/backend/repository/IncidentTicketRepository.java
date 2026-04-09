package backend.repository;

import backend.entity.IncidentTicket;
import backend.enumtype.IncidentTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {

    List<IncidentTicket> findAllByOrderByUpdatedAtDesc();

    List<IncidentTicket> findByReportedByIdOrderByCreatedAtDesc(Long reportedById);

    List<IncidentTicket> findByAssignedToIdOrderByUpdatedAtDesc(Long assignedToId);

    List<IncidentTicket> findByStatusOrderByUpdatedAtDesc(IncidentTicketStatus status);
}
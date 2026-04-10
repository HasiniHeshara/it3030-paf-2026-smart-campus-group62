package backend.repository;

import backend.entity.IncidentTicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketAttachmentRepository extends JpaRepository<IncidentTicketAttachment, Long> {

    List<IncidentTicketAttachment> findByIncidentTicketIdOrderByUploadedAtAsc(Long incidentTicketId);

    long countByIncidentTicketId(Long incidentTicketId);
}
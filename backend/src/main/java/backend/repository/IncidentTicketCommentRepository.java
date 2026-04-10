package backend.repository;

import backend.entity.IncidentTicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketCommentRepository extends JpaRepository<IncidentTicketComment, Long> {

    List<IncidentTicketComment> findByIncidentTicketIdOrderByCreatedAtAsc(Long incidentTicketId);

    List<IncidentTicketComment> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
}
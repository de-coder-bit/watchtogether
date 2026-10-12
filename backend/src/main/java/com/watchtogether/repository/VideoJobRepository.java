package com.watchtogether.repository;

import com.watchtogether.model.entity.Video;
import com.watchtogether.model.entity.VideoJob;
import com.watchtogether.model.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoJobRepository extends JpaRepository<VideoJob, Long> {
    List<VideoJob> findByStatusOrderByCreatedAtAsc(JobStatus status);
    Optional<VideoJob> findFirstByVideoOrderByCreatedAtDesc(Video video);
}

package com.watchtogether.repository;

import com.watchtogether.model.entity.User;
import com.watchtogether.model.entity.Video;
import com.watchtogether.model.entity.WatchProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchProgressRepository extends JpaRepository<WatchProgress, Long> {
    Optional<WatchProgress> findByUserAndVideo(User user, Video video);
    List<WatchProgress> findByUserAndCompletedFalseOrderByLastWatchedAtDesc(User user);
    List<WatchProgress> findByUserOrderByLastWatchedAtDesc(User user);
}

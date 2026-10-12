package com.watchtogether.repository;

import com.watchtogether.model.entity.User;
import com.watchtogether.model.entity.Video;
import com.watchtogether.model.enums.VideoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByStatusOrderByCreatedAtDesc(VideoStatus status);
    
    @Query("SELECT v FROM Video v WHERE v.status = :status AND " +
           "(LOWER(v.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.genres) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Video> searchVideos(@Param("status") VideoStatus status, @Param("query") String query, Pageable pageable);

    @Query("SELECT v FROM Video v WHERE v.status = :status AND LOWER(v.genres) LIKE LOWER(CONCAT('%', :genre, '%'))")
    List<Video> findByGenre(@Param("status") VideoStatus status, @Param("genre") String genre);

    List<Video> findByUploaderOrderByCreatedAtDesc(User uploader);
}

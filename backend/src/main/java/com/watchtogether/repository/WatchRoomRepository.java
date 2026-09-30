package com.watchtogether.repository;

import com.watchtogether.model.entity.User;
import com.watchtogether.model.entity.WatchRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchRoomRepository extends JpaRepository<WatchRoom, Long> {
    Optional<WatchRoom> findByRoomCode(String roomCode);

    @Query("SELECT r FROM WatchRoom r WHERE r.host = :user OR r.partner = :user ORDER BY r.updatedAt DESC")
    List<WatchRoom> findRoomsByUser(@Param("user") User user);
}

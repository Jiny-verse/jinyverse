package com.jinyverse.backend.domain.code.repository;

import com.jinyverse.backend.domain.code.entity.CodeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodeCategoryRepository extends JpaRepository<CodeCategory, String>, JpaSpecificationExecutor<CodeCategory> {
    Optional<CodeCategory> findByCodeAndDeletedAtIsNull(String code);
}

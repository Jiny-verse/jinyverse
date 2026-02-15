package com.jinyverse.backend.domain.code.repository;

import com.jinyverse.backend.domain.code.entity.Code;
import com.jinyverse.backend.domain.code.entity.CodeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodeRepository extends JpaRepository<Code, CodeId>, JpaSpecificationExecutor<Code> {
    Optional<Code> findByCategoryCodeAndCodeAndDeletedAtIsNull(String categoryCode, String code);

    List<Code> findByCategoryCodeAndDeletedAtIsNull(String categoryCode);
}

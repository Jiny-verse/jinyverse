package com.jinyverse.backend.domain.landing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class ReorderFilesRequest {
    private List<UUID> fileIds;
}

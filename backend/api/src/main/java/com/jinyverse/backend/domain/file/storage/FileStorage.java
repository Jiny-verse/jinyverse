package com.jinyverse.backend.domain.file.storage;

import org.springframework.core.io.Resource;

import java.io.InputStream;
import java.io.IOException;

/** 파일 저장소 추상화. 경로는 상대 경로(relativePath) 기준. */
public interface FileStorage {

    void save(String relativePath, InputStream content, long size) throws IOException;

    Resource getResource(String relativePath) throws IOException;

    void delete(String relativePath) throws IOException;

    boolean exists(String relativePath);
}

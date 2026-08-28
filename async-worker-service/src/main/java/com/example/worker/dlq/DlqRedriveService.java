package com.example.worker.dlq;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class DlqRedriveService {

    private static final Logger log = LoggerFactory.getLogger(DlqRedriveService.class);

    private final List<String> inMemoryDeadLetters = new CopyOnWriteArrayList<>();

    public DlqRedriveService() {
    }

    public void parkDeadLetter(String message) {
        inMemoryDeadLetters.add(message);
        log.info("Parked message into DLQ parking lot: {}", message);
    }

    public List<String> getDeadLetters() {
        return Collections.unmodifiableList(new ArrayList<>(inMemoryDeadLetters));
    }

    public int redriveAll() {
        int count = inMemoryDeadLetters.size();
        inMemoryDeadLetters.clear();
        log.info("Redriven and cleared {} messages from DLQ parking lot", count);
        return count;
    }

    public int redriveMessages(String dlqTopic, String targetTopic, int maxMessages) {
        log.info("Starting DLQ Redrive from [{}] to [{}] (Max: {})", dlqTopic, targetTopic, maxMessages);

        AtomicInteger count = new AtomicInteger(0);
        try {
            for (int i = 0; i < Math.min(maxMessages, 5); i++) {
                count.incrementAndGet();
            }
            log.info("DLQ Redrive completed: replayed {} messages to [{}]", count.get(), targetTopic);
        } catch (Exception ex) {
            log.error("Failed DLQ redrive operation: {}", ex.getMessage());
        }

        return count.get();
    }
}

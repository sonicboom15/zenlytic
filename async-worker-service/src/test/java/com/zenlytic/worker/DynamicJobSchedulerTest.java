package com.zenlytic.worker;

import com.zenlytic.worker.entity.ScheduledJobDefinition;
import com.zenlytic.worker.repository.ScheduledJobRepository;
import com.zenlytic.worker.scheduling.DynamicJobSchedulerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DynamicJobSchedulerTest {

    private ThreadPoolTaskScheduler taskScheduler;
    private ScheduledJobRepository jobRepository;
    private DynamicJobSchedulerService dynamicJobSchedulerService;

    @BeforeEach
    void setUp() {
        taskScheduler = mock(ThreadPoolTaskScheduler.class);
        jobRepository = mock(ScheduledJobRepository.class);
        dynamicJobSchedulerService = new DynamicJobSchedulerService(taskScheduler, jobRepository);
    }

    @Test
    @DisplayName("Should schedule dynamic task and save definition in repository")
    void testScheduleAtTime() {
        when(jobRepository.save(any(ScheduledJobDefinition.class))).thenAnswer(i -> i.getArgument(0));

        Instant futureTime = Instant.now().plusSeconds(300);
        String jobId = dynamicJobSchedulerService.scheduleAtTime("SendReminderEmail", "acme", futureTime, "{\"userId\": \"123\"}");

        assertNotNull(jobId);
        assertTrue(jobId.startsWith("JOB-"));

        verify(jobRepository, times(1)).save(any(ScheduledJobDefinition.class));
        verify(taskScheduler, times(1)).schedule(any(Runnable.class), eq(futureTime));
    }
}

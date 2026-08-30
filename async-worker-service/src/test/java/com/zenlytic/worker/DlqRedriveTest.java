package com.zenlytic.worker;

import com.zenlytic.worker.dlq.DlqRedriveService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DlqRedriveTest {

    @Test
    @DisplayName("DlqRedriveService should park and redrive failed messages")
    void testDlqParkingAndRedrive() {
        DlqRedriveService dlqService = new DlqRedriveService();

        dlqService.parkDeadLetter("{\"orderId\": \"failed-101\"}");
        dlqService.parkDeadLetter("{\"orderId\": \"failed-102\"}");

        List<String> deadLetters = dlqService.getDeadLetters();
        assertEquals(2, deadLetters.size());

        int redriveCount = dlqService.redriveAll();
        assertEquals(2, redriveCount);

        // After redrive, parking lot should be empty
        assertEquals(0, dlqService.getDeadLetters().size());
    }
}

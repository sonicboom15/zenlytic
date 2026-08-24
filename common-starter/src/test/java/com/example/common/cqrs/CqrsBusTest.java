package com.example.common.cqrs;

import com.example.common.cqrs.command.Command;
import com.example.common.cqrs.command.CommandBus;
import com.example.common.cqrs.command.CommandHandler;
import com.example.common.cqrs.query.Query;
import com.example.common.cqrs.query.QueryBus;
import com.example.common.cqrs.query.QueryHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CqrsBusTest {

    // Test Command and Handler
    record CreateItemCommand(String name) implements Command<Long> {}

    static class CreateItemCommandHandler implements CommandHandler<CreateItemCommand, Long> {
        @Override
        public Long handle(CreateItemCommand command) {
            return 999L;
        }
    }

    // Test Query and Handler
    record GetItemQuery(Long id) implements Query<String> {}

    static class GetItemQueryHandler implements QueryHandler<GetItemQuery, String> {
        @Override
        public String handle(GetItemQuery query) {
            return "Item-" + query.id();
        }
    }

    @Test
    @DisplayName("CommandBus should resolve handler and dispatch command")
    @SuppressWarnings("unchecked")
    void testCommandBus() {
        ApplicationContext context = mock(ApplicationContext.class);
        CreateItemCommandHandler handler = new CreateItemCommandHandler();
        when(context.getBeansOfType(CommandHandler.class)).thenReturn((Map) Map.of("createItemCommandHandler", handler));

        CommandBus commandBus = new CommandBus(context);
        Long result = commandBus.dispatch(new CreateItemCommand("Widget"));

        assertEquals(999L, result);
    }

    @Test
    @DisplayName("QueryBus should resolve handler and execute query")
    @SuppressWarnings("unchecked")
    void testQueryBus() {
        ApplicationContext context = mock(ApplicationContext.class);
        GetItemQueryHandler handler = new GetItemQueryHandler();
        when(context.getBeansOfType(QueryHandler.class)).thenReturn((Map) Map.of("getItemQueryHandler", handler));

        QueryBus queryBus = new QueryBus(context);
        String result = queryBus.execute(new GetItemQuery(42L));

        assertEquals("Item-42", result);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when dispatching null command/query")
    @SuppressWarnings("unchecked")
    void testNullChecks() {
        ApplicationContext context = mock(ApplicationContext.class);
        when(context.getBeansOfType(CommandHandler.class)).thenReturn(Map.of());
        when(context.getBeansOfType(QueryHandler.class)).thenReturn(Map.of());

        CommandBus commandBus = new CommandBus(context);
        QueryBus queryBus = new QueryBus(context);

        assertThrows(IllegalArgumentException.class, () -> commandBus.dispatch(null));
        assertThrows(IllegalArgumentException.class, () -> queryBus.execute(null));
    }
}

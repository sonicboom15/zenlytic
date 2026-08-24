package com.example.common.cqrs.command;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.core.GenericTypeResolver;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CommandBus {

    private static final Logger log = LoggerFactory.getLogger(CommandBus.class);
    private final ApplicationContext applicationContext;
    private final Map<Class<?>, CommandHandler<?, ?>> handlerCache = new ConcurrentHashMap<>();

    public CommandBus(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @SuppressWarnings("unchecked")
    public <R> R dispatch(Command<R> command) {
        if (command == null) {
            throw new IllegalArgumentException("Command cannot be null");
        }

        Class<?> commandClass = command.getClass();
        CommandHandler<Command<R>, R> handler = (CommandHandler<Command<R>, R>) handlerCache.computeIfAbsent(commandClass, this::resolveHandler);

        log.debug("Dispatching command [{}] to handler [{}]", commandClass.getSimpleName(), handler.getClass().getSimpleName());
        return handler.handle(command);
    }

    @SuppressWarnings("rawtypes")
    private CommandHandler<?, ?> resolveHandler(Class<?> commandClass) {
        Map<String, CommandHandler> handlers = applicationContext.getBeansOfType(CommandHandler.class);
        for (CommandHandler handler : handlers.values()) {
            Class<?>[] typeArgs = GenericTypeResolver.resolveTypeArguments(handler.getClass(), CommandHandler.class);
            if (typeArgs != null && typeArgs.length > 0 && typeArgs[0].isAssignableFrom(commandClass)) {
                return handler;
            }
        }
        throw new IllegalStateException("No CommandHandler registered for command: " + commandClass.getName());
    }
}

package com.zenlytic.common.cqrs.query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.core.GenericTypeResolver;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class QueryBus {

    private static final Logger log = LoggerFactory.getLogger(QueryBus.class);
    private final ApplicationContext applicationContext;
    private final Map<Class<?>, QueryHandler<?, ?>> handlerCache = new ConcurrentHashMap<>();

    public QueryBus(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @SuppressWarnings("unchecked")
    public <R> R execute(Query<R> query) {
        if (query == null) {
            throw new IllegalArgumentException("Query cannot be null");
        }

        Class<?> queryClass = query.getClass();
        QueryHandler<Query<R>, R> handler = (QueryHandler<Query<R>, R>) handlerCache.computeIfAbsent(queryClass, this::resolveHandler);

        log.debug("Executing query [{}] with handler [{}]", queryClass.getSimpleName(), handler.getClass().getSimpleName());
        return handler.handle(query);
    }

    @SuppressWarnings("rawtypes")
    private QueryHandler<?, ?> resolveHandler(Class<?> queryClass) {
        Map<String, QueryHandler> handlers = applicationContext.getBeansOfType(QueryHandler.class);
        for (QueryHandler handler : handlers.values()) {
            Class<?>[] typeArgs = GenericTypeResolver.resolveTypeArguments(handler.getClass(), QueryHandler.class);
            if (typeArgs != null && typeArgs.length > 0 && typeArgs[0].isAssignableFrom(queryClass)) {
                return handler;
            }
        }
        throw new IllegalStateException("No QueryHandler registered for query: " + queryClass.getName());
    }
}

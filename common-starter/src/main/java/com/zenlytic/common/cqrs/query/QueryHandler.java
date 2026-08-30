package com.zenlytic.common.cqrs.query;

public interface QueryHandler<Q extends Query<R>, R> {
    R handle(Q query);
}

package com.zenlytic.common.cqrs.query;

import java.io.Serializable;

/**
 * Marker interface for all read-only queries in the system.
 * @param <R> Return type of the query
 */
public interface Query<R> extends Serializable {
}

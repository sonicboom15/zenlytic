package com.zenlytic.common.cqrs.command;

import java.io.Serializable;

/**
 * Marker interface for all mutating business commands in the system.
 * @param <R> Return type of the command
 */
public interface Command<R> extends Serializable {
}

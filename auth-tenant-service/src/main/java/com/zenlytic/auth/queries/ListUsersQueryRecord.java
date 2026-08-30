package com.zenlytic.auth.queries;

import com.zenlytic.auth.commands.CreateUserCommandRecord;
import com.zenlytic.auth.dto.UserDto;
import com.zenlytic.auth.entity.User;
import com.zenlytic.auth.repository.UserRepository;
import com.zenlytic.common.cqrs.query.Query;
import com.zenlytic.common.cqrs.query.QueryHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public final class ListUsersQueryRecord {

    public record Query() implements com.zenlytic.common.cqrs.query.Query<List<UserDto.Response>> {}

    @Component
    public static class Handler implements QueryHandler<Query, List<UserDto.Response>> {

        private final UserRepository userRepository;

        public Handler(UserRepository userRepository) {
            this.userRepository = userRepository;
        }

        @Override
        @Transactional(readOnly = true)
        public List<UserDto.Response> handle(Query query) {
            List<User> users = userRepository.findAll();
            return users.stream()
                    .map(CreateUserCommandRecord.Handler::mapToResponse)
                    .toList();
        }
    }
}


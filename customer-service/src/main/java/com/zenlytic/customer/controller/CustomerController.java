package com.zenlytic.customer.controller;

import com.zenlytic.common.batch.model.BatchRequest;
import com.zenlytic.common.batch.model.BatchResponse;
import com.zenlytic.common.cqrs.command.CommandBus;
import com.zenlytic.common.cqrs.query.QueryBus;
import com.zenlytic.common.logging.audit.Auditable;
import com.zenlytic.common.model.ApiResponse;
import com.zenlytic.common.model.PagedResponse;
import com.zenlytic.customer.commands.BatchCreateCustomersCommandRecord;
import com.zenlytic.customer.commands.CreateCustomerCommandRecord;
import com.zenlytic.customer.commands.DeleteCustomerCommandRecord;
import com.zenlytic.customer.commands.UpdateCustomerCommandRecord;
import com.zenlytic.customer.dto.CustomerDto;
import com.zenlytic.customer.queries.GetCustomerByIdQueryRecord;
import com.zenlytic.customer.queries.ListCustomersQueryRecord;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
@Tag(name = "Customers", description = "Multi-Tenant B2B Customer Master Data and Discount Policy APIs")
public class CustomerController {

    private final CommandBus commandBus;
    private final QueryBus queryBus;

    public CustomerController(CommandBus commandBus, QueryBus queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }

    @PostMapping
    @Auditable(action = "CREATE_CUSTOMER", resource = "CUSTOMER")
    @Operation(summary = "Create a new B2B customer record with credit limit and max discount boundary")
    public ResponseEntity<ApiResponse<CustomerDto.Response>> createCustomer(@Valid @RequestBody CustomerDto.CreateRequest request) {
        CustomerDto.Response response = commandBus.dispatch(new CreateCustomerCommandRecord.Command(request));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Customer created successfully", response));
    }

    @PostMapping("/batch")
    @Auditable(action = "BATCH_CREATE_CUSTOMERS", resource = "CUSTOMER")
    @Operation(summary = "Batch import and create customers with item-level error reporting")
    public ResponseEntity<ApiResponse<BatchResponse<CustomerDto.Response>>> batchCreateCustomers(
            @Valid @RequestBody BatchRequest<CustomerDto.CreateRequest> request) {
        BatchResponse<CustomerDto.Response> response = commandBus.dispatch(new BatchCreateCustomersCommandRecord.Command(request));
        return ResponseEntity.ok(ApiResponse.ok("Batch customer import processed", response));
    }

    @GetMapping
    @Operation(summary = "List and search customers paged with filters for status, tier, and keyword")
    public ResponseEntity<ApiResponse<PagedResponse<CustomerDto.Response>>> listCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tier,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<CustomerDto.Response> response = queryBus.execute(
                new ListCustomersQueryRecord.Query(search, status, tier, page, size));
        return ResponseEntity.ok(ApiResponse.ok("Customers list retrieved", response));
    }

    @GetMapping("/{customerId}")
    @Operation(summary = "Get customer details by customer ID")
    public ResponseEntity<ApiResponse<CustomerDto.Response>> getCustomer(@PathVariable String customerId) {
        CustomerDto.Response response = queryBus.execute(new GetCustomerByIdQueryRecord.Query(customerId));
        return ResponseEntity.ok(ApiResponse.ok("Customer retrieved", response));
    }

    @PutMapping("/{customerId}")
    @Auditable(action = "UPDATE_CUSTOMER", resource = "CUSTOMER")
    @Operation(summary = "Update customer details, credit limit, or discount boundaries")
    public ResponseEntity<ApiResponse<CustomerDto.Response>> updateCustomer(
            @PathVariable String customerId,
            @Valid @RequestBody CustomerDto.UpdateRequest request) {
        CustomerDto.Response response = commandBus.dispatch(new UpdateCustomerCommandRecord.Command(customerId, request));
        return ResponseEntity.ok(ApiResponse.ok("Customer updated successfully", response));
    }

    @DeleteMapping("/{customerId}")
    @Auditable(action = "DELETE_CUSTOMER", resource = "CUSTOMER")
    @Operation(summary = "Deactivate customer record")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable String customerId) {
        commandBus.dispatch(new DeleteCustomerCommandRecord.Command(customerId));
        return ResponseEntity.ok(ApiResponse.ok("Customer deactivated successfully", null));
    }
}


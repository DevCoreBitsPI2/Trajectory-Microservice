Feature: Register performance evaluation (HU01)
  As an authorized evaluator
  I want to register the performance results of an employee
  So that I can formally document their performance within the system

  # CA2: Successful registration with all required fields
  Scenario: Successful registration of evaluation with complete fields
    Given that the evaluator has complete evaluation data
    When he confirms the evaluation registration
    Then the system stores the evaluation in the database
    And the evaluation is available in the history with a generated id

  # CA2: Optional rating fields with default value
  Scenario: Successful registration with ratings at zero by default
    Given that the evaluator registers an evaluation without explicit ratings
    When he confirms the evaluation registration
    Then the system stores the evaluation with ratings at zero by default

  # CA3: Duplicate evaluation for the same period
  Scenario: Warning for duplicate evaluation for the same period
    Given that there is already a registered evaluation for the date "2024-06-30"
    And the evaluator attempts to register another evaluation for the same date "2024-06-30"
    When the system attempts to save the duplicate evaluation
    Then the system rejects the operation with an incorrect request error

  # CA4: Available evaluation in history after successful registration
  Scenario: Query of successfully registered evaluation
    Given that there is a registered evaluation with id 1
    When the evaluator queries the evaluation with id 1
    Then the system returns the complete evaluation data

  # CA5: Database error during registration
  Scenario: Database error during registration
    Given that a database error occurs when attempting to register
    When the evaluator attempts to confirm the evaluation registration
    Then the system throws an exception with a clear error message

  # CA4: Non-existent evaluation
  Scenario: Query of evaluation that does not exist
    Given that there is no evaluation with id 999
    When the evaluator queries the evaluation with id 999
    Then the system returns an error indicating that the evaluation was not found

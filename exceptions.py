"""Custom exception hierarchy for the FinLuxa data layer."""


class FinLuxaError(Exception):
    """Base class for all custom errors raised by the FinLuxa data layer."""


class DatabaseConnectionError(FinLuxaError):
    """Raised when a connection to the database cannot be established."""


class QueryExecutionError(FinLuxaError):
    """Raised when a SELECT query fails at the database level."""


class ValidationError(FinLuxaError):
    """Raised when input data fails validation before hitting the database."""


class RecordInsertionError(FinLuxaError):
    """Raised when an INSERT statement fails at the database level."""

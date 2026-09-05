"""Database connection management and shared insert logic for FinLuxa."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, ContextManager

import pyodbc

from exceptions import DatabaseConnectionError, QueryExecutionError, RecordInsertionError


@dataclass(frozen=True)
class DatabaseConfig:
    """Connection settings for the FinLuxa database."""

    driver: str = "ODBC Driver 17 for SQL Server"
    server: str = "."
    database: str = "FinLuxa"
    trusted_connection: bool = True

    def to_connection_string(self) -> str:
        """Build the ODBC connection string from these settings."""
        parts = [
            f"DRIVER={{{self.driver}}}",
            f"SERVER={self.server}",
            f"DATABASE={self.database}",
        ]
        if self.trusted_connection:
            parts.append("Trusted_Connection=yes")
        return ";".join(parts) + ";"


class DatabaseConnection:
    """Context manager that opens and safely closes a SQL Server connection."""

    def __init__(self, config: DatabaseConfig | None = None) -> None:
        self._config = config or DatabaseConfig()
        self._connection: pyodbc.Connection | None = None

    def __enter__(self) -> pyodbc.Connection:
        try:
            self._connection = pyodbc.connect(self._config.to_connection_string())
            return self._connection
        except pyodbc.Error as exc:
            raise DatabaseConnectionError(
                f"Could not connect to database '{self._config.database}' "
                f"on server '{self._config.server}'. Original error: {exc}"
            ) from exc

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if self._connection is not None:
            self._connection.close()


ConnectionFactory = Callable[[], ContextManager[pyodbc.Connection]]


class BaseRepository:
    """Shared functionality for all FinLuxa table repositories."""

    def __init__(self, connection_factory: ConnectionFactory) -> None:
        self._connection_factory = connection_factory

    def _execute_insert(self, query: str, params: tuple) -> int:
        """Run an INSERT ... OUTPUT statement and return the new row's id."""
        try:
            with self._connection_factory() as connection:
                cursor = connection.cursor()
                cursor.execute(query, params)
                new_id = cursor.fetchone()[0]
                connection.commit()
                return new_id
        except pyodbc.Error as exc:
            raise RecordInsertionError(
                f"Failed to execute insert. Query: {query!r}. Original error: {exc}"
            ) from exc


class BaseAnalyzer:
    """Shared functionality for all FinLuxa read-only analyzers."""

    def __init__(self, connection_factory: ConnectionFactory) -> None:
        self._connection_factory = connection_factory

    def _fetch_all(self, query: str, params: tuple) -> list[tuple]:
        """Run a SELECT statement and return all resulting rows."""
        try:
            with self._connection_factory() as connection:
                cursor = connection.cursor()
                cursor.execute(query, params)
                return cursor.fetchall()
        except pyodbc.Error as exc:
            raise QueryExecutionError(
                f"Failed to execute query. Query: {query!r}. Original error: {exc}"
            ) from exc

    def _fetch_scalar(self, query: str, params: tuple):
        """Run a SELECT statement and return the first column of the first row."""
        rows = self._fetch_all(query, params)
        return rows[0][0] if rows else None

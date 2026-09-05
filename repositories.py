"""Validation helpers, table repositories, and the FinLuxaInputService facade."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Literal

from database import BaseRepository, ConnectionFactory, DatabaseConfig, DatabaseConnection
from exceptions import ValidationError

Source = Literal["manual", "auto"]

_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ------------------------------------------------------------------
# Validation helpers
# ------------------------------------------------------------------
def validate_positive_amount(amount: float, field_name: str = "amount") -> None:
    """Raise ValidationError if ``amount`` is not a positive number."""
    if amount is None or amount <= 0:
        raise ValidationError(f"{field_name} must be a positive number, got {amount!r}.")


def validate_non_empty_text(value: str, field_name: str) -> None:
    """Raise ValidationError if ``value`` is empty or only whitespace."""
    if not value or not value.strip():
        raise ValidationError(f"{field_name} cannot be empty.")


def validate_email(email: str) -> None:
    """Raise ValidationError if ``email`` does not look like a valid address."""
    validate_non_empty_text(email, "email")
    if not _EMAIL_PATTERN.match(email):
        raise ValidationError(f"'{email}' is not a valid email address.")


def validate_date(date_str: str, field_name: str = "date") -> None:
    """Raise ValidationError if ``date_str`` is not in 'YYYY-MM-DD' format."""
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except (ValueError, TypeError) as exc:
        raise ValidationError(
            f"{field_name} must be in 'YYYY-MM-DD' format, got {date_str!r}."
        ) from exc


def validate_month(month_str: str, field_name: str = "month") -> None:
    """Raise ValidationError if ``month_str`` is not in 'YYYY-MM' format."""
    try:
        datetime.strptime(month_str, "%Y-%m")
    except (ValueError, TypeError) as exc:
        raise ValidationError(
            f"{field_name} must be in 'YYYY-MM' format, got {month_str!r}."
        ) from exc


def validate_source(source: str) -> None:
    """Raise ValidationError if ``source`` is not 'manual' or 'auto'."""
    if source not in ("manual", "auto"):
        raise ValidationError(f"source must be 'manual' or 'auto', got {source!r}.")


# ------------------------------------------------------------------
# Repositories
# ------------------------------------------------------------------
class UserRepository(BaseRepository):
    """Handles creation of user records."""

    def add_user(self, name: str, email: str) -> int:
        """Create a new user and return their generated ``user_id``."""
        validate_non_empty_text(name, "name")
        validate_email(email)

        query = (
            "INSERT INTO users (name, email) "
            "OUTPUT INSERTED.user_id VALUES (?, ?)"
        )
        return self._execute_insert(query, (name, email))


class _CategoryRepository(BaseRepository):
    """Shared logic for income/expense category repositories."""

    _table_name: str = ""

    def _add_category(self, user_id: int, name: str) -> int:
        validate_non_empty_text(name, "category name")
        query = (
            f"INSERT INTO {self._table_name} (user_id, name) "
            f"OUTPUT INSERTED.category_id VALUES (?, ?)"
        )
        return self._execute_insert(query, (user_id, name))


class IncomeCategoryRepository(_CategoryRepository):
    """Handles creation of income category records."""

    _table_name = "income_categories"

    def add_income_category(self, user_id: int, name: str) -> int:
        """Create a new income category and return its ``category_id``."""
        return self._add_category(user_id, name)


class ExpenseCategoryRepository(_CategoryRepository):
    """Handles creation of expense category records."""

    _table_name = "expense_categories"

    def add_expense_category(self, user_id: int, name: str) -> int:
        """Create a new expense category and return its ``category_id``."""
        return self._add_category(user_id, name)


class _TransactionRepository(BaseRepository):
    """Shared logic for income/expense transaction repositories."""

    _table_name: str = ""
    _id_column: str = ""

    def _add_transaction(
        self, user_id: int, category_id: int, amount: float, date: str
    ) -> int:
        validate_positive_amount(amount)
        validate_date(date)
        query = (
            f"INSERT INTO {self._table_name} (user_id, category_id, amount, date) "
            f"OUTPUT INSERTED.{self._id_column} VALUES (?, ?, ?, ?)"
        )
        return self._execute_insert(query, (user_id, category_id, amount, date))


class IncomeRepository(_TransactionRepository):
    """Handles creation of income records."""

    _table_name = "incomes"
    _id_column = "income_id"

    def add_income(
        self, user_id: int, category_id: int, amount: float, date: str
    ) -> int:
        """
        Record a new income entry and return its ``income_id``.

        Args:
            date: must be in 'YYYY-MM-DD' format, e.g. '2026-08-30'.
        """
        return self._add_transaction(user_id, category_id, amount, date)


class ExpenseRepository(_TransactionRepository):
    """Handles creation of expense records."""

    _table_name = "expenses"
    _id_column = "expense_id"

    def add_expense(
        self, user_id: int, category_id: int, amount: float, date: str
    ) -> int:
        """
        Record a new expense entry and return its ``expense_id``.

        Args:
            date: must be in 'YYYY-MM-DD' format, e.g. '2026-08-30'.
        """
        return self._add_transaction(user_id, category_id, amount, date)


class BudgetAllocationRepository(BaseRepository):
    """Handles creation of monthly budget allocation records."""

    def add_budget_allocation(
        self,
        user_id: int,
        category_id: int,
        limit_amount: float,
        month: str,
        source: Source = "manual",
    ) -> int:
        """
        Set a spending limit for one expense category in one month.

        Args:
            month: must be in 'YYYY-MM' format, e.g. '2026-08'.
            source: 'manual' or 'auto'.
        """
        validate_positive_amount(limit_amount, "limit_amount")
        validate_month(month)
        validate_source(source)

        query = (
            "INSERT INTO monthly_budget_allocations "
            "(user_id, category_id, limit_amount, month, source) "
            "OUTPUT INSERTED.budget_id VALUES (?, ?, ?, ?, ?)"
        )
        return self._execute_insert(
            query, (user_id, category_id, limit_amount, month, source)
        )


class SavingGoalRepository(BaseRepository):
    """Handles creation of saving goal records."""

    def add_saving_goal(
        self,
        user_id: int,
        target_amount: float,
        deadline: str,
        source: Source = "manual",
    ) -> int:
        """
        Create a new saving goal and return its ``goal_id``.

        Args:
            deadline: must be in 'YYYY-MM-DD' format.
            source: 'manual' or 'auto'.
        """
        validate_positive_amount(target_amount, "target_amount")
        validate_date(deadline, "deadline")
        validate_source(source)

        query = (
            "INSERT INTO saving_goals (user_id, target_amount, deadline, source) "
            "OUTPUT INSERTED.goal_id VALUES (?, ?, ?, ?)"
        )
        return self._execute_insert(
            query, (user_id, target_amount, deadline, source)
        )


# ------------------------------------------------------------------
# Facade
# ------------------------------------------------------------------
class FinLuxaInputService:
    """Single entry point for all 'Input Data' operations in FinLuxa."""

    def __init__(self, connection_factory: ConnectionFactory | None = None) -> None:
        factory = connection_factory or (lambda: DatabaseConnection(DatabaseConfig()))
        self._users = UserRepository(factory)
        self._income_categories = IncomeCategoryRepository(factory)
        self._expense_categories = ExpenseCategoryRepository(factory)
        self._incomes = IncomeRepository(factory)
        self._expenses = ExpenseRepository(factory)
        self._budgets = BudgetAllocationRepository(factory)
        self._saving_goals = SavingGoalRepository(factory)

    def add_user(self, name: str, email: str) -> int:
        return self._users.add_user(name, email)

    def add_income_category(self, user_id: int, name: str) -> int:
        return self._income_categories.add_income_category(user_id, name)

    def add_expense_category(self, user_id: int, name: str) -> int:
        return self._expense_categories.add_expense_category(user_id, name)

    def add_income(
        self, user_id: int, category_id: int, amount: float, date: str
    ) -> int:
        return self._incomes.add_income(user_id, category_id, amount, date)

    def add_expense(
        self, user_id: int, category_id: int, amount: float, date: str
    ) -> int:
        return self._expenses.add_expense(user_id, category_id, amount, date)

    def add_budget_allocation(
        self,
        user_id: int,
        category_id: int,
        limit_amount: float,
        month: str,
        source: Source = "manual",
    ) -> int:
        return self._budgets.add_budget_allocation(
            user_id, category_id, limit_amount, month, source
        )

    def add_saving_goal(
        self,
        user_id: int,
        target_amount: float,
        deadline: str,
        source: Source = "manual",
    ) -> int:
        return self._saving_goals.add_saving_goal(
            user_id, target_amount, deadline, source
        )

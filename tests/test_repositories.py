"""Unit tests for the FinLuxa repositories."""

import sys
from pathlib import Path
from unittest.mock import MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from exceptions import ValidationError  # noqa: E402
from repositories import ExpenseRepository, UserRepository  # noqa: E402


def make_fake_connection_factory(returned_id: int = 1):
    """Build a fake connection factory that returns ``returned_id`` from any insert."""
    fake_cursor = MagicMock()
    fake_cursor.fetchone.return_value = (returned_id,)

    fake_connection = MagicMock()
    fake_connection.cursor.return_value = fake_cursor

    fake_context_manager = MagicMock()
    fake_context_manager.__enter__.return_value = fake_connection
    fake_context_manager.__exit__.return_value = False

    factory = MagicMock(return_value=fake_context_manager)
    return factory, fake_cursor


class TestUserRepository:
    def test_add_user_returns_new_id(self):
        factory, cursor = make_fake_connection_factory(returned_id=42)
        repo = UserRepository(factory)

        new_id = repo.add_user("Jane Doe", "jane@example.com")

        assert new_id == 42
        cursor.execute.assert_called_once()

    def test_add_user_rejects_empty_name(self):
        factory, _ = make_fake_connection_factory()
        repo = UserRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_user("", "jane@example.com")

    def test_add_user_rejects_invalid_email(self):
        factory, _ = make_fake_connection_factory()
        repo = UserRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_user("Jane Doe", "not-an-email")


class TestExpenseRepository:
    def test_add_expense_returns_new_id(self):
        factory, cursor = make_fake_connection_factory(returned_id=7)
        repo = ExpenseRepository(factory)

        new_id = repo.add_expense(
            user_id=1, category_id=2, amount=150_000, date="2026-08-30"
        )

        assert new_id == 7
        cursor.execute.assert_called_once()

    def test_add_expense_rejects_negative_amount(self):
        factory, _ = make_fake_connection_factory()
        repo = ExpenseRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_expense(user_id=1, category_id=2, amount=-100, date="2026-08-30")

    def test_add_expense_rejects_bad_date_format(self):
        factory, _ = make_fake_connection_factory()
        repo = ExpenseRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_expense(user_id=1, category_id=2, amount=100, date="30/08/2026")

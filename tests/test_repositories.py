"""Unit tests for the FinLuxa repositories."""

import sys
from pathlib import Path
from unittest.mock import MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from exceptions import ValidationError  # noqa: E402
from repositories import (  # noqa: E402
    BudgetAllocationRepository,
    ExpenseRepository,
    IncomeCategoryRepository,
    SavingGoalRepository,
    UserRepository,
)


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

        new_id = repo.add_user("Jane Doe", "jane@example.com", "jane_doe")

        assert new_id == 42
        cursor.execute.assert_called_once()

    def test_add_user_rejects_empty_name(self):
        factory, _ = make_fake_connection_factory()
        repo = UserRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_user("", "jane@example.com", "jane_doe")

    def test_add_user_rejects_invalid_email(self):
        factory, _ = make_fake_connection_factory()
        repo = UserRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_user("Jane Doe", "not-an-email", "jane_doe")

    def test_add_user_rejects_short_username(self):
        factory, _ = make_fake_connection_factory()
        repo = UserRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_user("Jane Doe", "jane@example.com", "abc")

    def test_add_user_rejects_username_with_symbols(self):
        factory, _ = make_fake_connection_factory()
        repo = UserRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_user("Jane Doe", "jane@example.com", "jane-doe!")

    def test_set_username_updates_existing_user(self):
        factory, cursor = make_fake_connection_factory()
        repo = UserRepository(factory)

        repo.set_username(user_id=1, username="new_handle")

        cursor.execute.assert_called_once()

    def test_set_username_rejects_short_username(self):
        factory, _ = make_fake_connection_factory()
        repo = UserRepository(factory)

        with pytest.raises(ValidationError):
            repo.set_username(user_id=1, username="ab")

    def test_update_profile_picture_accepts_bytes(self):
        factory, cursor = make_fake_connection_factory()
        repo = UserRepository(factory)

        repo.update_profile_picture(user_id=1, image_bytes=b"fake-image-bytes")

        cursor.execute.assert_called_once()

    def test_update_profile_picture_accepts_none_to_remove(self):
        factory, cursor = make_fake_connection_factory()
        repo = UserRepository(factory)

        repo.update_profile_picture(user_id=1, image_bytes=None)

        cursor.execute.assert_called_once()


class TestIncomeCategoryRepository:
    def test_add_income_category_returns_new_id(self):
        factory, cursor = make_fake_connection_factory(returned_id=9)
        repo = IncomeCategoryRepository(factory)

        new_id = repo.add_income_category(user_id=1, name="Salary")

        assert new_id == 9
        cursor.execute.assert_called_once()

    def test_add_income_category_rejects_empty_name(self):
        factory, _ = make_fake_connection_factory()
        repo = IncomeCategoryRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_income_category(user_id=1, name="")


class TestExpenseRepository:
    def test_add_expense_returns_new_id(self):
        factory, cursor = make_fake_connection_factory(returned_id=7)
        repo = ExpenseRepository(factory)

        new_id = repo.add_expense(
            user_id=1, category_id=2, amount=150_000, date="2026-08-30"
        )

        assert new_id == 7
        cursor.execute.assert_called_once()

    def test_add_expense_accepts_no_date(self):
        factory, cursor = make_fake_connection_factory(returned_id=8)
        repo = ExpenseRepository(factory)

        new_id = repo.add_expense(user_id=1, category_id=2, amount=150_000)

        assert new_id == 8
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


class TestBudgetAllocationRepository:
    def test_add_budget_allocation_returns_new_id(self):
        factory, cursor = make_fake_connection_factory(returned_id=5)
        repo = BudgetAllocationRepository(factory)

        new_id = repo.add_budget_allocation(
            user_id=1, category_id=2, limit_amount=1_000_000, month="2026-08"
        )

        assert new_id == 5
        cursor.execute.assert_called_once()

    def test_add_budget_allocation_rejects_bad_month_format(self):
        factory, _ = make_fake_connection_factory()
        repo = BudgetAllocationRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_budget_allocation(
                user_id=1, category_id=2, limit_amount=1_000_000, month="August-2026"
            )

    def test_add_budget_allocation_rejects_invalid_source(self):
        factory, _ = make_fake_connection_factory()
        repo = BudgetAllocationRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_budget_allocation(
                user_id=1,
                category_id=2,
                limit_amount=1_000_000,
                month="2026-08",
                source="not-a-real-source",
            )


class TestSavingGoalRepository:
    def test_add_saving_goal_returns_new_id(self):
        factory, cursor = make_fake_connection_factory(returned_id=3)
        repo = SavingGoalRepository(factory)

        new_id = repo.add_saving_goal(
            user_id=1, target_amount=5_000_000, deadline="2027-03-01"
        )

        assert new_id == 3
        cursor.execute.assert_called_once()

    def test_add_saving_goal_rejects_non_positive_target(self):
        factory, _ = make_fake_connection_factory()
        repo = SavingGoalRepository(factory)

        with pytest.raises(ValidationError):
            repo.add_saving_goal(user_id=1, target_amount=0, deadline="2027-03-01")

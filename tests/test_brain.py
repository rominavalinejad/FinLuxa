"""Unit tests for the FinLuxa Brain layer."""

import sys
from pathlib import Path
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from brain import BudgetCalculator, ExpenseAnalyzer, _last_n_months, _month_date_range  # noqa: E402


def make_fake_connection_factory(fetchall_return: list[tuple]):
    """Build a fake connection factory whose cursor.fetchall() returns a fixed value."""
    fake_cursor = MagicMock()
    fake_cursor.fetchall.return_value = fetchall_return

    fake_connection = MagicMock()
    fake_connection.cursor.return_value = fake_cursor

    fake_context_manager = MagicMock()
    fake_context_manager.__enter__.return_value = fake_connection
    fake_context_manager.__exit__.return_value = False

    return MagicMock(return_value=fake_context_manager), fake_cursor


class TestMonthDateRange:
    def test_regular_month(self):
        assert _month_date_range("2026-08") == ("2026-08-01", "2026-09-01")

    def test_december_rolls_into_next_year(self):
        assert _month_date_range("2026-12") == ("2026-12-01", "2027-01-01")


class TestLastNMonths:
    def test_returns_correct_count_and_order(self):
        from datetime import date

        result = _last_n_months(3, reference=date(2026, 3, 15))
        assert result == ["2026-01", "2026-02", "2026-03"]

    def test_handles_year_rollover(self):
        from datetime import date

        result = _last_n_months(2, reference=date(2026, 1, 15))
        assert result == ["2025-12", "2026-01"]


class TestBudgetCalculator:
    def test_calc_total_income_sums_amounts(self):
        factory, _ = make_fake_connection_factory([(500_000,)])
        calculator = BudgetCalculator(factory)

        result = calculator.calc_total_income(user_id=1, month="2026-08")

        assert result == 500_000.0

    def test_calc_balance_is_income_minus_expense(self):
        fake_cursor = MagicMock()
        fake_cursor.fetchall.side_effect = [[(800_000,)], [(300_000,)]]
        fake_connection = MagicMock()
        fake_connection.cursor.return_value = fake_cursor
        fake_context_manager = MagicMock()
        fake_context_manager.__enter__.return_value = fake_connection
        fake_context_manager.__exit__.return_value = False
        factory = MagicMock(return_value=fake_context_manager)

        calculator = BudgetCalculator(factory)
        result = calculator.calc_balance(user_id=1, month="2026-08")

        assert result == 500_000.0


class TestExpenseAnalyzer:
    def test_group_by_category_returns_dict(self):
        factory, _ = make_fake_connection_factory(
            [("Food", 300_000), ("Transport", 100_000)]
        )
        analyzer = ExpenseAnalyzer(factory)

        result = analyzer.group_by_category(user_id=1, month="2026-08")

        assert result == {"Food": 300_000.0, "Transport": 100_000.0}

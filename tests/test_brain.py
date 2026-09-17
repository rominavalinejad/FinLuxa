"""Unit tests for the FinLuxa Brain layer."""

import sys
from pathlib import Path
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from brain import (  # noqa: E402
    BudgetCalculator,
    ExpenseAnalyzer,
    IncomeAnalyzer,
    ReportGenerator,
    SavingsAdvisor,
    _last_n_months,
    _month_date_range,
)


def make_fake_connection_factory(fetchall_return=None, fetchall_side_effect=None):
    """Build a fake connection factory whose cursor.fetchall() returns fixed value(s)."""
    fake_cursor = MagicMock()
    if fetchall_side_effect is not None:
        fake_cursor.fetchall.side_effect = fetchall_side_effect
    else:
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
        factory, _ = make_fake_connection_factory(fetchall_return=[(500_000,)])
        calculator = BudgetCalculator(factory)

        result = calculator.calc_total_income(user_id=1, month="2026-08")

        assert result == 500_000.0

    def test_calc_balance_is_income_minus_expense(self):
        factory, _ = make_fake_connection_factory(
            fetchall_side_effect=[[(800_000,)], [(300_000,)]]
        )
        calculator = BudgetCalculator(factory)

        result = calculator.calc_balance(user_id=1, month="2026-08")

        assert result == 500_000.0

    def test_check_budget_status_returns_status_list(self):
        factory, _ = make_fake_connection_factory(
            fetchall_return=[("Food", 1_000_000, 450_000), ("Rent", 5_000_000, 5_000_000)]
        )
        calculator = BudgetCalculator(factory)

        result = calculator.check_budget_status(user_id=1, month="2026-08")

        assert len(result) == 2
        assert result[0].category_name == "Food"
        assert result[0].limit_amount == 1_000_000.0
        assert result[0].spent_amount == 450_000.0
        assert result[0].percent_used == 45.0
        assert result[1].percent_used == 100.0

    def test_calc_remaining_budget_subtracts_spent_from_limit(self):
        factory, _ = make_fake_connection_factory(fetchall_return=[(700_000,)])
        calculator = BudgetCalculator(factory)

        result = calculator.calc_remaining_budget(user_id=1, category_id=2, month="2026-08")

        assert result == 700_000.0

    def test_calc_remaining_budget_returns_zero_when_no_budget_set(self):
        factory, _ = make_fake_connection_factory(fetchall_return=[])
        calculator = BudgetCalculator(factory)

        result = calculator.calc_remaining_budget(user_id=1, category_id=2, month="2026-08")

        assert result == 0.0


class TestExpenseAnalyzer:
    def test_group_by_category_returns_dict(self):
        factory, _ = make_fake_connection_factory(
            fetchall_return=[("Food", 300_000), ("Transport", 100_000)]
        )
        analyzer = ExpenseAnalyzer(factory)

        result = analyzer.group_by_category(user_id=1, month="2026-08")

        assert result == {"Food": 300_000.0, "Transport": 100_000.0}

    def test_daily_totals_returns_day_to_amount_map(self):
        factory, _ = make_fake_connection_factory(fetchall_return=[(1, 50_000), (15, 200_000)])
        analyzer = ExpenseAnalyzer(factory)

        result = analyzer.daily_totals(user_id=1, month="2026-08")

        assert result == {1: 50_000.0, 15: 200_000.0}


class TestIncomeAnalyzer:
    def test_group_by_category_returns_dict(self):
        factory, _ = make_fake_connection_factory(
            fetchall_return=[("Salary", 2_000_000), ("Freelance", 500_000)]
        )
        analyzer = IncomeAnalyzer(factory)

        result = analyzer.group_by_category(user_id=1, month="2026-08")

        assert result == {"Salary": 2_000_000.0, "Freelance": 500_000.0}


class TestSavingsAdvisorBuildReport:
    def test_positive_balance_produces_suggested_target(self):
        # 3 months of income calls, then 3 months of expense calls
        factory, _ = make_fake_connection_factory(
            fetchall_side_effect=[
                [(2_000_000,)], [(2_000_000,)], [(2_000_000,)],  # income x3
                [(1_000_000,)], [(1_000_000,)], [(1_000_000,)],  # expense x3
            ]
        )
        advisor = SavingsAdvisor(factory)

        report = advisor.build_report(user_id=1, lookback_months=3, deadline_months_ahead=6)

        assert report.avg_income == 2_000_000.0
        assert report.avg_expense == 1_000_000.0
        assert report.avg_balance == 1_000_000.0
        assert report.suggested_target == 3_000_000.0  # 1,000,000 * 6 * 0.5
        assert report.suggested_deadline is not None
        assert report.shortfall_to_break_even is None

    def test_non_positive_balance_produces_shortfall_instead_of_target(self):
        factory, _ = make_fake_connection_factory(
            fetchall_side_effect=[
                [(1_000_000,)], [(1_000_000,)], [(1_000_000,)],  # income x3
                [(1_500_000,)], [(1_500_000,)], [(1_500_000,)],  # expense x3
            ]
        )
        advisor = SavingsAdvisor(factory)

        report = advisor.build_report(user_id=1, lookback_months=3, deadline_months_ahead=6)

        assert report.avg_balance == -500_000.0
        assert report.suggested_target is None
        assert report.suggested_deadline is None
        assert report.shortfall_to_break_even == 500_000.0


class TestReportGenerator:
    def test_build_summary_combines_income_expense_and_budget_status(self):
        factory, _ = make_fake_connection_factory(
            fetchall_side_effect=[
                [(3_000_000,)],  # total income
                [(1_200_000,)],  # total expense
                [("Food", 1_000_000, 450_000)],  # budget status
                [("Food", 450_000)],  # expense_by_category
            ]
        )
        reporter = ReportGenerator(factory)

        summary = reporter.build_summary(user_id=1, month="2026-08")

        assert summary.income == 3_000_000.0
        assert summary.expense == 1_200_000.0
        assert summary.balance == 1_800_000.0
        assert len(summary.budget_status) == 1
        assert summary.budget_status[0].category_name == "Food"
        assert summary.expense_by_category == {"Food": 450_000.0}

    def test_to_chart_data_returns_category_totals(self):
        factory, _ = make_fake_connection_factory(
            fetchall_return=[("Food", 300_000), ("Transport", 100_000)]
        )
        reporter = ReportGenerator(factory)

        result = reporter.to_chart_data(user_id=1, month="2026-08")

        assert result == {"Food": 300_000.0, "Transport": 100_000.0}

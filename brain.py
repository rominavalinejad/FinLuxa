"""System Logic (Brain): reads data from Storage and produces calculations,
analysis, suggestions, and report-ready output."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from database import BaseAnalyzer, ConnectionFactory
from repositories import (
    BudgetAllocationRepository,
    SavingGoalRepository,
    validate_month,
    validate_positive_amount,
)


# ------------------------------------------------------------------
# Shared date helpers
# ------------------------------------------------------------------
def _month_date_range(month: str) -> tuple[str, str]:
    """Return (start_date, end_date) ISO strings covering the given 'YYYY-MM' month."""
    validate_month(month)
    year, mon = (int(part) for part in month.split("-"))
    start = date(year, mon, 1)
    end = date(year + 1, 1, 1) if mon == 12 else date(year, mon + 1, 1)
    return start.isoformat(), end.isoformat()


def _last_n_months(n: int, reference: date | None = None) -> list[str]:
    """Return the last ``n`` months (including the current one) as 'YYYY-MM' strings, ascending."""
    reference = reference or date.today()
    months = []
    year, month = reference.year, reference.month
    for _ in range(n):
        months.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    return list(reversed(months))


# ------------------------------------------------------------------
# BudgetCalculator
# ------------------------------------------------------------------
@dataclass(frozen=True)
class BudgetStatus:
    """Spending status of one expense category against its monthly budget."""

    category_name: str
    limit_amount: float
    spent_amount: float

    @property
    def percent_used(self) -> float:
        if self.limit_amount == 0:
            return 0.0
        return round((self.spent_amount / self.limit_amount) * 100, 1)


class BudgetCalculator(BaseAnalyzer):
    """Core budget calculations: totals, balance, and budget status."""

    def calc_total_income(self, user_id: int, month: str) -> float:
        """Total income for ``user_id`` in the given 'YYYY-MM' month."""
        start, end = _month_date_range(month)
        query = (
            "SELECT COALESCE(SUM(amount), 0) FROM incomes "
            "WHERE user_id = ? AND date >= ? AND date < ?"
        )
        return float(self._fetch_scalar(query, (user_id, start, end)))

    def calc_total_expense(self, user_id: int, month: str) -> float:
        """Total expenses for ``user_id`` in the given 'YYYY-MM' month."""
        start, end = _month_date_range(month)
        query = (
            "SELECT COALESCE(SUM(amount), 0) FROM expenses "
            "WHERE user_id = ? AND date >= ? AND date < ?"
        )
        return float(self._fetch_scalar(query, (user_id, start, end)))

    def calc_balance(self, user_id: int, month: str) -> float:
        """Income minus expenses for ``user_id`` in the given month."""
        return self.calc_total_income(user_id, month) - self.calc_total_expense(user_id, month)

    def check_budget_status(self, user_id: int, month: str) -> list[BudgetStatus]:
        """Spending vs. budget limit for every category with a budget set that month."""
        start, end = _month_date_range(month)
        query = """
            SELECT ec.name, mba.limit_amount, COALESCE(SUM(e.amount), 0)
            FROM monthly_budget_allocations mba
            JOIN expense_categories ec ON ec.category_id = mba.category_id
            LEFT JOIN expenses e
                ON e.category_id = mba.category_id
                AND e.user_id = mba.user_id
                AND e.date >= ? AND e.date < ?
            WHERE mba.user_id = ? AND mba.month = ?
            GROUP BY ec.name, mba.limit_amount
        """
        rows = self._fetch_all(query, (start, end, user_id, month))
        return [
            BudgetStatus(category_name=name, limit_amount=float(limit), spent_amount=float(spent))
            for name, limit, spent in rows
        ]

    def calc_remaining_budget(self, user_id: int, category_id: int, month: str) -> float:
        """Remaining budget (limit minus spent) for one category in one month."""
        start, end = _month_date_range(month)
        query = """
            SELECT mba.limit_amount - COALESCE(SUM(e.amount), 0)
            FROM monthly_budget_allocations mba
            LEFT JOIN expenses e
                ON e.category_id = mba.category_id
                AND e.user_id = mba.user_id
                AND e.date >= ? AND e.date < ?
            WHERE mba.user_id = ? AND mba.category_id = ? AND mba.month = ?
            GROUP BY mba.limit_amount
        """
        result = self._fetch_scalar(query, (start, end, user_id, category_id, month))
        return float(result) if result is not None else 0.0


# ------------------------------------------------------------------
# ExpenseAnalyzer
# ------------------------------------------------------------------
class ExpenseAnalyzer(BaseAnalyzer):
    """Deeper analysis of spending patterns: by category and over time."""

    def group_by_category(self, user_id: int, month: str) -> dict[str, float]:
        """Total spent per expense category for ``user_id`` in the given month."""
        start, end = _month_date_range(month)
        query = """
            SELECT ec.name, COALESCE(SUM(e.amount), 0)
            FROM expense_categories ec
            LEFT JOIN expenses e
                ON e.category_id = ec.category_id
                AND e.user_id = ec.user_id
                AND e.date >= ? AND e.date < ?
            WHERE ec.user_id = ?
            GROUP BY ec.name
        """
        rows = self._fetch_all(query, (start, end, user_id))
        return {name: float(total) for name, total in rows}

    def trend_last_months(self, user_id: int, n_months: int) -> list[tuple[str, float]]:
        """Total expenses per month for the last ``n_months``, ascending by month."""
        months = _last_n_months(n_months)
        start, _ = _month_date_range(months[0])
        query = """
            SELECT FORMAT(date, 'yyyy-MM'), SUM(amount)
            FROM expenses
            WHERE user_id = ? AND date >= ?
            GROUP BY FORMAT(date, 'yyyy-MM')
        """
        rows = self._fetch_all(query, (user_id, start))
        totals_by_month = {month_str: float(total) for month_str, total in rows}
        return [(month, totals_by_month.get(month, 0.0)) for month in months]

    def avg_expense_by_category(self, user_id: int, category_id: int, n_months: int) -> float:
        """Average monthly spend on one category over the last ``n_months``."""
        months = _last_n_months(n_months)
        start, _ = _month_date_range(months[0])
        query = """
            SELECT COALESCE(SUM(amount), 0) FROM expenses
            WHERE user_id = ? AND category_id = ? AND date >= ?
        """
        total = float(self._fetch_scalar(query, (user_id, category_id, start)))
        return round(total / n_months, 2)


# ------------------------------------------------------------------
# SavingsAdvisor
# ------------------------------------------------------------------
class SavingsAdvisor:
    """Suggests budget allocations and saving goals based on past behavior."""

    def __init__(self, connection_factory: ConnectionFactory) -> None:
        self._analyzer = ExpenseAnalyzer(connection_factory)
        self._calculator = BudgetCalculator(connection_factory)
        self._budget_repo = BudgetAllocationRepository(connection_factory)
        self._goal_repo = SavingGoalRepository(connection_factory)

    def suggest_budget_allocation(
        self, user_id: int, category_id: int, month: str, lookback_months: int = 3
    ) -> int:
        """
        Suggest a budget limit for one category based on recent average spend,
        store it (source='auto'), and return the new ``budget_id``.
        """
        avg_spend = self._analyzer.avg_expense_by_category(user_id, category_id, lookback_months)
        suggested_limit = round(avg_spend * 1.1, 2)  # 10% buffer over recent average
        validate_positive_amount(suggested_limit, "suggested_limit")

        return self._budget_repo.add_budget_allocation(
            user_id=user_id,
            category_id=category_id,
            limit_amount=suggested_limit,
            month=month,
            source="auto",
        )

    def suggest_saving_goal(
        self, user_id: int, lookback_months: int = 3, deadline_months_ahead: int = 6
    ) -> int:
        """
        Suggest a saving goal based on recent average monthly balance,
        store it (source='auto'), and return the new ``goal_id``.
        """
        months = _last_n_months(lookback_months)
        balances = [self._calculator.calc_balance(user_id, month) for month in months]
        avg_balance = sum(balances) / len(balances)

        target_amount = round(max(avg_balance, 0) * deadline_months_ahead * 0.5, 2)
        validate_positive_amount(target_amount, "target_amount")

        deadline = _months_from_today(deadline_months_ahead)

        return self._goal_repo.add_saving_goal(
            user_id=user_id,
            target_amount=target_amount,
            deadline=deadline,
            source="auto",
        )


def _months_from_today(n_months: int) -> str:
    """Return an ISO date string ``n_months`` after today (same day-of-month)."""
    today = date.today()
    total_month = today.month - 1 + n_months
    year = today.year + total_month // 12
    month = total_month % 12 + 1
    return date(year, month, 1).isoformat()


# ------------------------------------------------------------------
# Output Data
# ------------------------------------------------------------------
@dataclass(frozen=True)
class DashboardSummary:
    """The finalized Output Data shape, ready to be handed directly to the GUI."""

    user_id: int
    month: str
    income: float
    expense: float
    balance: float
    budget_status: list[BudgetStatus]
    expense_by_category: dict[str, float]


# ------------------------------------------------------------------
# ReportGenerator
# ------------------------------------------------------------------
class ReportGenerator:
    """Prepares Brain output in a format ready for direct display in Streamlit."""

    def __init__(self, connection_factory: ConnectionFactory) -> None:
        self._calculator = BudgetCalculator(connection_factory)
        self._analyzer = ExpenseAnalyzer(connection_factory)

    def build_summary(self, user_id: int, month: str) -> DashboardSummary:
        """Combine income, expense, balance, and budget status into one Output Data object."""
        income = self._calculator.calc_total_income(user_id, month)
        expense = self._calculator.calc_total_expense(user_id, month)
        return DashboardSummary(
            user_id=user_id,
            month=month,
            income=income,
            expense=expense,
            balance=income - expense,
            budget_status=self._calculator.check_budget_status(user_id, month),
            expense_by_category=self._analyzer.group_by_category(user_id, month),
        )

    def to_chart_data(self, user_id: int, month: str) -> dict[str, float]:
        """Category-wise spending, ready to feed into a Streamlit chart."""
        return self._analyzer.group_by_category(user_id, month)

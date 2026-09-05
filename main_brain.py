"""Manual smoke test for the FinLuxa Brain layer."""

from __future__ import annotations

import uuid
from datetime import date

from brain import BudgetCalculator, ExpenseAnalyzer, ReportGenerator, SavingsAdvisor
from database import DatabaseConfig, DatabaseConnection
from exceptions import FinLuxaError
from repositories import FinLuxaInputService


def run_smoke_test() -> None:
    factory = lambda: DatabaseConnection(DatabaseConfig())  # noqa: E731
    input_service = FinLuxaInputService(factory)

    this_month = date.today().strftime("%Y-%m")
    today_str = date.today().isoformat()

    print("Setting up fresh test data...\n")
    email = f"brain_test_{uuid.uuid4().hex[:8]}@example.com"
    user_id = input_service.add_user("Brain Test User", email)
    income_category_id = input_service.add_income_category(user_id, "Salary")
    category_id = input_service.add_expense_category(user_id, "Food")
    input_service.add_income(user_id, income_category_id, 2_000_000, today_str)
    input_service.add_expense(user_id, category_id, 300_000, today_str)
    input_service.add_expense(user_id, category_id, 150_000, today_str)
    input_service.add_budget_allocation(
        user_id, category_id, 1_000_000, this_month, source="manual"
    )
    print(f"Test user created. user_id = {user_id}, category_id = {category_id}\n")

    print("Testing BudgetCalculator...")
    calculator = BudgetCalculator(factory)
    print(f"  Total income:  {calculator.calc_total_income(user_id, this_month)}")
    print(f"  Total expense: {calculator.calc_total_expense(user_id, this_month)}")
    print(f"  Balance:       {calculator.calc_balance(user_id, this_month)}")
    for status in calculator.check_budget_status(user_id, this_month):
        print(
            f"  Budget status: {status.category_name} — "
            f"{status.spent_amount}/{status.limit_amount} ({status.percent_used}%)"
        )

    print("\nTesting ExpenseAnalyzer...")
    analyzer = ExpenseAnalyzer(factory)
    print(f"  By category: {analyzer.group_by_category(user_id, this_month)}")
    print(f"  Avg (3mo):   {analyzer.avg_expense_by_category(user_id, category_id, 3)}")

    print("\nTesting SavingsAdvisor...")
    advisor = SavingsAdvisor(factory)
    try:
        goal_id = advisor.suggest_saving_goal(user_id)
        print(f"  Suggested saving goal created. goal_id = {goal_id}")
    except FinLuxaError as advisor_error:
        print(f"  No goal suggested (expected if balance is not positive): {advisor_error}")

    print("\nTesting ReportGenerator...")
    reporter = ReportGenerator(factory)
    summary = reporter.build_summary(user_id, this_month)
    print(f"  Summary: income={summary.income}, expense={summary.expense}, balance={summary.balance}")
    print(f"  Expense by category: {summary.expense_by_category}")
    print(f"  Chart data: {reporter.to_chart_data(user_id, this_month)}")

    print("\nAll Brain operations completed successfully.")


if __name__ == "__main__":
    try:
        run_smoke_test()
    except FinLuxaError as error:
        print(f"\nSomething went wrong: {error}")

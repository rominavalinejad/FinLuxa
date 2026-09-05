"""Manual smoke test for the FinLuxa Input Data layer."""

from __future__ import annotations

import uuid

from exceptions import FinLuxaError
from repositories import FinLuxaInputService


def run_smoke_test() -> None:
    """Insert one sample record per table and print the resulting ids."""
    service = FinLuxaInputService()

    print("Testing connection and inserting sample data...\n")

    # A random suffix guarantees a unique email on every single run,
    # even if the script is executed twice within the same second.
    unique_suffix = uuid.uuid4().hex[:8]
    test_email = f"test_user_{unique_suffix}@example.com"

    user_id = service.add_user("Test User", test_email)
    print(f"User created.              user_id     = {user_id}")

    expense_category_id = service.add_expense_category(user_id, "Food")
    print(f"Expense category created.  category_id = {expense_category_id}")

    expense_id = service.add_expense(
        user_id=user_id,
        category_id=expense_category_id,
        amount=500_000,
        date="2026-08-30",
    )
    print(f"Expense recorded.          expense_id  = {expense_id}")

    budget_id = service.add_budget_allocation(
        user_id=user_id,
        category_id=expense_category_id,
        limit_amount=2_000_000,
        month="2026-08",
        source="manual",
    )
    print(f"Budget allocation set.     budget_id   = {budget_id}")

    print("\nAll operations completed successfully.")


if __name__ == "__main__":
    try:
        run_smoke_test()
    except FinLuxaError as error:
        print(f"\nSomething went wrong: {error}")

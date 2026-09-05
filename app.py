"""FinLuxa — Streamlit GUI.

Thin presentation layer: reads/writes go through FinLuxaInputService (Input
Data) and the Brain classes (BudgetCalculator, ExpenseAnalyzer,
SavingsAdvisor, ReportGenerator). This file should not contain business
logic beyond simple display formatting.
"""

from __future__ import annotations

from datetime import date

import streamlit as st

from brain import (
    BaseAnalyzer,
    BudgetCalculator,
    ExpenseAnalyzer,
    ReportGenerator,
    SavingsAdvisor,
)
from database import DatabaseConfig, DatabaseConnection
from exceptions import FinLuxaError
from repositories import FinLuxaInputService

PAGES = [
    "Dashboard",
    "Incomes",
    "Expenses",
    "Incomes table",
    "Expenses table",
    "Expenses chart",
    "Reports and analysis",
]


# ------------------------------------------------------------------
# Small read-only helpers needed only by the GUI (not part of Brain)
# ------------------------------------------------------------------
class UserDirectory(BaseAnalyzer):
    def find_by_email(self, email: str) -> tuple[int, str] | None:
        rows = self._fetch_all(
            "SELECT user_id, name FROM users WHERE email = ?", (email,)
        )
        return (rows[0][0], rows[0][1]) if rows else None


class CategoryDirectory(BaseAnalyzer):
    def list_income_categories(self, user_id: int) -> list[tuple[int, str]]:
        return self._fetch_all(
            "SELECT category_id, name FROM income_categories WHERE user_id = ? ORDER BY name",
            (user_id,),
        )

    def list_expense_categories(self, user_id: int) -> list[tuple[int, str]]:
        return self._fetch_all(
            "SELECT category_id, name FROM expense_categories WHERE user_id = ? ORDER BY name",
            (user_id,),
        )


class TransactionDirectory(BaseAnalyzer):
    def list_incomes(self, user_id: int) -> list[tuple]:
        return self._fetch_all(
            """
            SELECT i.date, ic.name, i.amount
            FROM incomes i JOIN income_categories ic ON ic.category_id = i.category_id
            WHERE i.user_id = ? ORDER BY i.date DESC
            """,
            (user_id,),
        )

    def list_expenses(self, user_id: int) -> list[tuple]:
        return self._fetch_all(
            """
            SELECT e.date, ec.name, e.amount
            FROM expenses e JOIN expense_categories ec ON ec.category_id = e.category_id
            WHERE e.user_id = ? ORDER BY e.date DESC
            """,
            (user_id,),
        )


class SavingGoalDirectory(BaseAnalyzer):
    def get_latest_goal(self, user_id: int) -> tuple[float, str, str] | None:
        rows = self._fetch_all(
            """
            SELECT TOP 1 target_amount, deadline, source FROM saving_goals
            WHERE user_id = ? ORDER BY goal_id DESC
            """,
            (user_id,),
        )
        return (float(rows[0][0]), str(rows[0][1]), rows[0][2]) if rows else None


# ------------------------------------------------------------------
# Setup
# ------------------------------------------------------------------
def connection_factory():
    return DatabaseConnection(DatabaseConfig())


def get_or_create_user(name: str, email: str) -> int:
    directory = UserDirectory(connection_factory)
    existing = directory.find_by_email(email)
    if existing:
        return existing[0]
    input_service = FinLuxaInputService(connection_factory)
    return input_service.add_user(name, email)


def render_login_sidebar() -> int | None:
    st.sidebar.subheader("Account")
    name = st.sidebar.text_input("Name", value=st.session_state.get("name", ""))
    email = st.sidebar.text_input("Email", value=st.session_state.get("email", ""))

    if st.sidebar.button("Continue"):
        try:
            user_id = get_or_create_user(name, email)
            st.session_state["user_id"] = user_id
            st.session_state["name"] = name
            st.session_state["email"] = email
        except FinLuxaError as error:
            st.sidebar.error(str(error))

    return st.session_state.get("user_id")


# ------------------------------------------------------------------
# Pages
# ------------------------------------------------------------------
def page_dashboard(user_id: int) -> None:
    st.title("Dashboard")
    month = st.date_input("Month", value=date.today()).strftime("%Y-%m")

    reporter = ReportGenerator(connection_factory)
    try:
        summary = reporter.build_summary(user_id, month)
    except FinLuxaError as error:
        st.error(str(error))
        return

    col1, col2, col3 = st.columns(3)
    col1.metric("Income", f"{summary.income:,.0f}")
    col2.metric("Expense", f"{summary.expense:,.0f}")
    col3.metric("Balance", f"{summary.balance:,.0f}")

    st.subheader("Budget status")
    if not summary.budget_status:
        st.caption("No budget set for this month yet.")
    for status in summary.budget_status:
        st.write(f"{status.category_name}: {status.spent_amount:,.0f} / {status.limit_amount:,.0f}")
        st.progress(min(status.percent_used / 100, 1.0))

    st.subheader("Saving goal")
    goal = SavingGoalDirectory(connection_factory).get_latest_goal(user_id)
    if goal:
        target, deadline, source = goal
        progress = max(min(summary.balance / target, 1.0), 0.0) if target else 0.0
        st.write(f"Target: {target:,.0f} by {deadline} ({source})")
        st.progress(progress)
    else:
        st.caption("No saving goal set yet.")


def page_incomes(user_id: int) -> None:
    st.title("Incomes")
    input_service = FinLuxaInputService(connection_factory)
    categories = CategoryDirectory(connection_factory).list_income_categories(user_id)

    with st.form("add_income_form"):
        category_names = [name for _, name in categories]
        category_choice = st.selectbox("Category", category_names + ["+ New category"])
        new_category_name = ""
        if category_choice == "+ New category":
            new_category_name = st.text_input("New category name")
        amount = st.number_input("Amount", min_value=0.0, step=1000.0)
        entry_date = st.date_input("Date", value=date.today())
        submitted = st.form_submit_button("Add income")

    if submitted:
        try:
            if category_choice == "+ New category":
                category_id = input_service.add_income_category(user_id, new_category_name)
            else:
                category_id = next(cid for cid, name in categories if name == category_choice)
            input_service.add_income(user_id, category_id, amount, entry_date.isoformat())
            st.success("Income added.")
        except FinLuxaError as error:
            st.error(str(error))


def page_expenses(user_id: int) -> None:
    st.title("Expenses")
    input_service = FinLuxaInputService(connection_factory)
    categories = CategoryDirectory(connection_factory).list_expense_categories(user_id)

    with st.form("add_expense_form"):
        category_names = [name for _, name in categories]
        category_choice = st.selectbox("Category", category_names + ["+ New category"])
        new_category_name = ""
        if category_choice == "+ New category":
            new_category_name = st.text_input("New category name")
        amount = st.number_input("Amount", min_value=0.0, step=1000.0)
        entry_date = st.date_input("Date", value=date.today())
        submitted = st.form_submit_button("Add expense")

    if submitted:
        try:
            if category_choice == "+ New category":
                category_id = input_service.add_expense_category(user_id, new_category_name)
            else:
                category_id = next(cid for cid, name in categories if name == category_choice)
            input_service.add_expense(user_id, category_id, amount, entry_date.isoformat())
            st.success("Expense added.")
        except FinLuxaError as error:
            st.error(str(error))

    st.divider()
    st.subheader("Set a monthly budget limit")
    with st.form("set_budget_form"):
        category_names = [name for _, name in categories]
        budget_category = st.selectbox("Category", category_names, key="budget_category")
        limit_amount = st.number_input("Limit amount", min_value=0.0, step=1000.0)
        month = st.date_input("Month", value=date.today()).strftime("%Y-%m")
        budget_submitted = st.form_submit_button("Set budget")

    if budget_submitted and category_names:
        try:
            category_id = next(cid for cid, name in categories if name == budget_category)
            input_service.add_budget_allocation(
                user_id, category_id, limit_amount, month, source="manual"
            )
            st.success("Budget limit set.")
        except FinLuxaError as error:
            st.error(str(error))


def page_incomes_table(user_id: int) -> None:
    st.title("Incomes table")
    rows = TransactionDirectory(connection_factory).list_incomes(user_id)
    if not rows:
        st.caption("No incomes recorded yet.")
        return
    st.dataframe(
        [{"Date": d, "Category": c, "Amount": a} for d, c, a in rows],
        use_container_width=True,
    )


def page_expenses_table(user_id: int) -> None:
    st.title("Expenses table")
    rows = TransactionDirectory(connection_factory).list_expenses(user_id)
    if not rows:
        st.caption("No expenses recorded yet.")
        return
    st.dataframe(
        [{"Date": d, "Category": c, "Amount": a} for d, c, a in rows],
        use_container_width=True,
    )


def page_expenses_chart(user_id: int) -> None:
    st.title("Expenses chart")
    month = st.date_input("Month", value=date.today()).strftime("%Y-%m")
    reporter = ReportGenerator(connection_factory)
    try:
        chart_data = reporter.to_chart_data(user_id, month)
    except FinLuxaError as error:
        st.error(str(error))
        return

    if not any(chart_data.values()):
        st.caption("No expenses recorded for this month yet.")
        return
    st.bar_chart(chart_data)


def page_reports_and_analysis(user_id: int) -> None:
    st.title("Reports and analysis")

    st.subheader("Expense trend (last 6 months)")
    analyzer = ExpenseAnalyzer(connection_factory)
    trend = analyzer.trend_last_months(user_id, 6)
    st.line_chart({month: total for month, total in trend})

    st.subheader("Suggestions")
    advisor = SavingsAdvisor(connection_factory)
    categories = CategoryDirectory(connection_factory).list_expense_categories(user_id)

    if categories:
        category_names = [name for _, name in categories]
        chosen = st.selectbox("Suggest a budget for", category_names)
        month = st.date_input("For month", value=date.today(), key="suggest_month").strftime("%Y-%m")
        if st.button("Suggest budget allocation"):
            try:
                category_id = next(cid for cid, name in categories if name == chosen)
                advisor.suggest_budget_allocation(user_id, category_id, month)
                st.success("Suggested budget saved.")
            except FinLuxaError as error:
                st.error(str(error))

    if st.button("Suggest saving goal"):
        try:
            advisor.suggest_saving_goal(user_id)
            st.success("Suggested saving goal saved.")
        except FinLuxaError as error:
            st.error(str(error))


PAGE_RENDERERS = {
    "Dashboard": page_dashboard,
    "Incomes": page_incomes,
    "Expenses": page_expenses,
    "Incomes table": page_incomes_table,
    "Expenses table": page_expenses_table,
    "Expenses chart": page_expenses_chart,
    "Reports and analysis": page_reports_and_analysis,
}


# ------------------------------------------------------------------
# Entry point
# ------------------------------------------------------------------
def main() -> None:
    st.set_page_config(page_title="FinLuxa", layout="wide")

    user_id = render_login_sidebar()
    if not user_id:
        st.info("Enter your name and email in the sidebar, then click Continue.")
        return

    st.sidebar.divider()
    page = st.sidebar.radio("Pages", PAGES)
    PAGE_RENDERERS[page](user_id)


if __name__ == "__main__":
    main()

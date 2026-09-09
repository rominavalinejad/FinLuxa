"""FinLuxa — Streamlit GUI.

Thin presentation layer: reads/writes go through FinLuxaInputService (Input
Data) and the Brain classes (BudgetCalculator, ExpenseAnalyzer,
SavingsAdvisor, ReportGenerator). This file should not contain business
logic beyond simple display formatting.
"""

from __future__ import annotations

import base64
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

ACCOUNT_CSS = """
<style>
.finluxa-avatar-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 4px;
}
.finluxa-avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ddd;
}
.finluxa-avatar-placeholder {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
    border: 2px solid #ddd;
}
section[data-testid="stSidebar"] div[data-testid="stVerticalBlockBorderWrapper"] > div {
    display: flex;
    flex-direction: column;
    min-height: 88vh;
}
.finluxa-logout-spacer {
    flex-grow: 1;
}
</style>
"""


# ------------------------------------------------------------------
# Small read-only helpers needed only by the GUI (not part of Brain)
# ------------------------------------------------------------------
class UserDirectory(BaseAnalyzer):
    def find_by_email(self, email: str) -> tuple[int, str] | None:
        rows = self._fetch_all(
            "SELECT user_id, name FROM users WHERE email = ?", (email,)
        )
        return (rows[0][0], rows[0][1]) if rows else None

    def get_profile_picture(self, user_id: int) -> bytes | None:
        rows = self._fetch_all(
            "SELECT profile_picture FROM users WHERE user_id = ?", (user_id,)
        )
        return rows[0][0] if rows and rows[0][0] is not None else None


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


def _rerun() -> None:
    """Compatibility wrapper across Streamlit versions."""
    try:
        st.rerun()
    except AttributeError:
        st.experimental_rerun()


def _restore_session_from_url() -> None:
    """Log the user back in automatically if their email is still in the URL."""
    if "user_id" in st.session_state:
        return
    try:
        params = dict(st.query_params)
    except AttributeError:
        params = st.experimental_get_query_params()

    email = params.get("email")
    email = email[0] if isinstance(email, list) else email
    if not email:
        return

    name = params.get("name")
    name = name[0] if isinstance(name, list) else name

    try:
        user_id = get_or_create_user(name or email, email)
        st.session_state["user_id"] = user_id
        st.session_state["name"] = name or email
        st.session_state["email"] = email
    except FinLuxaError:
        pass


def _remember_in_url(name: str, email: str) -> None:
    try:
        st.query_params["email"] = email
        st.query_params["name"] = name
    except AttributeError:
        st.experimental_set_query_params(email=email, name=name)


def _forget_url() -> None:
    try:
        st.query_params.clear()
    except AttributeError:
        st.experimental_set_query_params()


def render_account_header() -> int | None:
    st.markdown(ACCOUNT_CSS, unsafe_allow_html=True)
    st.sidebar.subheader("Account")
    _restore_session_from_url()

    if "user_id" in st.session_state:
        user_id = st.session_state["user_id"]
        picture = UserDirectory(connection_factory).get_profile_picture(user_id)

        st.sidebar.markdown('<div class="finluxa-avatar-wrap">', unsafe_allow_html=True)
        if picture:
            b64_image = base64.b64encode(picture).decode()
            st.sidebar.markdown(
                f'<img src="data:image/png;base64,{b64_image}" class="finluxa-avatar">',
                unsafe_allow_html=True,
            )
        else:
            st.sidebar.markdown(
                '<div class="finluxa-avatar-placeholder">👤</div>', unsafe_allow_html=True
            )
        st.sidebar.markdown("</div>", unsafe_allow_html=True)

        col1, col2, col3 = st.sidebar.columns([1, 2, 1])
        with col2:
            if st.button("Edit photo", key="toggle_avatar_editor", use_container_width=True):
                st.session_state["show_avatar_editor"] = not st.session_state.get(
                    "show_avatar_editor", False
                )

        if st.session_state.get("show_avatar_editor"):
            uploaded = st.sidebar.file_uploader(
                "New photo", type=["png", "jpg", "jpeg"], key="avatar_upload"
            )
            if uploaded is not None:
                try:
                    FinLuxaInputService(connection_factory).update_profile_picture(
                        user_id, uploaded.getvalue()
                    )
                    st.session_state["show_avatar_editor"] = False
                    _rerun()
                except FinLuxaError as error:
                    st.sidebar.error(str(error))

            if picture and st.sidebar.button("Remove photo", key="remove_avatar"):
                try:
                    FinLuxaInputService(connection_factory).update_profile_picture(user_id, None)
                    st.session_state["show_avatar_editor"] = False
                    _rerun()
                except FinLuxaError as error:
                    st.sidebar.error(str(error))

        st.sidebar.markdown(
            f"<p style='text-align:center; margin-bottom:0'><b>{st.session_state.get('name')}</b></p>",
            unsafe_allow_html=True,
        )
        st.sidebar.markdown(
            f"<p style='text-align:center; color:gray; font-size:0.85em'>User ID: {user_id}</p>",
            unsafe_allow_html=True,
        )

        return user_id

    name = st.sidebar.text_input("Name")
    email = st.sidebar.text_input("Email")
    if st.sidebar.button("Continue"):
        try:
            user_id = get_or_create_user(name, email)
            st.session_state["user_id"] = user_id
            st.session_state["name"] = name
            st.session_state["email"] = email
            _remember_in_url(name, email)
            _rerun()
        except FinLuxaError as error:
            st.sidebar.error(str(error))

    return None


def render_logout_button() -> None:
    st.sidebar.markdown('<div class="finluxa-logout-spacer"></div>', unsafe_allow_html=True)
    if st.sidebar.button("Log out", use_container_width=True):
        st.session_state.clear()
        _forget_url()
        _rerun()


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

    category_names = [name for _, name in categories]
    category_choice = st.selectbox(
        "Category", category_names + ["+ New category"], key="income_category_choice"
    )
    new_category_name = ""
    if category_choice == "+ New category":
        new_category_name = st.text_input("New category name", key="income_new_category_name")

    amount = st.number_input("Amount", min_value=0.0, step=1000.0, key="income_amount")

    no_date = st.checkbox("No specific date", key="income_no_date")
    entry_date = None
    if not no_date:
        entry_date = st.date_input("Date", value=date.today(), key="income_date")

    if st.button("Add income"):
        try:
            if category_choice == "+ New category":
                category_id = input_service.add_income_category(user_id, new_category_name)
            else:
                category_id = next(cid for cid, name in categories if name == category_choice)
            date_str = entry_date.isoformat() if entry_date else None
            input_service.add_income(user_id, category_id, amount, date_str)
            st.success("Income added.")
        except FinLuxaError as error:
            st.error(str(error))


def page_expenses(user_id: int) -> None:
    st.title("Expenses")
    input_service = FinLuxaInputService(connection_factory)
    categories = CategoryDirectory(connection_factory).list_expense_categories(user_id)

    category_names = [name for _, name in categories]
    category_choice = st.selectbox(
        "Category", category_names + ["+ New category"], key="expense_category_choice"
    )
    new_category_name = ""
    if category_choice == "+ New category":
        new_category_name = st.text_input("New category name", key="expense_new_category_name")

    amount = st.number_input("Amount", min_value=0.0, step=1000.0, key="expense_amount")

    no_date = st.checkbox("No specific date", key="expense_no_date")
    entry_date = None
    if not no_date:
        entry_date = st.date_input("Date", value=date.today(), key="expense_date")

    if st.button("Add expense"):
        try:
            if category_choice == "+ New category":
                category_id = input_service.add_expense_category(user_id, new_category_name)
            else:
                category_id = next(cid for cid, name in categories if name == category_choice)
            date_str = entry_date.isoformat() if entry_date else None
            input_service.add_expense(user_id, category_id, amount, date_str)
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
        [{"Date": d if d else "No date", "Category": c, "Amount": a} for d, c, a in rows],
        use_container_width=True,
    )


def page_expenses_table(user_id: int) -> None:
    st.title("Expenses table")
    rows = TransactionDirectory(connection_factory).list_expenses(user_id)
    if not rows:
        st.caption("No expenses recorded yet.")
        return
    st.dataframe(
        [{"Date": d if d else "No date", "Category": c, "Amount": a} for d, c, a in rows],
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

    user_id = render_account_header()
    if not user_id:
        st.info("Enter your name and email in the sidebar, then click Continue.")
        return

    st.sidebar.divider()
    page = st.sidebar.radio("Pages", PAGES)

    render_logout_button()

    PAGE_RENDERERS[page](user_id)


if __name__ == "__main__":
    main()

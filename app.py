"""FinLuxa — Streamlit GUI.

Thin presentation layer: reads/writes go through FinLuxaInputService (Input
Data) and the Brain classes (BudgetCalculator, ExpenseAnalyzer,
SavingsAdvisor, ReportGenerator). This file should not contain business
logic beyond simple display formatting.
"""

from __future__ import annotations

import base64
import calendar
from datetime import date

import plotly.graph_objects as go
import streamlit as st

from brain import (
    BaseAnalyzer,
    BudgetCalculator,
    ExpenseAnalyzer,
    IncomeAnalyzer,
    ReportGenerator,
    SavingsAdvisor,
    _last_n_months,
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
    "Incomes chart",
    "Expenses chart",
    "Reports and analysis",
]

ACCOUNT_CSS = """
<style>
.finluxa-avatar-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 4px;
}
/* Streamlit wraps our markdown in its own container that doesn't always
   stretch to full width — force it to, so centering actually works */
section[data-testid="stSidebar"] div:has(> .finluxa-avatar-wrap) {
    display: flex;
    justify-content: center;
    width: 100%;
}
.finluxa-avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ffffff;
}
.finluxa-avatar-placeholder {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: #6f89b3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
    border: 2px solid #ffffff;
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

THEME_CSS = """
<style>
/* Dashboard (main content) background */
[data-testid="stAppViewContainer"] {
    background-color: #001f54;
}
[data-testid="stHeader"] {
    background-color: rgba(0, 0, 0, 0);
}

/* Give the main content breathing room instead of hugging the viewport edges */
[data-testid="stAppViewContainer"] .block-container,
[data-testid="stMainBlockContainer"] {
    padding-top: 3rem;
    padding-left: 4rem;
    padding-right: 4rem;
    padding-bottom: 3rem;
    max-width: 1100px;
}

/* Sidebar background */
section[data-testid="stSidebar"] {
    background-color: #8aa4c8;
}

/* All text white */
[data-testid="stAppViewContainer"] * ,
section[data-testid="stSidebar"] * {
    color: #ffffff !important;
}

/* Keep input fields readable: dark fields on the dashboard, */
/* slightly darker-than-sidebar fields inside the sidebar    */
[data-testid="stAppViewContainer"] input,
[data-testid="stAppViewContainer"] textarea,
[data-testid="stAppViewContainer"] [data-baseweb="select"] > div {
    background-color: #001f54;
    color: #ffffff !important;
}
section[data-testid="stSidebar"] input,
section[data-testid="stSidebar"] textarea,
section[data-testid="stSidebar"] [data-baseweb="select"] > div {
    background-color: #6f89b3;
    color: #ffffff !important;
}

/* Buttons keep a light background — text must stay dark for contrast */
[data-testid="stAppViewContainer"] button,
section[data-testid="stSidebar"] button {
    color: #001f54 !important;
}
[data-testid="stAppViewContainer"] button *,
section[data-testid="stSidebar"] button * {
    color: #001f54 !important;
}

/* Give charts breathing room and soft rounded corners */
[data-testid="stElementContainer"]:has([data-testid="stVegaLiteChart"]),
[data-testid="stElementContainer"]:has([data-testid="stArrowVegaLiteChart"]),
[data-testid="stElementContainer"]:has([data-testid="stLineChart"]),
[data-testid="stElementContainer"]:has([data-testid="stBarChart"]),
[data-testid="stElementContainer"]:has([data-testid="stPlotlyChart"]) {
    padding: 20px;
    border-radius: 18px;
    background-color: rgba(255, 255, 255, 0.06);
    margin-top: 8px;
    margin-bottom: 16px;
    overflow: hidden;
}
[data-testid="stVegaLiteChart"] canvas,
[data-testid="stVegaLiteChart"] svg,
[data-testid="stArrowVegaLiteChart"] canvas,
[data-testid="stArrowVegaLiteChart"] svg {
    border-radius: 10px;
    overflow: hidden;
}
</style>
"""


# ------------------------------------------------------------------
# Small read-only helpers needed only by the GUI (not part of Brain)
# ------------------------------------------------------------------
class UserDirectory(BaseAnalyzer):
    def find_by_email(self, email: str) -> tuple[int, str, str | None] | None:
        rows = self._fetch_all(
            "SELECT user_id, name, username FROM users WHERE email = ?", (email,)
        )
        return (rows[0][0], rows[0][1], rows[0][2]) if rows else None

    def get_username(self, user_id: int) -> str | None:
        rows = self._fetch_all(
            "SELECT username FROM users WHERE user_id = ?", (user_id,)
        )
        return rows[0][0] if rows else None

    def is_username_taken(self, username: str, exclude_user_id: int | None = None) -> bool:
        if exclude_user_id is not None:
            rows = self._fetch_all(
                "SELECT user_id FROM users WHERE LOWER(username) = LOWER(?) AND user_id <> ?",
                (username, exclude_user_id),
            )
        else:
            rows = self._fetch_all(
                "SELECT user_id FROM users WHERE LOWER(username) = LOWER(?)", (username,)
            )
        return len(rows) > 0

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

    def undated_summary(self, user_id: int) -> tuple[int, float, int, float]:
        """
        Return (income_count, income_total, expense_count, expense_total) for
        entries saved without a specific date. These are intentionally excluded
        from every month-filtered chart, since they belong to no single month.
        """
        income_rows = self._fetch_all(
            "SELECT COUNT(*), COALESCE(SUM(amount), 0) FROM incomes "
            "WHERE user_id = ? AND date IS NULL",
            (user_id,),
        )
        expense_rows = self._fetch_all(
            "SELECT COUNT(*), COALESCE(SUM(amount), 0) FROM expenses "
            "WHERE user_id = ? AND date IS NULL",
            (user_id,),
        )
        return (
            int(income_rows[0][0]),
            float(income_rows[0][1]),
            int(expense_rows[0][0]),
            float(expense_rows[0][1]),
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

    try:
        existing = UserDirectory(connection_factory).find_by_email(email)
    except FinLuxaError:
        return
    if not existing:
        return  # unknown email in the URL — fall back to the registration form

    found_id, found_name, found_username = existing
    st.session_state["user_id"] = found_id
    st.session_state["name"] = found_name
    st.session_state["username"] = found_username
    st.session_state["email"] = email


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

        if "username" not in st.session_state:
            st.session_state["username"] = UserDirectory(connection_factory).get_username(user_id)
        username = st.session_state.get("username")

        if not username:
            st.sidebar.info("Choose a username to finish setting up your account.")
            candidate = st.sidebar.text_input(
                "Username (4+ chars — letters, numbers, underscore)", key="new_username_choice"
            )
            if st.sidebar.button("Save username"):
                try:
                    if UserDirectory(connection_factory).is_username_taken(
                        candidate, exclude_user_id=user_id
                    ):
                        st.sidebar.error("That username is already taken.")
                    else:
                        FinLuxaInputService(connection_factory).set_username(user_id, candidate)
                        st.session_state["username"] = candidate
                        _rerun()
                except FinLuxaError as error:
                    st.sidebar.error(str(error))
            return user_id

        picture = UserDirectory(connection_factory).get_profile_picture(user_id)

        if picture:
            b64_image = base64.b64encode(picture).decode()
            avatar_html = (
                '<div class="finluxa-avatar-wrap">'
                f'<img src="data:image/png;base64,{b64_image}" class="finluxa-avatar">'
                "</div>"
            )
        else:
            avatar_html = (
                '<div class="finluxa-avatar-wrap">'
                '<div class="finluxa-avatar-placeholder">👤</div>'
                "</div>"
            )
        st.sidebar.markdown(avatar_html, unsafe_allow_html=True)

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
            f"<p style='text-align:center; color:gray; font-size:0.85em'>@{username}</p>",
            unsafe_allow_html=True,
        )

        return user_id

    name = st.sidebar.text_input("Name")
    email = st.sidebar.text_input("Email")
    username = st.sidebar.text_input("Username (4+ chars — letters, numbers, underscore)")
    if st.sidebar.button("Continue"):
        try:
            existing = UserDirectory(connection_factory).find_by_email(email)
            if existing:
                found_id, found_name, found_username = existing
                st.session_state["user_id"] = found_id
                st.session_state["name"] = found_name
                st.session_state["username"] = found_username
                st.session_state["email"] = email
                _remember_in_url(found_name, email)
                _rerun()
            elif UserDirectory(connection_factory).is_username_taken(username):
                st.sidebar.error("That username is already taken.")
            else:
                new_id = FinLuxaInputService(connection_factory).add_user(name, email, username)
                st.session_state["user_id"] = new_id
                st.session_state["name"] = name
                st.session_state["username"] = username
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
def _render_income_expense_donut(income: float, expense: float, remaining: float) -> None:
    """
    Shows how income splits into expense vs. remaining — used when the user
    has not manually set a saving goal, instead of a confusing auto-target
    comparison.
    """
    if income <= 0:
        st.caption("No income recorded for this month yet.")
        return

    fig = go.Figure(
        data=[
            go.Pie(
                labels=["Income", "Expense", "Net"],
                values=[income, expense, remaining],
                hole=0.6,
                marker=dict(colors=["#2ecc71", "#e74c3c", "#4da3ff"]),
                textinfo="label+percent",
                textposition="outside",
                sort=False,
            )
        ]
    )
    fig.update_layout(
        showlegend=True,
        legend=dict(orientation="h", y=-0.15, font=dict(color="#ffffff")),
        margin=dict(l=40, r=40, t=20, b=0),
        height=320,
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#ffffff"),
    )
    st.plotly_chart(fig, use_container_width=True)


_GREEN_PALETTE = [
    "#10451d", "#155d27", "#1a7431", "#208b3a",
    "#25a244", "#2dc653", "#4ad66d",
]  # darkest -> lightest
_RED_PALETTE = [
    "#461220", "#641220", "#85182a", "#a11d33",
    "#c71f37", "#da1e37", "#ef233c",
]  # darkest -> lightest
_REMAINING_COLOR = "#4da3ff"


def _blend(from_hex: str, to_hex: str, ratio: float) -> str:
    """Blend from from_hex (ratio=0) to to_hex (ratio=1)."""
    ratio = max(0.0, min(ratio, 1.0))
    fr, fg, fb = int(from_hex[1:3], 16), int(from_hex[3:5], 16), int(from_hex[5:7], 16)
    tr, tg, tb = int(to_hex[1:3], 16), int(to_hex[3:5], 16), int(to_hex[5:7], 16)
    r = round(fr + (tr - fr) * ratio)
    g = round(fg + (tg - fg) * ratio)
    b = round(fb + (tb - fb) * ratio)
    return f"#{r:02x}{g:02x}{b:02x}"


def _gradient_colors(palette: list[str], n: int) -> list[str]:
    """
    Return n colors, darkest first, following ``palette`` in order.
    If n exceeds the palette size, smoothly extends the same gradient
    (interpolating between consecutive palette stops) to produce as
    many colors as needed, keeping the same dark-to-light logic.
    """
    if n <= 0:
        return []
    if n <= len(palette):
        return palette[:n]

    last_index = len(palette) - 1
    colors = []
    for i in range(n):
        position = i * last_index / (n - 1)
        lo = int(position)
        hi = min(lo + 1, last_index)
        fraction = position - lo
        colors.append(_blend(palette[lo], palette[hi], fraction))
    return colors


def _colors_by_rank(items: list[tuple[str, float]], palette: list[str]) -> list[str]:
    """
    Assign colors strictly by impact rank: the largest amount gets the
    darkest color, the next largest gets the next color in the palette,
    and so on — regardless of how close or far apart the actual amounts
    are. Output preserves the original ``items`` order (for slice
    placement); only the color-to-item mapping follows the ranking.
    """
    if not items:
        return []
    ranked_colors = _gradient_colors(palette, len(items))
    order_by_amount_desc = sorted(range(len(items)), key=lambda i: items[i][1], reverse=True)
    colors: list[str | None] = [None] * len(items)
    for rank, original_index in enumerate(order_by_amount_desc):
        colors[original_index] = ranked_colors[rank]
    return colors  # type: ignore[return-value]


def _render_category_breakdown_donut(
    income_by_category: dict[str, float],
    expense_by_category: dict[str, float],
    remaining: float,
) -> None:
    """
    A detailed donut: every income category (green shades) and every expense
    category (red shades), plus the leftover Remaining slice (blue) — so the
    user can see which specific category dominates their income or spending.
    Labels live only in the legend (on the right); the ring stays on the left.
    """
    income_items = [(name, amount) for name, amount in income_by_category.items() if amount > 0]
    expense_items = [(name, amount) for name, amount in expense_by_category.items() if amount > 0]
    remaining = max(remaining, 0.0)

    if not income_items and not expense_items:
        st.caption("No incomes or expenses recorded for this month yet.")
        return

    labels = [name for name, _ in income_items] + ["Net"] + [name for name, _ in expense_items]
    values = [amount for _, amount in income_items] + [remaining] + [amount for _, amount in expense_items]
    colors = (
        _colors_by_rank(income_items, _GREEN_PALETTE)
        + [_REMAINING_COLOR]
        + _colors_by_rank(expense_items, _RED_PALETTE)
    )

    fig = go.Figure(
        data=[
            go.Pie(
                labels=labels,
                values=values,
                hole=0.6,
                marker=dict(colors=colors),
                textinfo="none",
                sort=False,
                domain=dict(x=[0, 0.55]),
            )
        ]
    )
    fig.update_layout(
        showlegend=True,
        legend=dict(font=dict(color="#ffffff"), x=1.0, y=0.5, xanchor="left", yanchor="middle"),
        margin=dict(l=20, r=180, t=20, b=20),
        height=320,
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#ffffff"),
    )
    st.plotly_chart(fig, use_container_width=True)


def _render_donut(percent_used: float, title: str) -> None:
    """A small donut chart showing percent_used (0-100) with a centered label."""
    percent_used = max(0.0, min(percent_used, 100.0))
    remaining = 100.0 - percent_used

    fig = go.Figure(
        data=[
            go.Pie(
                values=[percent_used, remaining],
                hole=0.65,
                marker=dict(colors=["#4da3ff", "#22345c"]),
                textinfo="none",
                sort=False,
                direction="clockwise",
            )
        ]
    )
    fig.update_layout(
        showlegend=False,
        margin=dict(l=0, r=0, t=36, b=0),
        height=220,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#ffffff"),
        title=dict(text=title, x=0.5, xanchor="center", font=dict(size=14)),
        annotations=[
            dict(
                text=f"{percent_used:.0f}%",
                x=0.5,
                y=0.5,
                font_size=20,
                showarrow=False,
                font=dict(color="#ffffff"),
            )
        ],
    )
    st.plotly_chart(fig, use_container_width=True)


_MONTH_LINE_COLORS = ["#1f6feb", "#7cc4fa", "#ef233c"]


def _fetch_daily_series(user_id: int, selected_months: list[str]) -> list[tuple[str, list[int], list[float]]]:
    """Return (month, days, amounts) for each selected month, days padded with zeros."""
    analyzer = ExpenseAnalyzer(connection_factory)
    series = []
    for month in selected_months:
        totals_by_day = analyzer.daily_totals(user_id, month)
        year, month_number = (int(part) for part in month.split("-"))
        days_in_month = calendar.monthrange(year, month_number)[1]
        days = list(range(1, days_in_month + 1))
        amounts = [totals_by_day.get(day, 0.0) for day in days]
        series.append((month, days, amounts))
    return series


def _render_daily_expense_pattern(
    series: list[tuple[str, list[int], list[float]]]
) -> None:
    """
    Line chart comparing day-by-day expenses across up to three months.
    Each month is one line; days with no expense count as zero so a sudden
    spike stands out against otherwise flat stretches. A month's line stops
    at its real last day rather than being padded out to 31.
    """
    fig = go.Figure()
    has_any_data = False

    for index, (month, days, amounts) in enumerate(series):
        if any(amounts):
            has_any_data = True

        fig.add_trace(
            go.Scatter(
                x=days,
                y=amounts,
                mode="lines",
                name=month,
                line=dict(color=_MONTH_LINE_COLORS[index % len(_MONTH_LINE_COLORS)], width=2),
            )
        )

    if not has_any_data:
        st.caption("No expenses recorded for the selected months yet.")
        return

    y_axis = dict(gridcolor="rgba(255,255,255,0.15)", title="Amount")
    if st.session_state.get("daily_pattern_manual_range"):
        y_min = st.session_state.get("daily_pattern_y_min")
        y_max = st.session_state.get("daily_pattern_y_max")
        if y_min is None or y_max is None:
            pass
        elif y_max <= y_min:
            st.warning(
                f"Maximum ({y_max:,.0f}) must be greater than Minimum ({y_min:,.0f}). "
                "Using the automatic range instead."
            )
        else:
            y_axis["range"] = [y_min, y_max]

    fig.update_layout(
        xaxis=dict(
            tickmode="linear",
            dtick=1,
            range=[1, 31],
            gridcolor="rgba(255,255,255,0.08)",
            title="Day of month",
        ),
        yaxis=y_axis,
        legend=dict(orientation="h", y=-0.25, font=dict(color="#ffffff")),
        margin=dict(l=20, r=20, t=20, b=20),
        height=360,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#ffffff"),
    )
    st.plotly_chart(fig, use_container_width=True)


_PEAK_EXPENSE_COLOR = "#1f6feb"
_PEAK_EXPENSE_ALL_OPTION = "ALL (last 12 months)"


def _render_peak_expenses_chart(user_id: int) -> None:
    """
    Horizontal bar chart ranking the selected months by total expense,
    largest at the top — helps the user spot their costliest month(s) at
    a glance. Month labels include the Gregorian year (e.g. '2026-02')
    since the 12-month window can span two calendar years.
    """
    analyzer = ExpenseAnalyzer(connection_factory)
    try:
        trend = analyzer.trend_last_months(user_id, 12)
    except FinLuxaError as error:
        st.error(str(error))
        return

    all_months = [month for month, _ in trend]
    totals_by_month = dict(trend)
    months_with_data = [month for month in all_months if totals_by_month[month] > 0]

    options = [_PEAK_EXPENSE_ALL_OPTION] + all_months[::-1]
    default_selection = months_with_data if months_with_data else all_months

    selected = st.multiselect(
        "Compare months (min 2, or choose ALL)",
        options=options,
        default=default_selection,
        key="peak_expenses_months",
    )

    chosen_months = all_months if _PEAK_EXPENSE_ALL_OPTION in selected else selected

    if len(chosen_months) < 2:
        st.caption("Select at least 2 months (or choose ALL) to compare.")
        return

    ranked = sorted(
        ((month, totals_by_month.get(month, 0.0)) for month in chosen_months),
        key=lambda item: item[1],
        reverse=True,
    )
    labels = [month for month, _ in ranked]
    values = [amount for _, amount in ranked]

    fig = go.Figure(
        go.Bar(x=values, y=labels, orientation="h", marker=dict(color=_PEAK_EXPENSE_COLOR))
    )
    fig.update_layout(
        yaxis=dict(
            autorange="reversed",
            categoryorder="array",
            categoryarray=labels,
        ),
        xaxis=dict(title="Expense amount", gridcolor="rgba(255,255,255,0.1)"),
        margin=dict(l=20, r=20, t=20, b=20),
        height=min(max(320, 40 * len(labels)), 520),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#ffffff"),
    )
    st.plotly_chart(fig, use_container_width=True)


def page_dashboard(user_id: int) -> None:
    st.title("Dashboard")
    month = st.date_input(
        "Month",
        value=date.today(),
        help="Pick any day in the month you want to view. Only the metrics above "
        "use this — each chart below has its own month selector.",
        key="dashboard_top_month",
    ).strftime("%Y-%m")

    reporter = ReportGenerator(connection_factory)
    try:
        summary = reporter.build_summary(user_id, month)
    except FinLuxaError as error:
        st.error(str(error))
        return

    col1, col2, col3 = st.columns(3)
    col1.metric("Income", f"{summary.income:,.0f}")
    col2.metric("Expense", f"{summary.expense:,.0f}")
    col3.metric("Remaining income", f"{summary.balance:,.0f}")

    income_count, income_total, expense_count, expense_total = TransactionDirectory(
        connection_factory
    ).undated_summary(user_id)
    if income_count or expense_count:
        parts = []
        if income_count:
            parts.append(f"{income_count} income(s) totalling {income_total:,.0f}")
        if expense_count:
            parts.append(f"{expense_count} expense(s) totalling {expense_total:,.0f}")
        st.info(
            "Not included in the charts below: "
            + " and ".join(parts)
            + " saved without a specific date. Add a date to include them in a month."
        )

    calculator = BudgetCalculator(connection_factory)
    month_picker_options = _last_n_months(12)[::-1]

    goal = SavingGoalDirectory(connection_factory).get_latest_goal(user_id)
    if goal and goal[2] == "manual":
        st.subheader("Saving goal")
        net_month = st.selectbox("Month", options=month_picker_options, key="net_month")
        net_income = calculator.calc_total_income(user_id, net_month)
        net_expense = calculator.calc_total_expense(user_id, net_month)
        net_balance = net_income - net_expense
        target, deadline, source = goal
        percent = (net_balance / target * 100) if target else 0.0
        st.write(f"Target: {target:,.0f} by {deadline} ({source})")
        _render_donut(percent, "Progress")
    else:
        st.subheader("Net")
        net_month = st.selectbox("Month", options=month_picker_options, key="net_month")
        net_income = calculator.calc_total_income(user_id, net_month)
        net_expense = calculator.calc_total_expense(user_id, net_month)
        net_balance = net_income - net_expense
        _render_income_expense_donut(net_income, net_expense, net_balance)

    st.subheader("Category breakdown")
    breakdown_month = st.selectbox(
        "Month", options=month_picker_options, key="category_breakdown_month"
    )
    income_by_category = IncomeAnalyzer(connection_factory).group_by_category(
        user_id, breakdown_month
    )
    expense_by_category = ExpenseAnalyzer(connection_factory).group_by_category(
        user_id, breakdown_month
    )
    breakdown_balance = sum(income_by_category.values()) - sum(expense_by_category.values())
    _render_category_breakdown_donut(income_by_category, expense_by_category, breakdown_balance)

    st.subheader("Monthly expenses compare")
    month_options = _last_n_months(12)[::-1]
    selected_months = st.multiselect(
        "Compare months (up to 3)",
        options=month_options,
        default=month_options[:3],
        max_selections=3,
        key="daily_pattern_months",
    )

    if not selected_months:
        st.caption("Select at least one month to compare.")
        return

    try:
        series = _fetch_daily_series(user_id, sorted(selected_months))
    except FinLuxaError as error:
        st.error(str(error))
        return

    all_amounts = [amount for _, _, amounts in series for amount in amounts]
    data_max = max(all_amounts) if all_amounts else 1_000_000.0
    suggested_max = round(data_max * 1.1, 2) if data_max > 0 else 1_000_000.0

    st.checkbox("Set value range manually", key="daily_pattern_manual_range")
    if st.session_state.get("daily_pattern_manual_range"):
        range_step = max(round(suggested_max / 20, 2), 1.0)
        range_col1, range_col2 = st.columns(2)
        with range_col1:
            st.number_input("Minimum", value=0.0, step=range_step, key="daily_pattern_y_min")
        with range_col2:
            st.number_input(
                "Maximum", value=suggested_max, step=range_step, key="daily_pattern_y_max"
            )

    _render_daily_expense_pattern(series)

    st.subheader("Peak Expenses by Month")
    _render_peak_expenses_chart(user_id)



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
    entry_date = st.date_input("Date", value=date.today(), key="income_date")

    if st.button("Add income"):
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

    category_names = [name for _, name in categories]
    category_choice = st.selectbox(
        "Category", category_names + ["+ New category"], key="expense_category_choice"
    )
    new_category_name = ""
    if category_choice == "+ New category":
        new_category_name = st.text_input("New category name", key="expense_new_category_name")

    amount = st.number_input("Amount", min_value=0.0, step=1000.0, key="expense_amount")
    entry_date = st.date_input("Date", value=date.today(), key="expense_date")

    if st.button("Add expense"):
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


def page_incomes_chart(user_id: int) -> None:
    st.title("Incomes chart")
    month = st.date_input("Month", value=date.today(), key="incomes_chart_month").strftime("%Y-%m")
    analyzer = IncomeAnalyzer(connection_factory)
    try:
        chart_data = analyzer.group_by_category(user_id, month)
    except FinLuxaError as error:
        st.error(str(error))
        return

    if not any(chart_data.values()):
        st.caption("No incomes recorded for this month yet.")
        return
    st.bar_chart(chart_data, height=320)


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
    st.bar_chart(chart_data, height=320)


def page_reports_and_analysis(user_id: int) -> None:
    st.title("Reports and analysis")

    st.subheader("Expense trend (last 6 months)")
    analyzer = ExpenseAnalyzer(connection_factory)
    trend = analyzer.trend_last_months(user_id, 6)
    st.line_chart({month: total for month, total in trend}, height=320)

    st.subheader("Your saving report")
    advisor = SavingsAdvisor(connection_factory)
    report = advisor.build_report(user_id)

    st.write(
        f"Over the last {report.lookback_months} months, you've earned an average of "
        f"**{report.avg_income:,.0f}** and spent an average of **{report.avg_expense:,.0f}** per month."
    )

    if report.suggested_target is not None:
        monthly_needed = report.suggested_target / report.deadline_months_ahead
        st.write(
            f"That leaves an average surplus of **{report.avg_balance:,.0f}** per month. "
            f"Based on this, a realistic saving goal would be **{report.suggested_target:,.0f}** "
            f"by **{report.suggested_deadline}**."
        )
        st.write(
            f"To reach this goal, you'd need to save about **{monthly_needed:,.0f}** per month — "
            f"which is comfortably within your current average surplus, leaving some safety margin."
        )
    else:
        st.write(
            f"On average, you're spending **{report.shortfall_to_break_even:,.0f}** more than "
            f"you earn each month."
        )
        st.write(
            f"To start saving anything at all, you'd first need to either cut your expenses by "
            f"about **{report.shortfall_to_break_even:,.0f}** per month, or increase your income "
            f"by the same amount, just to break even."
        )

    st.divider()
    st.subheader("Apply a suggestion")
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
    "Incomes chart": page_incomes_chart,
    "Expenses chart": page_expenses_chart,
    "Reports and analysis": page_reports_and_analysis,
}


# ------------------------------------------------------------------
# Entry point
# ------------------------------------------------------------------
def main() -> None:
    st.set_page_config(page_title="FinLuxa", layout="wide")
    st.markdown(THEME_CSS, unsafe_allow_html=True)

    user_id = render_account_header()
    if not user_id:
        st.info("Enter your details in the sidebar, then click Continue.")
        return
    if not st.session_state.get("username"):
        st.info("Please choose a username in the sidebar to continue.")
        return

    st.sidebar.divider()
    page = st.sidebar.radio("Pages", PAGES)

    render_logout_button()

    PAGE_RENDERERS[page](user_id)


if __name__ == "__main__":
    main()

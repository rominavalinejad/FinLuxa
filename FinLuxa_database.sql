-- ============================================
-- FinLuxa — Storage Layer (T-SQL for SQL Server)
-- ============================================

-- Step 1: Create the database
CREATE DATABASE FinLuxa;
GO

USE FinLuxa;
GO

-- ---------------------------------------------
-- USERS
-- ---------------------------------------------
CREATE TABLE users (
    user_id     INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL,
    email       NVARCHAR(150) NOT NULL UNIQUE,
    created_at  DATETIME NOT NULL DEFAULT GETDATE()
);

-- ---------------------------------------------
-- INCOME_CATEGORIES
-- ---------------------------------------------
CREATE TABLE income_categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT NOT NULL,
    name        NVARCHAR(100) NOT NULL,
    CONSTRAINT FK_income_categories_users FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------
-- EXPENSE_CATEGORIES
-- ---------------------------------------------
CREATE TABLE expense_categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT NOT NULL,
    name        NVARCHAR(100) NOT NULL,
    CONSTRAINT FK_expense_categories_users FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------
-- INCOMES
-- ---------------------------------------------
CREATE TABLE incomes (
    income_id   INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT NOT NULL,
    category_id INT NOT NULL,
    amount      DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    date        DATE NOT NULL,
    CONSTRAINT FK_incomes_users FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_incomes_categories FOREIGN KEY (category_id)
        REFERENCES income_categories(category_id)
);

-- ---------------------------------------------
-- EXPENSES
-- ---------------------------------------------
CREATE TABLE expenses (
    expense_id  INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT NOT NULL,
    category_id INT NOT NULL,
    amount      DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    date        DATE NOT NULL,
    CONSTRAINT FK_expenses_users FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_expenses_categories FOREIGN KEY (category_id)
        REFERENCES expense_categories(category_id)
);

-- ---------------------------------------------
-- MONTHLY_BUDGET_ALLOCATIONS
-- ---------------------------------------------
CREATE TABLE monthly_budget_allocations (
    budget_id     INT IDENTITY(1,1) PRIMARY KEY,
    user_id       INT NOT NULL,
    category_id   INT NOT NULL,             -- references expense_categories
    limit_amount  DECIMAL(18,2) NOT NULL CHECK (limit_amount > 0),
    month         CHAR(7) NOT NULL,          -- format: 'YYYY-MM'
    source        NVARCHAR(10) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto')),
    CONSTRAINT FK_budget_users FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_budget_categories FOREIGN KEY (category_id)
        REFERENCES expense_categories(category_id),
    CONSTRAINT UQ_budget_user_cat_month UNIQUE (user_id, category_id, month)
);

-- ---------------------------------------------
-- SAVING_GOALS
-- ---------------------------------------------
CREATE TABLE saving_goals (
    goal_id        INT IDENTITY(1,1) PRIMARY KEY,
    user_id        INT NOT NULL,
    target_amount  DECIMAL(18,2) NOT NULL CHECK (target_amount > 0),
    deadline       DATE NOT NULL,
    source         NVARCHAR(10) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto')),
    CONSTRAINT FK_goals_users FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------
-- Helpful indexes
-- ---------------------------------------------
CREATE INDEX idx_incomes_user_date ON incomes(user_id, date);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_budget_user_month ON monthly_budget_allocations(user_id, month);
GO
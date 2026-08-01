# ===========================================================================
# FINE CONFIGURATION — ASOME Library
# ===========================================================================
# Change these values to adjust fine rules.
# No other file needs to be touched.
# ===========================================================================

# Number of days a member can keep a borrowed book
BORROW_PERIOD_DAYS = 10

# Fine charged per day after the due date (in RWF)
FINE_RATE_PER_DAY = 500

# Grace period — days after due date before fine starts (0 = no grace)
GRACE_PERIOD_DAYS = 0

# Maximum fine cap — set to None for no cap
# Example: MAX_FINE_AMOUNT = 5000 means fine never exceeds 5000 RWF
MAX_FINE_AMOUNT = None


# ===========================================================================
# FINE CALCULATION — do not change below this line
# ===========================================================================

def calculate_fine(days_overdue: int) -> int:
    """
    Calculate fine amount based on days overdue.

    Args:
        days_overdue: Number of days past the due date

    Returns:
        Fine amount in RWF
    """
    if days_overdue <= GRACE_PERIOD_DAYS:
        return 0

    billable_days = days_overdue - GRACE_PERIOD_DAYS
    amount        = billable_days * FINE_RATE_PER_DAY

    if MAX_FINE_AMOUNT is not None:
        amount = min(amount, MAX_FINE_AMOUNT)

    return amount


def get_fine_summary() -> dict:
    """Returns current fine configuration as a dict"""
    return {
        'borrow_period_days': BORROW_PERIOD_DAYS,
        'fine_rate_per_day':  FINE_RATE_PER_DAY,
        'grace_period_days':  GRACE_PERIOD_DAYS,
        'max_fine_amount':    MAX_FINE_AMOUNT,
        'currency':           'RWF',
    }
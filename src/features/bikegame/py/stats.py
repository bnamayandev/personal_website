def average_wpm(trials):
    """Return the average WPM for a list of trials."""
    if len(trials) == 0:
        return "ZeroDivisionError"

    wpm = 0
    for trial in trials:
        wpm += trial

    return round(wpm / len(trials), 2)

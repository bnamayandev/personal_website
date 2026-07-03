from dataclasses import dataclass


@dataclass
class GameState:
    correct_words: list
    current_word: str
    passage: list
    progress_bar_top: list
    progress_bar_bottom: list
    wpm: int
    progress: float
    icon: str

    def get_current_word(self):
        """Return the current character, or escaped when the passage is complete."""
        try:
            return self.passage[0].lower()
        except IndexError:
            return "escaped"

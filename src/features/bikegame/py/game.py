import asyncio
import time

from bike_for_your_life.state import GameState
from bike_for_your_life.terminal import Back, Fore, clear_screen, get_key, print_with_color, read_line

BIKE = "🚲"
PROGRESS_BAR_BOTTOM = [
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "_",
    "___",
    "🚩",
]


def display_passage(game_state, current_color=Back.YELLOW):
    print_with_color(f"{''.join(game_state.correct_words)}", Fore.GREEN)

    if len(game_state.passage) > 0:
        print_with_color(game_state.get_current_word(), current_color)

    print(f"{''.join(game_state.passage[1:])}\n")


def display_game_state(game_state):
    display_passage(game_state)
    print(f"\n\n{game_state.wpm} Words Per Minute")
    print(f"{game_state.progress}% done\n\n")
    print(f"{''.join(game_state.progress_bar_top)}")
    print(f"{''.join(game_state.progress_bar_bottom)}\n")


async def pedal(passage, monster, monster_speed, trials):
    """Run one level and return "lost" if the monster catches the player."""
    progress_bar_top = [monster, BIKE]
    progress_bar_bottom = PROGRESS_BAR_BOTTOM.copy()

    await read_line("\n\n[press enter to begin]\n")
    clear_screen()
    for i in range(3):
        print(3 - i)
        await asyncio.sleep(0.5)
        clear_screen()

    start = time.time()
    passage = list(passage.lower())
    correct_words = []
    current_word = ""
    wpm = 0
    progress = 0
    chars_in_passage = len(passage)

    print(f"{''.join(passage)}\n")
    print("\n\n0 Words Per Minute")
    print("0% done\n\n")
    print(f"{''.join(progress_bar_top)}")
    print(f"{''.join(progress_bar_bottom)}\n")

    game_state = GameState(
        correct_words,
        current_word,
        passage,
        progress_bar_top,
        progress_bar_bottom,
        wpm,
        progress,
        monster,
    )

    monster_steps = 0

    def run_monster():
        nonlocal monster_steps
        elapsed = time.time() - start
        due = int((elapsed - 3) / monster_speed) if elapsed > 3 else 0
        moved = False
        while (
            monster_steps < due
            and len(game_state.passage) != 0
            and game_state.icon in game_state.progress_bar_top
        ):
            game_state.progress_bar_top.insert(0, " ")
            game_state.progress_bar_top.pop(game_state.progress_bar_top.index(BIKE) - 1)
            monster_steps += 1
            moved = True
        return moved

    while (len(game_state.passage) != 0) and (game_state.icon in game_state.progress_bar_top):
        if len(passage) == 1:
            game_state.current_word = passage[0].lower()
        else:
            game_state.current_word = passage[1].lower()

        key = await get_key(monster_speed / 2)

        moved = run_monster()
        if game_state.icon not in game_state.progress_bar_top:
            clear_screen()
            return "lost"

        if key is None:
            if moved:
                clear_screen()
                display_game_state(game_state)
            continue

        key = key.lower()
        if key == "\x03":
            raise KeyboardInterrupt

        if key == passage[0].lower():
            correct_words.append(passage.pop(0))
            clear_screen()
            display_passage(game_state)
        elif key != passage[0].lower():
            clear_screen()
            display_passage(game_state, Back.RED)

        words_done = 1
        for letter in correct_words:
            if letter == " ":
                words_done += 1

        current_time = time.time() - start
        game_state.wpm = round((words_done / current_time) * 60)
        print(f"\n\n{game_state.wpm} Words Per Minute")
        trials.append(game_state.wpm)

        percent = len(correct_words) / chars_in_passage
        game_state.progress = round(percent * 100)
        print(f"{game_state.progress}% done\n\n")

        pos_bike = round(percent * len(progress_bar_bottom))
        if progress_bar_top.index(BIKE) < pos_bike:
            try:
                progress_bar_top.insert(progress_bar_top.index(monster) + 1, " ")
            except ValueError:
                return "lost"

        print(f"{''.join(progress_bar_top)}")
        print(f"{''.join(progress_bar_bottom)}\n")

        if game_state.icon not in game_state.progress_bar_top:
            clear_screen()
            return "lost"

    return None

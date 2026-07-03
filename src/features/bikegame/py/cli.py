import sys

from bike_for_your_life.game import pedal
from bike_for_your_life.passages import PASSAGES
from bike_for_your_life.state import GameState
from bike_for_your_life.stats import average_wpm
from bike_for_your_life.terminal import Back, Fore, clear_screen, print_with_color, read_line

TRIALS = []


TITLE = """
██████╗░██╗██╗░░██╗███████╗  ███████╗░█████╗░██████╗░
██╔══██╗██║██║░██╔╝██╔════╝  ██╔════╝██╔══██╗██╔══██╗
██████╦╝██║█████═╝░█████╗░░  █████╗░░██║░░██║██████╔╝
██╔══██╗██║██╔═██╗░██╔══╝░░  ██╔══╝░░██║░░██║██╔══██╗
██████╦╝██║██║░╚██╗███████╗  ██║░░░░░╚█████╔╝██║░░██║
╚═════╝░╚═╝╚═╝░░╚═╝╚══════╝  ╚═╝░░░░░░╚════╝░╚═╝░░╚═╝

██╗░░░██╗░█████╗░██╗░░░██╗██████╗░  ██╗░░░░░██╗███████╗███████╗
╚██╗░██╔╝██╔══██╗██║░░░██║██╔══██╗  ██║░░░░░██║██╔════╝██╔════╝
░╚████╔╝░██║░░██║██║░░░██║██████╔╝  ██║░░░░░██║█████╗░░█████╗░░
░░╚██╔╝░░██║░░██║██║░░░██║██╔══██╗  ██║░░░░░██║██╔══╝░░██╔══╝░░
░░░██║░░░╚█████╔╝╚██████╔╝██║░░██║  ███████╗██║██║░░░░░███████╗
░░░╚═╝░░░░╚════╝░░╚═════╝░╚═╝░░╚═╝  ╚══════╝╚═╝╚═╝░░░░░╚══════╝
"""

START_PROMPT = """
▒█▀▀█ █▀▀█ █▀▀ █▀▀ █▀▀ 　 ▒█▀▀▀ ▒█▄░▒█ ▀▀█▀▀ ▒█▀▀▀ ▒█▀▀█
▒█▄▄█ █▄▄▀ █▀▀ ▀▀█ ▀▀█ 　 ▒█▀▀▀ ▒█▒█▒█ ░▒█░░ ▒█▀▀▀ ▒█▄▄▀
▒█░░░ ▀░▀▀ ▀▀▀ ▀▀▀ ▀▀▀ 　 ▒█▄▄▄ ▒█░░▀█ ░▒█░░ ▒█▄▄▄ ▒█░▒█

▀▀█▀▀ ▒█▀▀▀█ 　 ▒█▀▀█ ▒█▀▀▀ ▒█▀▀█ ▀█▀ ▒█▄░▒█
░▒█░░ ▒█░░▒█ 　 ▒█▀▀▄ ▒█▀▀▀ ▒█░▄▄ ▒█░ ▒█▒█▒█
░▒█░░ ▒█▄▄▄█ 　 ▒█▄▄█ ▒█▄▄▄ ▒█▄▄█ ▄█▄ ▒█░░▀█



"""


def run_assertions():
    class_assertions = GameState("None", "None", "I", "None", "None", "None", "None", "None")
    assert class_assertions.get_current_word() == "i"

    class_assertions = GameState(
        "None",
        "None",
        "2020 was the year corona virus began",
        "None",
        "None",
        "None",
        "None",
        "None",
    )
    assert class_assertions.get_current_word() == "2"

    class_assertions = GameState("None", "None", "...", "None", "None", "None", "None", "None")
    assert class_assertions.get_current_word() == "."

    class_assertions = GameState("None", "None", "", "None", "None", "None", "None", "None")
    assert class_assertions.get_current_word() == "escaped"


async def replay_level_prompt():
    print("You were caught, what would you like to do\n1. Restart level\n2. Exit Game")
    choice = await read_line("Enter corresponding number: ")
    while choice not in ("1", "2"):
        choice = await read_line("Enter a valid choice: ")

    if choice == "2":
        sys.exit()

    print("\n[RESTARTED]")


async def main():
    TRIALS.clear()
    run_assertions()

    print_with_color(TITLE, Fore.BLUE)
    print_with_color(START_PROMPT, Fore.RED)
    await read_line()
    clear_screen()

    print(
        "The year is 2222, and monsters have taken over the world. Only you remain, "
        "Bry Sickle, the fastest (and now only) cyclist in the world. You must bike "
        "away from the monsters in order to survive."
    )

    while await pedal(PASSAGES[0], "👾", 2, TRIALS) == "lost":
        await replay_level_prompt()

    print_with_color(f"You are currently typing at {average_wpm(TRIALS)} WPM\n", Back.GREEN)
    print(
        "You seem to have lost it. You enter an abandoned building and choose to look "
        "inside. Instantly you see a map labeled with the building you're in and a "
        "place labeled 'CURE!!!' just a little ways away. You decide to investigate, "
        "but just as you hop onto your bike you're seen by another monster."
    )

    while await pedal(PASSAGES[1], "👹", 1.6, TRIALS) == "lost":
        await replay_level_prompt()
    clear_screen()

    print_with_color(f"You are currently typing at {average_wpm(TRIALS)} WPM\n", Back.GREEN)
    print(
        "You appear to have lost the monster. You arrive at the place labeled 'CURE!!!' "
        "on the map, and it seems to be a gated farmyard with a small shed in the distance. "
        "You hear something behind you and turn around to see largest monster ever. You "
        "instantly begin pedaling to the shed, maybe you can hope to escape it there..."
    )

    while await pedal(PASSAGES[2], "👽", 1.3, TRIALS) == "lost":
        await replay_level_prompt()

    print(
        "You hop off your bike and enter the shack panting. You see a button labelled "
        "'PRESS!!!' and pick it up. You cautiously press it and hear loud shrieks coming "
        "from outside the shed you look outside to see all the monsters lying dead. maybe "
        "they were infused with plotde vice, a special thing that kills them or something...\n"
    )
    print(f"You have saved the world while writing/pedalling at an average of {average_wpm(TRIALS)}WPM!")

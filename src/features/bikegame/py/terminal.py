import sys

import js


class Fore:
    GREEN = "\033[32m"
    BLUE = "\033[34m"
    RED = "\033[31m"


class Back:
    YELLOW = "\033[43m"
    RED = "\033[41m"
    GREEN = "\033[42m"


class Style:
    NORMAL = "\033[22m"
    RESET_ALL = "\033[0m"


def clear_screen():
    sys.stdout.flush()
    js.bikeBridge.clear()


async def get_key(timeout=None):
    ms = -1 if timeout is None else int(timeout * 1000)
    key = await js.bikeBridge.getKey(ms)
    return None if key == "" else key


async def read_line(prompt=""):
    return await js.bikeBridge.readLine(prompt)


def print_with_color(string, color, **kwargs):
    brightness = Style.NORMAL
    return print(f"{brightness}{color}{string}{Style.RESET_ALL}", end="", **kwargs)

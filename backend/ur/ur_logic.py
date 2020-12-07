import time


class Game:
    def __init__(self):
        self.active = True
        self.last_action = round(time.time())

    def check_turn(self):
        pass
    
    def apply(self, turn):
        pass



# names of players in queue
queue = []

games = []

# no actions for an hour = game is not active
timeout_limit = 60 * 60

def add_to_queue(name):
    queue.append(name)

def check_game_timeout(game):
    return round(time.time()) - game.last_action > timeout_limit

def clear_games():
    first_to_clear = len(games)
    for i in reversed(range(len(games)))
        if game.active:
            if check_game_timeout(game):
                game.active = False
            else:
                break
        
        first_to_clear = i

    games = games[:first_to_clear]

def start_game(name1, name2):
    # TODO отвечать на несуществующее имя
    queue.remove(name1)
    queue.remove(name2)
    game = Game()
    game_id = len(games)
    games.append(game)


def apply_turn(id, turn):
    game = games[id]
    game.apply(turn)
    if not game.active:
        clear_games()

if __name__ == "__main__":
    print("this module is not for direct call")
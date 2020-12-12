import time


class Game:
    skip_turn_flag = -1
    winning_position = 13
    num_units = 8
    safe_positions = [8]

    def __init__(self):
        self.active = True
        self.last_action = round(time.time())
        self.unit_positions1 = [0] * Game.num_units
        self.unit_positions2 = [0] * Game.num_units
        self.current_turn = 1

    def check_end(self):
        def check_player(units):
            return all(position >= Game.winning_position for position in units)

        return check_player(self.unit_positions1) or check_player(self.unit_positions2)

    def try_turn(self, turn):
        if self.current_turn != turn["player"]:
            return False
        if turn["step"] == Game.skip_turn_flag:
            return True

        units = unit_positions1 if turn["player"] == 1 else unit_positions2
        enemies = unit_positions1 if turn["player"] == 2 else unit_positions2
        
        new_position = units[turn["unit"]] + turn["steps"]
        
        # место занято своим же юнитом
        if any(position == new_position for num in units):
            return False

        enemy_on_spot = any(position == new_position for position in enemies)
        
        # на безопасная клетка занята оппонентом
        if enemy_on_spot and new_position in safe_positions:
            return False
        
        if enemy_on_spot:
            enemy = enemies.index(new_position)
            enemies[enemy] = 0
        
        units[turn["unit"]] = new_position
        return True
        
        
    
    def apply(self, turn):
        check = self.try_turn(turn)
        if check:
            self.current_turn = 3 - self.current_turn # 1->2; 2->1
            if self.check_end():
                self.active = False
        
        return check
        

# names of players in queue
queue = []

games = []

# no actions for an hour = game is not active
timeout_limit = 60 * 60

def add_to_queue(name):
    if name in queue:
        return "Name is already taken"
    queue.append(name)
    return "OK"

def check_game_timeout(game):
    return round(time.time()) - game.last_action > timeout_limit

def clear_games():
    first_to_clear = len(games)
    for i in reversed(range(len(games))):
        if game.active:
            if check_game_timeout(game):
                game.active = False
            else:
                break
        
        first_to_clear = i

    games = games[:first_to_clear]

def start_game(name1, name2):
    if not name1 in queue or not name2 in queue:
        return -1
    queue.remove(name1)
    queue.remove(name2)
    game = Game()
    game_id = len(games)
    games.append(game)
    return game_id

def apply_turn(id, turn):
    # turn = {player: val, unit: val, steps: val}
    if id < 0 or id > len(games):
        return False
    
    game = games[id]
    res = game.apply(turn)
    if not game.active:
        clear_games()
    return res

if __name__ == "__main__":
    print("this module is not for direct call")
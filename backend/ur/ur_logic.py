import time
from collections import defaultdict


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
        self.last_action = round(time.time())
        if self.current_turn != turn["player"]:
            return False
        if turn["step"] == Game.skip_turn_flag:
            return True

        units = self.unit_positions1 if turn["player"] == 1 else self.unit_positions2
        enemies = self.unit_positions1 if turn["player"] == 2 else self.unit_positions2
        
        new_position = units[turn["unit"]] + turn["step"]
        
        # место занято своим же юнитом
        if any(position == new_position for position in units):
            return False

        enemy_on_spot = any(position == new_position for position in enemies)
        
        # на безопасная клетка занята оппонентом
        if enemy_on_spot and new_position in Game.safe_positions:
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
# TODO: should add time of last heartbeat and time of appearing in the que. So really old ones and inactive ones could be eliminated
queue = dict()

invitations = defaultdict(lambda: [])

# names of players hwo sent invite that was accepted
accepted = dict()

games = []

# no actions for an hour = game is not active
game_timeout_limit = 60 * 60

# no hearrtbeat from user for this time = deletion from queue
queue_timeout_limit = 3 * 60

invitation_timeout_limit = 2 * 60

def invite(inviter, invited):
    invitations[invited].append((inviter, time.time()))

def get_invitations(name):
    return [inv for inv, _ in invitations[name]]

def clean_invites():
    current_time = time.time()
    stale_names = []
    for name in invitations:
        stale = []
        actual_invs = invitations[name]
        # I'm not sure if iterator in list will stay correct after deletion, so for now delete all items after the iteration
        for inv in actual_invs:
            _, t = inv
            if current_time - t > invitation_timeout_limit:
                stale.append(inv)

        for inv in stale:
            actual_invs.remove(inv)

        if not actual_invs:
            stale_names.append(name)
    
    for name in stale_names:
        del invitations[name]

def add_to_queue(name):
    print("Adding to queue")
    if name in queue:
        return "Name is already taken"
    queue[name] = time.time()
    return "OK(added)"

def clear_queue():
    current_time = time.time()
    stale = []
    for name, last_int in queue.items():
        if current_time - last_int >= queue_timeout_limit:
            stale.append(name)

    for name in stale:
        del queue[name]

def heartbeat(name):
    queue[name] = time.time()

def get_names():
    return list(queue.keys())

def check_game_timeout(game):
    return round(time.time()) - game.last_action > game_timeout_limit

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
    if (not name1 in queue) or (not name2 in queue):
        print("could not start game")
        return -1

    del queue[name1]
    del queue[name2]
    game = Game()
    game_id = len(games)
    games.append(game)
    accepted[name2] = game_id
    print(f"game started({game_id})")
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
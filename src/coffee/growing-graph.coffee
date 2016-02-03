###
# ==============================================================================
#  Author: Adrian Moreno (admoreno@outlook.com)
# ------------------------------------------------------------------------------
# This algorythm generates a room on a random position and starts generating
# the neighbours from there. Generated rooms can be:
#
#   +--- 0 ---+   +--- 0 ---+--- 4 ---+   +--- 0 ---+   +--- 0 ---+--- 4 ---+
#   |         |   |                   |   |         |   |                   |
#   3         1   3                   1   3         1   3                   1
#   |         |   |                   |   |         |   |                   |
#   +--- 2 ---+   +--- 2 ---+--- 6 ---+   +         +   +         +         +
#     (1 x 1)            (2 x 1)          |         |   |                   |
#                                         7         5   7                   5
#                                         |         |   |                   |
#                                         +--- 2 ---+   +--- 2 ---+--- 6 ---+
#                                           (1 x 2)            (2 x 2)
# ==============================================================================
###
# getPossibleNeighboursOLD = (door, room, tilemap) ->
  # # Calculate reference point
  # doorFlags = getDoorFlags(door)
  # ref =
    # if doorFlags.north then new Point(room.p1[0] + door // 4, room.p1[1])
    # else if doorFlags.south then new Point(room.p1[0] + door // 4, room.p2[1])
    # else if doorFlags.east then new Point(room.p2[0], room.p1[1] + door // 4)
    # else if doorFlags.west then new Point(room.p1[0], room.p1[1] + door // 4)
  # # Generate posible candidates
  # if doorFlags.north then candidates = [
    # new Room(                                          #   ___
      # ref[0], ref[1] - 1, 1, 1                         #   |_|  <- neighbour
      # ref[0], ref[1] - 1,                              #   |_|  <- ref
      # ((if i is 2 then room else null) for i in [0..3])#
    # ),
    # new Room(                                          #  _____
      # new Point(ref[0] - 1, ref[1] - 1),               #  |___| <- neigbour
      # new Point(ref[0],     ref[1] - 1),               #    |_| <- ref
      # ((if i is 6 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #  _____
      # new Point(ref[0],     ref[1] - 1),               #  |___| <- neighbour
      # new Point(ref[0] + 1, ref[1] - 1),               #  |_|   <- ref
      # ((if i is 2 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #   ___
      # new Point(ref[0], ref[1] - 2),                   #   | | <- neighbour
      # new Point(ref[0], ref[1] - 1),                   #   |_|
      # ((if i is 2 then room else null) for i in [0..7])#   |_| <- ref
    # ),
    # new Room(                                          #  _____
      # new Point(ref[0] - 1, ref[1] - 2),               #  |   | <- neighbour
      # new Point(ref[0],     ref[1] - 1),               #  |___|
      # ((if i is 6 then room else null) for i in [0..7])#    |_| <- ref
    # ),
    # new Room(                                          #  _____
      # new Point(ref[0],     ref[1] - 2),               #  |   | <-neighbour
      # new Point(ref[0] + 1, ref[1] - 1),               #  |___|
      # ((if i is 2 then room else null) for i in [0..7])#  |_|   <- ref
    # )
  # ]
  # else if doorFlags.south then candidates = [
    # new Room(                                          #   ___
      # new Point(ref[0], ref[1] + 1),                   #   |_|  <- ref
      # new Point(ref[0], ref[1] + 1),                   #   |_|  <- neighbour
      # ((if i is 0 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #    ___
      # new Point(ref[0] - 1, ref[1] + 1),               #  __|_|  <- ref
      # new Point(ref[0],     ref[1] + 1),               #  |___|  <- neighbour
      # ((if i is 4 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #  ___
      # new Point(ref[0],     ref[1] + 1),               #  |_|__  <- ref
      # new Point(ref[0] + 1, ref[1] + 1),               #  |___|  <- neighbour
      # ((if i is 0 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #   ___
      # new Point(ref[0],     ref[1] + 1),               #   |_|  <- ref
      # new Point(ref[0],     ref[1] + 2),               #   | |
      # ((if i is 0 then room else null) for i in [0..7])#   |_|  <- neighbour
    # ),
    # new Room(                                          #    ___
      # new Point(ref[0] - 1, ref[1] + 1),               #  __|_|  <- ref
      # new Point(ref[0],     ref[1] + 2),               #  |   |
      # ((if i is 4 then room else null) for i in [0..7])#  |___|  <- neighbour
    # ),
    # new Room(                                          #  ___
      # new Point(ref[0],     ref[1] + 1),               #  |_|__  <- ref
      # new Point(ref[0] + 1, ref[1] + 2),               #  |   |
      # ((if i is 0 then room else null) for i in [0..7])#  |___|  <- neighbour
    # )
  # ]
  # else if doorFlags.east then candidates = [
    # new Room(                                          #
      # new Point(ref[0] + 1, ref[1]    ),               #        _____
      # new Point(ref[0] + 1, ref[1]    ),               # ref -> |_|_| <- neigh
      # ((if i is 3 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #          ___
      # new Point(ref[0] + 1, ref[1] - 1),               #        __| |
      # new Point(ref[0] + 1, ref[1]    ),               # ref -> |_|_| <- neigh
      # ((if i is 7 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #
      # new Point(ref[0] + 1, ref[1]    ),               #        _____
      # new Point(ref[0] + 1, ref[1] + 1),               # ref -> |_| | <- neigh
      # ((if i is 3 then room else null) for i in [0..7])#          |_|
    # ),
    # new Room(                                          #
      # new Point(ref[0] + 1, ref[1]    ),               #        _______
      # new Point(ref[0] + 2, ref[1]    ),               # ref -> |_|___| <- neigh
      # ((if i is 3 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #          _____
      # new Point(ref[0] + 1, ref[1] - 1),               #        __|   |
      # new Point(ref[0] + 2, ref[1]    ),               # ref -> |_|___| <- neigh
      # ((if i is 7 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #
      # new Point(ref[0] + 1, ref[1]    ),               #        _______
      # new Point(ref[0] + 2, ref[1] + 1),               # ref -> |_|   | <- neigh
      # ((if i is 3 then room else null) for i in [0..7])#          |___|
    # )
  # ]
  # else if doorFlags.west then candidates = [
    # new Room(                                          #
      # new Point(ref[0] - 1, ref[1]),                   #          _____
      # new Point(ref[0] - 1, ref[1]),                   # neigh -> |_|_| <- ref
      # ((if i is 1 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #          ___
      # new Point(ref[0] - 1, ref[1] - 1),               #          | |__
      # new Point(ref[0] - 1, ref[1]),                   # neigh -> |_|_| <- ref
      # ((if i is 5 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #
      # new Point(ref[0] - 1, ref[1]),                   #          _____
      # new Point(ref[0] - 1, ref[1] + 1),               # neigh -> | |_| <- ref
      # ((if i is 1 then room else null) for i in [0..7])#          |_|
    # ),
    # new Room(                                          #
      # new Point(ref[0] - 2, ref[1]),                   #          _______
      # new Point(ref[0] - 1, ref[1]),                   # neigh -> |___|_| <- ref
      # ((if i is 1 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #          _____
      # new Point(ref[0] - 2, ref[1] - 1),               #          |   |__
      # new Point(ref[0] - 1, ref[1]),                   # neigh -> |___|_| <- ref
      # ((if i is 5 then room else null) for i in [0..7])#
    # ),
    # new Room(                                          #
      # new Point(ref[0] - 2, ref[1]),                   #          _______
      # new Point(ref[0] - 1, ref[1] + 1),               # neigh -> |   |_| <- ref
      # ((if i is 1 then room else null) for i in [0..7])#          |___|
    # )
  # ]
  # # Return the ones that don't collide
  # for c in candidates
    # console.log c
    # c if tilemap.is(c.origin[0], c.origin[1], c.width, c.height, Tile.EMPTY)
  # # console.log c
  # # return c for c in candidates when tilemap.is(c.origin[0], c.origin[1],
                                               # # c.width, c.height, Tile.EMPTY)

import { Player, PlayerScoreKey, CoreGame, Game } from '../types';
import { getAllCounters, shuffleWonders } from '../utils/game';
import { BASE_GAME, ADDONS } from '../config/game';

const counters = getAllCounters([BASE_GAME, ...ADDONS]);

const SET = 'SET';
const ADD = 'ADD';
const DELETE = 'DELETE';
const RESTORE = 'RESTORE';
const UPDATE = 'UPDATE';
const RESET = 'RESET';
const SET_WONDER = 'SET_WONDER';
const GAME_UPDATE = 'GAME_UPDATE';

type SetAction = {
  type: typeof SET;
  payload: Player[];
};

type AddAction = {
  type: typeof ADD;
  payload: {
    name: string;
    wonder: string;
  };
};

type DeleteAction = {
  type: typeof DELETE;
  payload: string;
};

type RestoreAction = {
  type: typeof RESTORE;
  payload: {
    player: Player | null;
    index: number;
  };
};

type UpdateAction = {
  type: typeof UPDATE;
  payload: {
    name: string;
    scoreKey: PlayerScoreKey;
    value: number;
  };
};

type ResetAction = {
  type: typeof RESET;
  payload: CoreGame;
};

type SetWonderAction = {
  type: typeof SET_WONDER;
  payload: {
    name: string;
    wonder: string;
  };
};

type GameUpdateAction = {
  type: typeof GAME_UPDATE;
  payload: Game;
};

export type Action =
  | SetAction
  | AddAction
  | DeleteAction
  | RestoreAction
  | UpdateAction
  | ResetAction
  | SetWonderAction
  | GameUpdateAction;

/** Slice extra players if new limit is less than before */
const updatePlayersCount = (players: Player[], maxPlayers: number): Player[] => {
  return players.slice(0, maxPlayers);
};

/** Change selected wonders if they are no longer available due to addons change */
const updateSelectedWonders = (players: Player[], wonders: string[]): Player[] => {
  const selectedWonders = players.map(player => player.wonder);
  return [
    ...players.map(player => {
      if (!wonders.includes(player.wonder)) {
        const shuffledWonders = shuffleWonders(wonders).filter(
          wonder => !selectedWonders.includes(wonder)
        );
        return {
          ...player,
          wonder: shuffledWonders[0],
        };
      } else {
        return player;
      }
    }),
  ];
};

const reducer = (state: Player[], action: Action) => {
  switch (action.type) {
    case SET:
      return [...action.payload];
    case ADD:
      const { name, wonder } = action.payload;

      return [
        ...state,
        {
          name,
          wonder,
          score: {
            ...counters,
          },
        },
      ];

    case DELETE:
      return [
        ...state.filter(player => {
          return player.name !== action.payload;
        }),
      ];
    case RESTORE:
      const { player, index } = action.payload;

      if (player && index >= 0) {
        return [...state.slice(0, index), player, ...state.slice(index)];
      }
      return state;
    case UPDATE: {
      const { name, scoreKey, value } = action.payload;

      const player = state.find(player => player.name === name);

      if (player) {
        return [
          ...state.map(player => {
            if (player.name === name) {
              return {
                ...player,
                score: {
                  ...player.score,
                  [scoreKey]: value,
                },
              };
            } else {
              return player;
            }
          }),
        ];
      }
      return state;
    }
    case RESET:
      const { wonders } = action.payload;
      const shuffledWonders = shuffleWonders(wonders);
      return [
        ...state.map((player, index) => {
          return {
            ...player,
            wonder: shuffledWonders[index],
            score: {
              ...counters,
            },
          };
        }),
      ];
    case SET_WONDER: {
      const { name, wonder } = action.payload;

      return [
        ...state.map(player => {
          if (player.name === name) {
            return {
              ...player,
              wonder,
            };
          } else {
            return player;
          }
        }),
      ];
    }
    case GAME_UPDATE: {
      const { maxPlayers, wonders } = action.payload;
      return updateSelectedWonders(updatePlayersCount(state, maxPlayers), wonders);
    }
    default:
      return state;
  }
};

export default reducer;

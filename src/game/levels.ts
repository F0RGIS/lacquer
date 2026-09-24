import type { Dir } from "@/game/logic";

export type Difficulty = "Easy" | "Tricky" | "Hard" | "Impossible";

export type Level = {
  id: string;
  name: string;
  difficulty: Difficulty;
  par: number;
  rows: string[];
  /** Known shortest coat, used for the title-board demonstration. */
  solution: Dir[];
};

export const LEVELS: Level[] = [
  {
    id: "primer",
    name: "Primer",
    difficulty: "Easy",
    par: 3,
    solution: ["R", "D", "L"],
    rows: ["#######", "#@....#", "#####.#", "#.....#", "#######"],
  },
  {
    id: "slab",
    name: "Slab",
    difficulty: "Easy",
    par: 4,
    solution: ["L", "R", "U", "L"],
    rows: ["########", "#......#", "#.@....#", "########"],
  },
  {
    id: "grain",
    name: "Grain",
    difficulty: "Easy",
    par: 5,
    solution: ["R", "D", "L", "D", "R"],
    rows: ["##########", "#@.......#", "########.#", "#........#", "#.########", "#........#", "##########"],
  },
  {
    id: "elbow",
    name: "Elbow",
    difficulty: "Tricky",
    par: 6,
    solution: ["D", "R", "U", "R", "D", "L"],
    rows: ["########", "#@.....#", "#......#", "#..#####", "#..#####", "########"],
  },
  {
    id: "notch",
    name: "Notch",
    difficulty: "Tricky",
    par: 7,
    solution: ["U", "R", "L", "D", "R", "U", "L"],
    rows: ["##########", "#...#....#", "#.@......#", "##########"],
  },
  {
    id: "pocket",
    name: "Pocket",
    difficulty: "Tricky",
    par: 9,
    solution: ["R", "L", "U", "R", "U", "L", "R", "D", "L"],
    rows: ["#########", "#.......#", "#.......#", "####.####", "#....####", "#.@..####", "#########"],
  },
  {
    id: "inlay",
    name: "Inlay",
    difficulty: "Hard",
    par: 9,
    solution: ["R", "D", "L", "D", "R", "U", "R", "U", "D"],
    rows: ["#######", "#@...##", "####.##", "#.....#", "#.###.#", "#.#...#", "#.#.#.#", "#...#.#", "#######"],
  },
  {
    id: "impossible",
    name: "Impossible",
    difficulty: "Impossible",
    par: 9,
    solution: ["U", "L", "R", "D", "L", "D", "R", "U", "L"],
    rows: [
      "##########",
      "##......##",
      "##......##",
      "##..######",
      "##..######",
      "##......##",
      "##.@....##",
      "##########",
    ],
  },
];

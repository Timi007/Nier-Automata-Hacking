# Nier: Automata Hacking

A game based on the hacking mini game in Nier: Automata.  
It's written in [Typescript](https://www.typescriptlang.org/) using [three.js](https://github.com/mrdoob/three.js).

[**Demo link**](https://raw.githack.com/Timi007/Nier-Automata-Hacking/master/dist/index.html)

This game was a uni project of mine.

## Game

### Controls
- Movement with W, A, S, D
- Turn with Mouse
- Shoot with Left Mouse Button
- ESC to pause game

### Gameplay
- Kill enemy core (sphere).
- If enemy core has a shield (white sphere), you must first kill all his guards (boxes).
- Complete 7 levels to win the game.
- Player has 3 health points
- Collision with the enemy results in an instant GAME OVER
- Yellow projectiles can be destructed, purple ones not

## Development

### Build from sources

If you want to build this game from the source, you need [npm](https://nodejs.org/en/).

Installing build dependencies:
```
npm install
```

Running development live server:
```
npm start
```

Building production files:
```
npm run build
```

## Credit

This project is using the YoRHa CSS from [metakirby5](https://github.com/metakirby5/yorha) and sound from [Amazuraa](https://github.com/Amazuraa/YoRHa-Hacking-Game).  
It was also inspired by [Mugen87s](https://github.com/Mugen87/nier) implementation of the game.

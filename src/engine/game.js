/* ---------- the save and what Pip sits on: the engine owns these, every game fills them ----------
   state is the saved game (localStorage, see input.js); each game says what is in it with fresh().
   mount is what Pip sits on (an animal, a vehicle), or null. */
let state = null;
let mount = null;

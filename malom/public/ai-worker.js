/* A gépi ellenfél külön szálon gondolkodik, hogy az animációk ne akadjanak. */
importScripts('/engine.js', '/ai.js');
self.onmessage = (ev) => {
  const { id, state, level } = ev.data;
  let move = null;
  try { move = self.MalomAI.chooseMove(state, level); } catch (e) { move = null; }
  self.postMessage({ id, move });
};

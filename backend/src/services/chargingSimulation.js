/**
 * In-memory charging simulation - updates session every 10 seconds
 * In production you might use a job queue (Bull, Agenda) or WebSockets
 */
const ChargingSession = require('../models/ChargingSession');
const Charger = require('../models/Charger');
const Station = require('../models/Station');

const activeIntervals = new Map(); // sessionId -> intervalId

const KW_TO_KWH_PER_10SEC = 1 / 360; // 1 kW for 10 sec = 1/360 kWh

/**
 * Start simulation: every 10s add units and recalc cost
 */
function startSimulation(sessionId, powerKw, pricePerKwh) {
  if (activeIntervals.has(sessionId)) return;
  const intervalId = setInterval(async () => {
    try {
      const session = await ChargingSession.findById(sessionId);
      if (!session || session.status === 'completed') {
        stopSimulation(sessionId);
        return;
      }
      const addedUnits = powerKw * KW_TO_KWH_PER_10SEC;
      session.unitsConsumed = (session.unitsConsumed || 0) + addedUnits;
      session.cost = session.unitsConsumed * pricePerKwh;
      await session.save();
    } catch (err) {
      console.error('Charging simulation error:', err);
      stopSimulation(sessionId);
    }
  }, 10000);
  activeIntervals.set(sessionId, intervalId);
}

function stopSimulation(sessionId) {
  if (activeIntervals.has(sessionId)) {
    clearInterval(activeIntervals.get(sessionId));
    activeIntervals.delete(sessionId);
  }
}

module.exports = { startSimulation, stopSimulation };

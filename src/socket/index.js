import { onConnection } from './handlers/connection.js'
import { onMessage } from './handlers/message.js'
import { onLocationUpdate } from './handlers/locationUpdate.js'
import { onHeartbeat } from './handlers/heartbeat.js'
import { onDisconnect } from './handlers/disconnect.js'

export function registerHandlers(io, socket) {
  // first thing — run connection handler
  onConnection(io, socket)

  // register all event handlers
  socket.on('message', (data) => onMessage(io, socket, data))
  socket.on('location_update', (data) => onLocationUpdate(io, socket, data))
  socket.on('heartbeat', () => onHeartbeat(socket))
  socket.on('disconnecting', () => onDisconnect(io, socket))
}
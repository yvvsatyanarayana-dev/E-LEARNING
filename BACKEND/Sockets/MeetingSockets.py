import socketio
import logging

# Allow all origins for the underlying WebSocket handshake,
# but we rely on FastAPI for the actual HTTP CORS headers.
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio)

# room_code -> { faculty: sid, students: [set of sids] }
rooms = {}

@sio.event
async def connect(sid, environ):
    logging.info(f"Socket connected: {sid}")

@sio.event
async def disconnect(sid):
    logging.info(f"Socket disconnected: {sid}")
    # Remove from any rooms
    for room_code, data in rooms.items():
        if data.get("faculty") == sid:
            data["faculty"] = None
            await sio.emit("faculty_disconnected", room=room_code)
        if sid in data.get("students", set()):
            data["students"].remove(sid)
            await sio.emit("student_disconnected", {"student_id": sid}, room=room_code)

@sio.event
async def join_room(sid, data):
    room_code = data.get("room_code")
    role = data.get("role")  # "faculty" or "student"
    
    if not room_code:
        return
    
    if room_code not in rooms:
        rooms[room_code] = {"faculty": None, "students": set()}
        
    await sio.enter_room(sid, room_code)
    
    if role == "faculty":
        rooms[room_code]["faculty"] = sid
        await sio.emit("faculty_joined", {"faculty_id": sid}, room=room_code, skip_sid=sid)
    else:
        rooms[room_code]["students"].add(sid)
        await sio.emit("student_joined", {"student_id": sid}, room=room_code, skip_sid=sid)
        
    # Send current participants to the joined user
    await sio.emit("room_state", {
        "faculty": rooms[room_code]["faculty"],
        "students": list(rooms[room_code]["students"])
    }, room=sid)

@sio.event
async def signal(sid, data):
    # Relay WebRTC signaling data
    target_sid = data.get("to")
    if target_sid:
        # Send to specific user (e.g., offer/answer/ice to specific peer)
        data["from"] = sid
        await sio.emit("signal", data, room=target_sid)
    else:
        # Broadcast to room
        room_code = data.get("room_code")
        if room_code:
            data["from"] = sid
            await sio.emit("signal", data, room=room_code, skip_sid=sid)

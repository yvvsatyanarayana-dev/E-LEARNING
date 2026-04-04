import socketio
import logging

# Let FastAPI handle CORS headers
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=[])
app = socketio.ASGIApp(sio)

# room_code -> { faculty: sid, students: {sid: name}, faculty_name: name }
rooms = {}

@sio.event
async def connect(sid, environ):
    logging.info(f"Socket connected: {sid}")

@sio.event
async def authenticate(sid, data):
    """Associates a socket ID with a specific user ID for targeted notifications."""
    user_id = data.get("user_id")
    if user_id:
        room_name = f"user_{user_id}"
        await sio.enter_room(sid, room_name)
        logging.info(f"User {user_id} authenticated on socket {sid} (room: {room_name})")

@sio.event
async def disconnect(sid):
    logging.info(f"Socket disconnected: {sid}")
    # Remove from any rooms
    for room_code, data in rooms.items():
        if data.get("faculty") == sid:
            data["faculty"] = None
            data["faculty_name"] = None
            await sio.emit("faculty_disconnected", room=room_code)
        if sid in data.get("students", {}):
            del data["students"][sid]
            await sio.emit("student_disconnected", {"student_id": sid}, room=room_code)

@sio.event
async def join_room(sid, data):
    room_code = data.get("room_code")
    role = data.get("role")  # "faculty" or "student"
    
    if not room_code:
        return
    
    if room_code not in rooms:
        rooms[room_code] = {"faculty": None, "students": {}, "faculty_name": None}
        
    await sio.enter_room(sid, room_code)
    
    if role == "faculty":
        rooms[room_code]["faculty"] = sid
        rooms[room_code]["faculty_name"] = data.get("name", "Faculty")
        await sio.emit("faculty_joined", {"faculty_id": sid}, room=room_code, skip_sid=sid)
    else:
        student_name = data.get("name", f"Student {sid[:4]}")
        rooms[room_code]["students"][sid] = student_name
        await sio.emit("student_joined", {"student_id": sid, "student_name": student_name}, room=room_code, skip_sid=sid)
        
    # Send current participants to the joined user
    await sio.emit("room_state", {
        "faculty": rooms[room_code]["faculty"],
        "faculty_name": rooms[room_code]["faculty_name"],
        "students": list(rooms[room_code]["students"].keys())
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
@sio.event
async def chat_message(sid, data):
    room_code = data.get("room_code")
    if room_code:
        data["from"] = sid
        await sio.emit("chat_message", data, room=room_code, skip_sid=sid)

@sio.event
async def meeting_ended(sid, data):
    # Notify all participants in a room that the meeting has ended
    room_code = data.get("room_code")
    if room_code:
        await sio.emit("meeting_ended", room=room_code)

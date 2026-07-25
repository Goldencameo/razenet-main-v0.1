extends Node3D

# Game configuration
var SUPABASE_URL = ""
var SUPABASE_ANON_KEY = ""
var GAME_ID = ""
var AUTH_TOKEN = ""

# Multiplayer
var multiplayer_peer: ENetMultiplayerPeer
var is_host = false
var player_id: int = 1

# Parse command line arguments
func _ready() -> void:
	parse_arguments()
	setup_multiplayer()
	
	# Connect to Supabase realtime for player sync
	if AUTH_TOKEN != "":
		connect_to_supabase()

func parse_arguments() -> void:
	var arguments = OS.get_cmdline_args()
	for i in range(arguments.size()):
		var arg = arguments[i]
		if arg == "--token" and i + 1 < arguments.size():
			AUTH_TOKEN = arguments[i + 1]
		elif arg == "--game-id" and i + 1 < arguments.size():
			GAME_ID = arguments[i + 1]
		elif arg == "--supabase-url" and i + 1 < arguments.size():
			SUPABASE_URL = arguments[i + 1]
		elif arg == "--supabase-key" and i + 1 < arguments.size():
			SUPABASE_ANON_KEY = arguments[i + 1]

func setup_multiplayer() -> void:
	multiplayer_peer = ENetMultiplayerPeer.new()
	
	# Try to connect to game server or host
	if "--host" in OS.get_cmdline_args():
		multiplayer_peer.create_server(7000)
		is_host = true
		print("Hosting game server on port 7000")
	else:
		var server_ip = "127.0.0.1"
		for i in range(OS.get_cmdline_args().size()):
			if OS.get_cmdline_args()[i] == "--server" and i + 1 < OS.get_cmdline_args().size():
				server_ip = OS.get_cmdline_args()[i + 1]
		
		var error = multiplayer_peer.create_client(server_ip, 7000)
		if error != OK:
			print("Failed to connect to server: ", error)
			return
		print("Connecting to server: ", server_ip)
	
	multiplayer.multiplayer_peer = multiplayer_peer
	multiplayer.peer_connected.connect(_on_peer_connected)
	multiplayer.peer_disconnected.connect(_on_peer_disconnected)
	
	player_id = multiplayer.get_unique_id()
	print("Player ID: ", player_id)

func _on_peer_connected(peer_id: int) -> void:
	print("Player connected: ", peer_id)

func _on_peer_disconnected(peer_id: int) -> void:
	print("Player disconnected: ", peer_id)

func connect_to_supabase() -> void:
	# This would connect to Supabase for player position sync
	# For now, this is a placeholder
	print("Connecting to Supabase for game: ", GAME_ID)

extends Node
## Parses launch arguments from the website, installer, or custom URL protocol.
##
## Supported forms:
##   --game-id=123
##   --game-id 123
##   --token=eyJ...
##   --supabase-url=https://xxx.supabase.co
##   --supabase-key=eyJ...
##   --pack-dir=res://default_pack
##   razeplayer://game?id=123&token=eyJ...

var game_id: String = ""
var auth_token: String = ""
var supabase_url: String = ""
var supabase_anon_key: String = ""
var pack_dir: String = ""
var launch_url: String = ""


func _init() -> void:
	_parse()


func _parse() -> void:
	var args := _collect_args()

	var index := 0
	while index < args.size():
		var arg: String = args[index]

		if arg.begins_with("razeplayer://"):
			launch_url = arg
			_parse_custom_url(arg)
			index += 1
			continue

		if arg.begins_with("--"):
			var key := ""
			var value := ""

			var equals_at := arg.find("=")
			if equals_at > 0:
				key = arg.substr(2, equals_at - 2)
				value = arg.substr(equals_at + 1)
			else:
				key = arg.substr(2)
				if index + 1 < args.size() and not args[index + 1].begins_with("--"):
					value = args[index + 1]
					index += 1

			_apply_key(key, value)

		index += 1

	_log_launch_context()


func _collect_args() -> PackedStringArray:
	var args := OS.get_cmdline_user_args()
	if args.is_empty():
		args = OS.get_cmdline_args()
	return args


func _parse_custom_url(url: String) -> void:
	var query_start := url.find("?")
	if query_start == -1:
		return

	var query := url.substr(query_start + 1)
	for pair in query.split("&"):
		if pair.is_empty():
			continue
		var separator := pair.find("=")
		if separator == -1:
			continue
		var key := pair.substr(0, separator).uri_decode()
		var value := pair.substr(separator + 1).uri_decode()
		_apply_key(key, value)


func _apply_key(key: String, value: String) -> void:
	match key:
		"game-id", "id", "game_id":
			game_id = value
		"token", "auth_token":
			auth_token = value
		"supabase-url", "supabase_url":
			supabase_url = value
		"supabase-key", "supabase_key", "supabase-anon-key":
			supabase_anon_key = value
		"pack-dir", "pack_dir":
			pack_dir = value


func _log_launch_context() -> void:
	print("[RazeCLI] game_id=", game_id if not game_id.is_empty() else "(none)")
	if not launch_url.is_empty():
		print("[RazeCLI] launch_url=", launch_url)
	if not pack_dir.is_empty():
		print("[RazeCLI] pack_dir=", pack_dir)


func get_pack_storage_url() -> String:
	if supabase_url.is_empty():
		return ""
	return "%s/storage/v1/object/public/game-packs/%s.zip" % [supabase_url.rstrip("/"), game_id]

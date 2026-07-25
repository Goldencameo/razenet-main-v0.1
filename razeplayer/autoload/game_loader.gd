extends Node
## Downloads a game pack ZIP, extracts it, and loads the main scene into RazePlayer.

signal load_started(game_id: String)
signal load_progress(status: String)
signal load_finished(scene_path: String)
signal load_failed(error: String)

const PACKS_ROOT := "user://packs"
const MANIFEST_FILE := "manifest.json"
const HUB_SCENE := "res://scenes/hub.tscn"
const LOCAL_TEST_PACK := "res://default_pack"

var _http: HTTPRequest


func _ready() -> void:
	_http = HTTPRequest.new()
	add_child(_http)
	_http.request_completed.connect(_on_download_completed)
	DirAccess.make_dir_recursive_absolute(PACKS_ROOT)


func load_hub() -> void:
	load_progress.emit("Loading RazePlayer sandbox...")
	_switch_scene(HUB_SCENE)


func load_game(game_id: String) -> void:
	if game_id.is_empty():
		load_hub()
		return

	load_started.emit(game_id)

	if not RazeCLI.pack_dir.is_empty():
		_load_pack_from_directory(RazeCLI.pack_dir, game_id)
		return

	if game_id == "local":
		_load_pack_from_directory(LOCAL_TEST_PACK, game_id)
		return

	var extracted_dir := _extracted_dir_for(game_id)
	if _manifest_exists(extracted_dir):
		load_progress.emit("Using cached pack for game %s..." % game_id)
		_load_manifest_scene(extracted_dir, game_id)
		return

	var pack_url := RazeCLI.get_pack_storage_url()
	if pack_url.is_empty():
		load_failed.emit(
			"No Supabase URL configured. Pass --supabase-url=... or use --game-id=local."
		)
		return

	load_progress.emit("Downloading game pack...")
	_download_pack(game_id, pack_url)


func _download_pack(game_id: String, url: String) -> void:
	DirAccess.make_dir_recursive_absolute(_game_dir_for(game_id))
	var error := _http.request(url)
	if error != OK:
		load_failed.emit("Failed to start download (HTTP error %s)." % error)


func _on_download_completed(
	result: int,
	response_code: int,
	_headers: PackedStringArray,
	body: PackedByteArray
) -> void:
	if result != HTTPRequest.RESULT_SUCCESS:
		load_failed.emit("Download failed (network error %s)." % result)
		return

	if response_code != 200:
		load_failed.emit("Download failed (HTTP %s)." % response_code)
		return

	if RazeCLI.game_id.is_empty():
		load_failed.emit("Game ID missing after download.")
		return

	var game_id := RazeCLI.game_id
	var game_dir := _game_dir_for(game_id)
	var zip_path := "%s/pack.zip" % game_dir

	var file := FileAccess.open(zip_path, FileAccess.WRITE)
	if file == null:
		load_failed.emit("Could not write pack to disk.")
		return
	file.store_buffer(body)
	file.close()

	load_progress.emit("Extracting game pack...")
	var extracted_dir := _extracted_dir_for(game_id)
	var extract_error := _extract_zip(zip_path, extracted_dir)
	if extract_error != OK:
		load_failed.emit("Failed to extract pack (error %s)." % extract_error)
		return

	_load_manifest_scene(extracted_dir, game_id)


func _extract_zip(zip_path: String, destination: String) -> Error:
	DirAccess.make_dir_recursive_absolute(destination)

	var reader := ZIPReader.new()
	var open_error := reader.open(zip_path)
	if open_error != OK:
		return open_error

	for file_path in reader.get_files():
		var normalized := file_path.replace("\\", "/").trim_prefix("/")
		if normalized.is_empty():
			continue

		var output_path := "%s/%s" % [destination, normalized]
		if normalized.ends_with("/"):
			DirAccess.make_dir_recursive_absolute(output_path)
			continue

		var slash := normalized.rfind("/")
		if slash != -1:
			DirAccess.make_dir_recursive_absolute("%s/%s" % [destination, normalized.substr(0, slash)])

		var data: PackedByteArray = reader.read_file(file_path)
		var out_file := FileAccess.open(output_path, FileAccess.WRITE)
		if out_file == null:
			reader.close()
			return ERR_CANT_CREATE

		out_file.store_buffer(data)
		out_file.close()

	reader.close()
	return OK


func _load_pack_from_directory(pack_dir: String, game_id: String) -> void:
	load_progress.emit("Loading local pack from %s..." % pack_dir)
	if not _manifest_exists(pack_dir):
		load_failed.emit("Pack manifest missing in %s." % pack_dir)
		return
	_load_manifest_scene(pack_dir, game_id)


func _load_manifest_scene(pack_dir: String, game_id: String) -> void:
	var manifest_path := "%s/%s" % [pack_dir, MANIFEST_FILE]
	var manifest_text := FileAccess.get_file_as_string(manifest_path)
	var parsed: Variant = JSON.parse_string(manifest_text)
	if typeof(parsed) != TYPE_DICTIONARY:
		load_failed.emit("Invalid manifest.json in pack.")
		return

	var main_scene_name: String = parsed.get("main_scene", "")
	if main_scene_name.is_empty():
		load_failed.emit("manifest.json is missing \"main_scene\".")
		return

	var scene_path := "%s/%s" % [pack_dir, main_scene_name]
	if not ResourceLoader.exists(scene_path):
		load_failed.emit("Main scene not found: %s" % scene_path)
		return

	load_progress.emit("Starting game %s..." % game_id)
	_switch_scene(scene_path)


func _switch_scene(scene_path: String) -> void:
	var packed: PackedScene = load(scene_path)
	if packed == null:
		load_failed.emit("Could not load scene: %s" % scene_path)
		return

	get_tree().change_scene_to_packed(packed)
	load_finished.emit(scene_path)


func _manifest_exists(pack_dir: String) -> bool:
	return FileAccess.file_exists("%s/%s" % [pack_dir, MANIFEST_FILE])


func _game_dir_for(game_id: String) -> String:
	return "%s/%s" % [PACKS_ROOT, game_id]


func _extracted_dir_for(game_id: String) -> String:
	return "%s/extracted" % _game_dir_for(game_id)

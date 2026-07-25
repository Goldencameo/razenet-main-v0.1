extends Control


@onready var status_label: Label = %StatusLabel
@onready var detail_label: Label = %DetailLabel


func _ready() -> void:
	GameLoader.load_progress.connect(_on_load_progress)
	GameLoader.load_failed.connect(_on_load_failed)
	GameLoader.load_finished.connect(_on_load_finished)

	var game_id := RazeCLI.game_id
	if game_id.is_empty():
		status_label.text = "RazePlayer"
		detail_label.text = "No game ID provided — loading sandbox hub."
		await get_tree().create_timer(0.35).timeout
		GameLoader.load_hub()
	else:
		status_label.text = "Launching game"
		detail_label.text = "Game ID: %s" % game_id
		GameLoader.load_game(game_id)


func _on_load_progress(message: String) -> void:
	detail_label.text = message


func _on_load_failed(message: String) -> void:
	status_label.text = "Launch failed"
	detail_label.text = message
	push_error("[RazePlayer] %s" % message)


func _on_load_finished(scene_path: String) -> void:
	print("[RazePlayer] Loaded scene: ", scene_path)

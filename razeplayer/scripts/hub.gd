extends Node3D


@onready var info_label: Label = %InfoLabel


func _ready() -> void:
	var lines: PackedStringArray = [
		"RazePlayer sandbox",
		"WASD move | Space jump | Esc toggle mouse",
	]

	if not RazeCLI.game_id.is_empty():
		lines.append("Requested game: %s" % RazeCLI.game_id)
	else:
		lines.append("Launch with --game-id=123 or razeplayer://game?id=123")

	info_label.text = "\n".join(lines)

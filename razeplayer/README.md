# RazePlayer

Single Godot 4 client for RazeHub. Install once, launch games from the website via `razeplayer://` or CLI args.

## Requirements

- [Godot 4.2+](https://godotengine.org/download)

## Open the project

1. Open Godot and import `razeplayer/project.godot`.
2. Press F5 to run the sandbox hub (no game ID).

## Command-line launch

Godot editor (Project → Run with arguments, or CLI):

```bash
# Sandbox hub (no game)
godot --path razeplayer

# Load bundled test pack (proves scene loader without Supabase)
godot --path razeplayer -- --game-id=local

# Load a remote pack from Supabase Storage
godot --path razeplayer -- \
  --game-id=YOUR_GAME_UUID \
  --supabase-url=https://YOUR_PROJECT.supabase.co

# Equals and space-separated forms both work
godot --path razeplayer -- --game-id YOUR_GAME_UUID

# Custom URL protocol form (what the website will trigger once registered)
godot --path razeplayer -- "razeplayer://game?id=YOUR_GAME_UUID"
```

Exported Windows build:

```powershell
RazePlayer.exe --game-id=123
RazePlayer.exe "razeplayer://game?id=123&token=JWT_HERE"
```

## Architecture

| File | Role |
|------|------|
| `autoload/raze_cli.gd` | Parses `--game-id=`, `--supabase-url=`, and `razeplayer://` URLs |
| `autoload/game_loader.gd` | Downloads ZIP → extracts to `user://packs/` → loads `manifest.json` main scene |
| `scenes/bootstrap.tscn` | Entry splash; reads CLI and starts loading |
| `scenes/hub.tscn` | Built-in sandbox when no game ID is provided |
| `default_pack/` | Local test pack (`--game-id=local`) |

## Game pack format

Upload one ZIP per game to Supabase Storage bucket `game-packs`:

```
my-game.zip
├── manifest.json      { "main_scene": "main.tscn", "name": "My Game" }
├── main.tscn
└── ... assets/scripts ...
```

Public URL pattern:

```
{SUPABASE_URL}/storage/v1/object/public/game-packs/{game_id}.zip
```

## Controls

- **WASD** — move
- **Space** — jump
- **Mouse** — look (captured)
- **Esc** — release/capture mouse

## Next steps (not in this PR)

1. Website Play button → `razeplayer://game?id=123`
2. Windows installer registers the custom protocol
3. Supabase Storage bucket + upload pipeline
4. Multiplayer (ENet) + chat (Supabase Realtime)

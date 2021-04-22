<?php

class UVicCaptionsPlayer {

    private static $_blockFolder = "uvic-captions-player-block/build";

    /**
     * Activates the plugin
     */
    public static function plugin_activation()
    {

    }

    /**
     * Deactivates the plugin
     */
    public static function plugin_deactivation()
    {

    }

    public static function register_block()
    {
        $blockFolder = self::$_blockFolder;
        $assetFile = include(UVIC_PLAYER_PLUGIN_DIR . "{$blockFolder}/index.asset.php");
        wp_register_script(
            "uvic-captions-player",
            plugins_url("{$blockFolder}/index.js", __FILE__),
            $assetFile['dependencies'],
            $assetFile['version']
        );

        register_block_type("uvic-captions-player/embed-player", [
            "api_version" => 2,
            "editor_script" => "uvic-captions-player"
        ]);
    }
}
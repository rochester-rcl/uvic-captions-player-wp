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

        // scripts 

        wp_register_script(
            "uvic-captions-player-editor",
            plugins_url("{$blockFolder}/index.js", __FILE__),
            $assetFile['dependencies'],
            $assetFile['version']
        );

        wp_register_script(
            "uvic-captions-player-client",
            plugins_url("{$blockFolder}/client.js", __FILE__),
            $assetFile['dependencies'],
            $assetFile['version']
        );

        // styles

        wp_enqueue_style(
            "uvic-captions-player-editor-style",
            plugins_url("{$blockFolder}/index.css", __FILE__),
            []
        );

        wp_enqueue_style(
            "uvic-captions-player-client-style",
            plugins_url("{$blockFolder}/client.css", __FILE__),
            []
        ); 

        register_block_type("uvic-captions-player/embed-player", [
            "api_version" => 2,
            "editor_script" => "uvic-captions-player-editor",
            "script" => "uvic-captions-player-client"
        ]);
    }
}
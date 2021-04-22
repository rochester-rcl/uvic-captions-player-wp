<?php

class UVicCaptionsPlayer {

    private $_blockFolder = "uvic-captions-player-block/build";

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
        $assetFile = include(UVIC_PLAYER_PLUGIN_DIR . "{$self->_blockFolder}/index.asset.php");
        wp_register_script(
            "uvic-captions-player",
            plugins_url("{$self->_blockFolder}/build/index.js", __FILE__),
            $asset_file['dependencies'],
            $asset_file['version']
        );

        register_block_type("uvic-captions-player/embed-player", [
            "api_version" => 2,
            "editor_script" => "uvic-captions-player"
        ]);
    }
}
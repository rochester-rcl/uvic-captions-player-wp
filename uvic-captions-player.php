<?php
/**
 * @package UVicCaptionsPlayer
 * @version 0.0.1
 */
/*
Plugin Name: UVic Captions Player
Description: Embeds a video player from UVic's Video Player Setup Wizard
(https://www.uvic.ca/systems/support/avmultimedia/webcasting/wizard.php)
and extracts the captions for annotation with Hypothesis.
Author: Digital Scholarship - University of Rochester
Version: 0.0.1
Author URI: https://dslab.lib.rochester.edu
*/

define( 'UVIC_PLAYER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
require_once( UVIC_PLAYER_PLUGIN_DIR . 'class.uvic-captions-player.php' );

register_activation_hook(__FILE__, ["UVicCaptionsPlayer", "plugin_activation"]);
register_deactivation_hook(__FILE__, ["UVicCaptionsPlayer", "plugin_deactivation"]);
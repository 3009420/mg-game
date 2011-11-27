<?php
return array (
  'api_id' => 'MG_API',
  'installed' => false,
  'frontend_theme' => 'metadatagames',
  'arcade' => 
  array (
    'description' => 'This is a short description of the project',
  ),
  'image' => 
  array (
    'formats' => 
    array (
      'thumbnail' => 
      array (
        'width' => 100,
        'height' => 60,
        'quality' => false,
        'sharpen' => false,
      ),
      'large' => 
      array (
        'width' => 750,
        'height' => 750,
        'quality' => 80,
        'sharpen' => 20,
      ),
    ),
  ),
  'admin-tools' => 
  array (
    'tool-image' => 
    array (
      'name' => 'Images',
      'description' => 'Tools to administer images the system',
      'url' => '/admin/image',
      'role' => 'editor',
      'group' => 'Images & Tags',
    ),
    'tool-tag' => 
    array (
      'name' => 'Tags',
      'description' => 'All tags created by players can be administered via this tool.',
      'url' => '/admin/tag',
      'role' => 'editor',
      'group' => 'Images & Tags',
    ),
    'tool-import' => 
    array (
      'name' => 'Import',
      'description' => 'Tools to import images into the system',
      'url' => '/admin/import',
      'role' => 'editor',
      'group' => 'Images & Tags',
    ),
    'tool-image-set' => 
    array (
      'name' => 'Image Sets',
      'description' => 'Image Sets allow you to group images that can be licenced under different licenses.',
      'url' => '/admin/imageSet',
      'role' => 'editor',
      'group' => 'Images & Tags',
    ),
    'tool-licence' => 
    array (
      'name' => 'Licences',
      'description' => 'Create licenses under which images can be published in the system',
      'url' => '/admin/licence',
      'role' => 'editor',
      'group' => 'Images & Tags',
    ),
    'tool-export' => 
    array (
      'name' => 'Export',
      'description' => 'Tools to export tags, tags uses, and tagged images',
      'url' => '/admin/export',
      'role' => 'editor',
      'group' => 'Images & Tags',
    ),
    'tool-user' => 
    array (
      'name' => 'Players',
      'description' => 'Registered players and their tags can be administered via these tools',
      'url' => '/admin/user',
      'role' => 'dbmanager',
      'group' => 'Players',
    ),
    'tool-subject-matter' => 
    array (
      'name' => 'Subject Matters',
      'description' => 'Each image set can have subject matter to which a player can express interest or an administrator can assign trust and expertise. These values are used to influence image selection and tag weights',
      'url' => '/admin/subjectMatter',
      'role' => 'editor',
      'group' => 'Players',
    ),
    'tool-plugins' => 
    array (
      'name' => 'Plugins',
      'description' => 'MetaData Games is modular. Plugins allow the flexible extension of functionality and can be administered here.',
      'url' => '/plugins',
      'role' => 'editor',
      'group' => 'Games & Plugins',
    ),
    'tool-games' => 
    array (
      'name' => 'Games',
      'description' => 'Activate and administer games here',
      'url' => '/games',
      'role' => 'dbmanager',
      'group' => 'Games & Plugins',
    ),
    'tool-bages' => 
    array (
      'name' => 'Badges',
      'description' => 'Create or remove badges that can be achieved by the player',
      'url' => '/admin/badge',
      'role' => 'editor',
      'group' => 'Games & Plugins',
    ),
    'tool-ip' => 
    array (
      'name' => 'IP Blacklist',
      'description' => 'White list or black list IP addresses here',
      'url' => '/admin/blockedIp',
      'role' => 'editor',
      'group' => 'Other',
    ),
    'tool-settings' => 
    array (
      'name' => 'Global Settings',
      'description' => 'Configure settings that are used globally in the system',
      'url' => '/admin/settings',
      'role' => 'dbmanager',
      'group' => 'Other',
    ),
    'tool-logs' => 
    array (
      'name' => 'Admin Log',
      'description' => 'Each acting by users in the admin tools is logged. The logs can be accessed here.',
      'url' => '/admin/log',
      'role' => 'dbmanager',
      'group' => 'Other',
    ),
  ),
  'games' => 
  array (
    'ZenTag' => 
    array (
      'name' => 'Zen Tag',
      'description' => 'Clear your mind and you will hear the voice of the serene tagger within you. Ohm.',
      'arcade_image' => 'zentag_arcade.png',
      'more_info_url' => 'http://www.google.co.uk',
      'play_once_and_move_on' => '0',
      'play_once_and_move_on_url' => '',
      'turns' => '4',
      'image_width' => '450',
      'image_height' => '450',
    ),
    'ZenTagPlayOnceMoveOn' => 
    array (
      'name' => 'Zen Tag (Play Once Move On)',
      'description' => 'Clear your mind and you will hear the voice of the serene tagger within you. Ohm.',
      'arcade_image' => 'zentag_arcade.png',
      'more_info_url' => '',
      'play_once_and_move_on' => '1',
      'play_once_and_move_on_url' => 'http://www.metadatagames.com',
      'turns' => '4',
      'image_width' => '450',
      'image_height' => '450',
    ),
    'ZenPond' => 
    array (
      'name' => 'Zen Pond',
      'description' => 'Clear your mind and you will hear the voice of the serene tagger within you. Ohm.',
      'arcade_image' => 'zenpond_arcade.png',
      'more_info_url' => '',
      'turns' => '4',
      'image_width' => '450',
      'image_height' => '450',
      'partner_wait_threshold' => '30',
      'play_against_computer' => '1',
    ),
    'GuessWhat' => 
    array (
      'name' => 'Guess What?',
      'description' => 'Lorem ipsum sit amed dolor cum laude. xxx change the description',
      'arcade_image' => 'guesswhat_arcade.png',
      'more_info_url' => 'http://thisismoreinfo.com',
      'turns' => '4',
      'image_width' => '450',
      'image_height' => '450',
      'image_grid_width' => '150',
      'image_grid_height' => '150',
      'number_guesses' => '3',
      'number_hints' => '3',
      'partner_wait_threshold' => '30',
      'play_against_computer' => '1',
    ),
  ),
  'settings' => 
  array (
    'app_name' => 'MetaData Games',
    'throttle_interval' => '500',
    'message_queue_interval' => '450',
    'app_email' => 'admin@admin.com',
    'pagination_size' => '25',
    'app_upload_path' => '/../uploads',
    'app_upload_url' => '/uploads',
  ),
  'plugins' => 
  array (
    'dictionary' => 
    array (
      'WordsToAvoid' => 
      array (
        'words_to_avoid_threshold' => 10,
      ),
    ),
    'weighting' => 
    array (
      'ScoreBySubjectMatter' => 
      array (
        'score_new' => 2,
        'score_match' => 1,
        'score_new_expert' => 4,
        'score_new_trusted' => 4,
        'score_match_expert' => 3,
        'score_match_trusted' => 3,
      ),
      'ScoreNewMatch' => 
      array (
        'score_new' => 2,
        'score_match' => 1,
      ),
      'TwoPlayerBonus' => 
      array (
        'score_new' => '2',
        'score_match' => '1',
      ),
      'GuessWhatScoring' => 
      array (
        'score_new' => 2,
        'score_match' => 1,
        'score_first_guess' => 5,
        'score_second_guess' => 3,
        'score_third_guess' => 2,
        'additional_weight_first_guess' => 0.5,
      ),
    ),
  ),
);

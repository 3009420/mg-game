<?php

class GuessWhatController extends GxController
{

    public function filters()
    {
        return array(
            'IPBlock',
            'accessControl - index',
        );
    }

    public function accessRules()
    {
        return array(
            array('allow',
                'actions' => array('index'),
                'users' => array('*'),
            ),
            array('allow',
                'actions' => array('update'),
                'roles' => array(ADMIN),
            ),
            array('allow',
                'actions' => array('view'),
                'roles' => array(EDITOR),
            ),
            array('deny',
                'users' => array('*'),
            ),
        );
    }

    /**
     * As most of the game play is handled via JavaScript and API callbacks the controller
     * renders only the initial needed HTML while making sure all needed assets CSS
     * and JavaScript are loaded
     */
    public function actionIndex()
    {
        MGHelper::setFrontendTheme();

        $game = GamesModule::loadGame("GuessWhat");
        if ($game) {
            $asset_url = GamesModule::getAssetsUrl() . '/guesswhat';

            $cs = Yii::app()->clientScript;
            $cs->registerCoreScript('jquery');
            $cs->registerCssFile(Yii::app()->baseUrl . '/css/jquery.fancybox-1.3.4.css');
            $cs->registerCssFile(GamesModule::getAssetsUrl() . '/guesswhat/css/style.css');
            $cs->registerScriptFile(Yii::app()->baseUrl . '/js/jquery.fancybox-1.3.4.pack.js', CClientScript::POS_END);
            $cs->registerScriptFile(Yii::app()->baseUrl . '/js/jquery.tmpl.min.js', CClientScript::POS_END);
            $cs->registerScriptFile(Yii::app()->baseUrl . '/js/jQuery.jPlayer/jquery.jplayer.min.js', CClientScript::POS_END);
            $cs->registerScriptFile(Yii::app()->baseUrl . '/js/mg.api.js', CClientScript::POS_END);
            $cs->registerScriptFile(Yii::app()->baseUrl . '/js/mg.game.api.js', CClientScript::POS_END);
            $cs->registerScriptFile(Yii::app()->baseUrl . '/js/mg.audio.js', CClientScript::POS_END);
            $cs->registerScriptFile($asset_url . '/js/mg.game.guesswhat.js', CClientScript::POS_END);

            $throttleInterval = (int)Yii::app()->fbvStorage->get("settings.throttle_interval", 1500);
            $message_queue_interval = (int)Yii::app()->fbvStorage->get("settings.message_queue_interval", 500);
            $arcade_url = Yii::app()->getRequest()->getHostInfo() . Yii::app()->createUrl('/');
            $base_url = Yii::app()->getRequest()->getHostInfo();

            $js = <<<EOD
    MG_GAME_GUESSWHAT.init({
        gid : 'GuessWhat',
        app_id : 'MG_API',
        asset_url : '$base_url$asset_url',
        base_url : '$base_url',
        arcade_url : '$arcade_url',
        game_base_url : '{$game->game_base_url}',
        api_url : '{$game->api_base_url}',
        throttleInterval : $throttleInterval,
        message_queue_interval : $message_queue_interval,
        partner_wait_threshold : {$game->partner_wait_threshold},
      });
EOD;
            Yii::app()->clientScript->registerScript(__CLASS__ . '#game', $js, CClientScript::POS_READY);

            $this->layout = '//layouts/column1';

            $this->render('index', array(
                'game' => $game,
            ));
        } else {
            throw new CHttpException(403, Yii::t('app', 'The game is not active.'));
        }
    }

    /**
     * show the game's settings
     */
    public function actionView()
    {
        $model = $this->loadModel(array("unique_id" => "GuessWhat"), 'GuessWhat');
        $model->fbvLoad();

        $this->render('view', array(
            'model' => $model,
            'statistics' => GamesModule::getStatistics($model->id)
        ));
    }

    /**
     * edit the game's settings
     */
    public function actionUpdate()
    {
        $model = $this->loadModel(array("unique_id" => "GuessWhat"), 'GuessWhat');
        $model->fbvLoad();

        $this->performAjaxValidation($model, 'guesswhat-form');
        if (isset($_POST['GuessWhat'])) {
            $model->setAttributes($_POST['GuessWhat']);

            $relatedData = array(
                'collections' => $_POST['GuessWhat']['collections'] === '' ? null : $_POST['GuessWhat']['collections'],
                'plugins' => $_POST['GuessWhat']['plugins'] === '' ? null : $_POST['GuessWhat']['plugins'],
            );

            // save the games data in the database
            if ($model->saveWithRelated($relatedData)) {
                $model->fbvSave(); // but also save it in the settings file as each game uses FBVstorage

                MGHelper::log('update', 'Game ' . $model->name . ' updated');
                Flash::add('success', $model->name . ' ' . Yii::t('app', "Updated"));
                $this->redirect(array('view'));
            }
        }

        $this->render('update', array(
            'model' => $model,
        ));
    }
}
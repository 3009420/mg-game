<?php
/**
 */

Yii::import('application.modules.plugins.models.MGPluginModel');

class ScoreNewMatch extends MGPluginModel implements MGPluginModelInterface
{
  public $active = 0; //active will never be saved in the games FBVStorage settings it is just a handler for the Plugin database entry
  public $score_new = 2;
  public $score_match = 1;
  
  public function rules() {
    return array(
        array('score_new, score_match', 'required'),
        array('score_new, score_match', 'numerical', 'min'=>0, 'max'=>100000000),
    );
  }
  
  public function attributeLabels() {
    return array(
      'score_new' => Yii::t('app', 'Score (new tag)'),
      'score_match' => Yii::t('app', 'Score (matched tag)'),
    );
  }
  
  /*
   * loads values from the settings file using the FBVStorage compontent
   */  
  public function fbvLoad() {
    $plugin_data = Yii::app()->fbvStorage->get("plugins.weighting." . $this->getPluginID(), null);
    if (is_array($plugin_data)) {
      $this->score_new = (int)$plugin_data["score_new"];
      $this->score_match = (int)$plugin_data["score_match"];
    }
  }
  
  /*
   * saves values from to settings file using the FBVStorage compontent
   */  
  public function fbvSave() {
    $plugin_data = array(
      'score_new' => $this->score_new,
      'score_match' => $this->score_match,
    );
    Yii::app()->fbvStorage->set("plugins.weighting." . $this->getPluginID(), $plugin_data);
  }
  
  public function getPluginID() {
    return __CLASS__;    
  }
}

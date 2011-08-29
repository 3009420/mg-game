<?php

/**
 * This is the model base class for the table "tag_use".
 * DO NOT MODIFY THIS FILE! It is automatically generated by giix.
 * If any changes are necessary, you must set or override the required
 * property or method in class "TagUse".
 *
 * Columns in table "tag_use" available as properties of the model,
 * followed by relations of table "tag_use" available as properties of the model.
 *
 * @property integer $id
 * @property integer $image_id
 * @property integer $tag_id
 * @property integer $weight
 * @property string $created
 * @property string $game_submission_id
 *
 * @property TagOriginalVersion[] $tagOriginalVersions
 * @property GameSubmission $gameSubmission
 * @property Image $image
 * @property Tag $tag
 */
abstract class BaseTagUse extends GxActiveRecord {

	public static function model($className=__CLASS__) {
		return parent::model($className);
	}

	public function tableName() {
		return 'tag_use';
	}

	public static function label($n = 1) {
		return Yii::t('app', 'TagUse|TagUses', $n);
	}

	public static function representingColumn() {
		return 'created';
	}

	public function rules() {
		return array(
			array('image_id, tag_id, created, game_submission_id', 'required'),
			array('image_id, tag_id, weight', 'numerical', 'integerOnly'=>true),
			array('game_submission_id', 'length', 'max'=>10),
			array('weight', 'default', 'setOnEmpty' => true, 'value' => null),
			array('id, image_id, tag_id, weight, created, game_submission_id', 'safe', 'on'=>'search'),
		);
	}

	public function relations() {
		return array(
			'tagOriginalVersions' => array(self::HAS_MANY, 'TagOriginalVersion', 'tag_uses_id'),
			'gameSubmission' => array(self::BELONGS_TO, 'GameSubmission', 'game_submission_id'),
			'image' => array(self::BELONGS_TO, 'Image', 'image_id'),
			'tag' => array(self::BELONGS_TO, 'Tag', 'tag_id'),
		);
	}

	public function pivotModels() {
		return array(
		);
	}

	public function attributeLabels() {
		return array(
			'id' => Yii::t('app', 'ID'),
			'image_id' => null,
			'tag_id' => null,
			'weight' => Yii::t('app', 'Weight'),
			'created' => Yii::t('app', 'Created'),
			'game_submission_id' => null,
			'tagOriginalVersions' => null,
			'gameSubmission' => null,
			'image' => null,
			'tag' => null,
		);
	}

	public function search() {
		$criteria = new CDbCriteria;

		$criteria->compare('id', $this->id);
		$criteria->compare('image_id', $this->image_id);
		$criteria->compare('tag_id', $this->tag_id);
		$criteria->compare('weight', $this->weight);
		$criteria->compare('created', $this->created, true);
		$criteria->compare('game_submission_id', $this->game_submission_id);

		return new CActiveDataProvider($this, array(
			'criteria' => $criteria,
			'pagination'=>array(
        'pageSize'=>Yii::app()->params['pagination.pageSize'],
      ),
		));
	}
}
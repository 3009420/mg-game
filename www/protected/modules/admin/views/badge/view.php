<?php

$this->breadcrumbs = array(
  Yii::t('app', 'Admin')=>array('/admin'),
	$model->label(2) => array('index'),
	GxHtml::valueEx($model),
);

$this->menu=array(
	array('label'=>Yii::t('app', 'Manage') . ' ' . $model->label(2), 'url'=>array('admin'))
);
if ($admin) {
    $this->menu[] = array('label'=>Yii::t('app', 'Create') . ' ' . $model->label(), 'url'=>array('create'));
    $this->menu[] = array('label'=>Yii::t('app', 'Update') . ' ' . $model->label(), 'url'=>array('update', 'id' => $model->id));
    $this->menu[] = array('label'=>Yii::t('app', 'Delete') . ' ' . $model->label(),
        'url'=>'#', 'linkOptions' => array('submit' => array('delete', 'id' => $model->id), 'confirm'=>'Are you sure you want to delete this item?'),
        'visible' => !($model->hasAttribute("locked") && $model->locked));
}
?>

<h1><?php echo Yii::t('app', 'View') . ' ' . GxHtml::encode($model->label()) . ' ' . GxHtml::encode(GxHtml::valueEx($model)); ?></h1>

<?php 
$this->widget('zii.widgets.CDetailView', array(
	'data' => $model,
	'cssFile' => Yii::app()->request->baseUrl . "/css/yii/detailview/styles.css",
  'attributes' => array(
'id',
'title',
'points',
  array(
    'name' => Yii::t('app', 'Badge Image (inactive)'),
    'type' => 'html',
    'value' => CHtml::image(Yii::app()->getBaseUrl() . Yii::app()->fbvStorage->get('settings.app_upload_url') . '/badges/'. $model->id . '_d.png'),
  ),
  array(
    'name' => Yii::t('app', 'Badge Image (active)'),
    'type' => 'html',
    'value' => CHtml::image(Yii::app()->getBaseUrl() . Yii::app()->fbvStorage->get('settings.app_upload_url') . '/badges/'. $model->id . '_a.png'),
  ),
	),
)); ?>


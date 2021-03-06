<?php

class AdminModule extends CWebModule
{
    public function init()
    {
        // this method is called when the module is being created
        // you may place code here to customize the module or the application

        // import the module-level models and components
        $this->setImport(array(
            'admin.models.*', // all models representing database tables are stores in application.models to keep them easily re-usable
            'admin.components.*',
        ));

        $this->setComponents(array('zip' => array(
            'class' => 'application.extensions.zip.EZip',
        )
        ));
    }

    public function getAdminToolsSubMenuLinks()
    {
        $links = array();
        $registered_tools = Yii::app()->fbvStorage->get("admin-tools");
        foreach ($registered_tools as $tool) {
            if (is_array($tool['roles'])) {
                foreach ($tool['roles'] as $role) {
                    if (Yii::app()->user->checkAccess($role)) {
                        $links[] = array(
                            'label' => $tool["name"],
                            'url' => array($tool['url'])
                        );
                        break;
                    }
                }
            }
        }
        return $links;
    }

    public function beforeControllerAction($controller, $action)
    {
        if (parent::beforeControllerAction($controller, $action)) {
            // this method is called before any module controller action is performed
            // you may place customized code here
            return true;
        } else
            return false;
    }
}

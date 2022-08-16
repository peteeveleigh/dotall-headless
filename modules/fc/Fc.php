<?php

namespace modules\fc;

use yii\base\Event;
use yii\base\Module;

use Craft;

use craft\web\UrlManager;
use craft\events\RegisterUrlRulesEvent;
use craft\web\twig\variables\CraftVariable;

use modules\ew\variables\FcVariable;

class Fc extends Module
{
	public static Fc $instance;

	public function __construct($id, $parent = null, $config = []) {
        Craft::setAlias('@modules/fc', __DIR__);

        // Set the controllerNamespace based on whether this is a console or web request
        if (Craft::$app->getRequest()->getIsConsoleRequest()) {
            $this->controllerNamespace = 'modules\\fc\\console\\controllers';
        } else {
            $this->controllerNamespace = 'modules\\fc\\controllers';
        }

        // Set this as the global instance of this module class
        static::setInstance($this);
        parent::__construct($id, $parent, $config);
    }

    public function init() {
        parent::init();
        self::$instance = $this;

		$this->setComponents([
            'critical' => \modules\fc\services\CriticalDataService::class
		]);

        // Register our site routes
        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules['api/get-critical'] = 'fc/critical-data/get-csrf-token';
            }
        );

		 // Register our variables
		 Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            function (Event $event) {
                /** @var CraftVariable $variable */
                $variable = $event->sender;
                $variable->set('fc', FcVariable::class);
            }
        );
    }
}
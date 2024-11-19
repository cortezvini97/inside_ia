<?php

return function($expression)
{
    return "<?php echo load($expression, 'css') ?>";
};
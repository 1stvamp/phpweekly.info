#!/usr/bin/env php
<?php
$cwd = getcwd() . '/';
$bin = $cwd . 'bin/';

// Create dynamic paths for environment
if (!file_exists($bin)) {
    mkdir($bin);
    echo "Created ${bin}" . PHP_EOL;
}

exec('curl -s http://getcomposer.org/installer | php -- --install-dir=' . $bin, $out, $return);
echo str_replace('composer.phar', 'composer', implode(PHP_EOL, $out)) . PHP_EOL;

if ($return > 0)
{
	exit($return);
}

rename($bin . 'composer.phar', $bin . 'composer');
chmod($bin . 'composer', 0755);

echo 'Done.' . PHP_EOL;
exit(0);

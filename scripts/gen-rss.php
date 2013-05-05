#!/usr/bin/env php
<?php
$base_uri = 'http://phpweekly.info/archive/';
$base_dir = dirname(__FILE__) . '/../';

require $base_dir . 'vendor/autoload.php';

use \Suin\RSSWriter as Rss;

$dom = simplexml_import_dom(HTML5_Parser::parse(file_get_contents($base_dir . 'archive/index.html')));

$feed = new Rss\Feed;
$channel = new Rss\Channel;
$channel
	->title('PHP Weekly')
	->description('Archived PHP Weekly issues')
	->url($base_uri)
	->appendTo($feed);

foreach($dom->body->div[0]->div[0]->section[0]->ul[0]->li as $li) {
	$title = (string)$li->a;
	$link = $base_uri . $li->a['href'];
	$parts = explode(' for ', $title);
	$parts = explode(' the ', $parts[1]);
	$date = strtotime(str_replace(' of', '', $parts[1]));
	$item = new Rss\Item;
	$subDoc = simplexml_import_dom(HTML5_Parser::parse(file_get_contents($base_dir . 'archive/' . $li->a['href'])));
	$item
		->title($title)
		->description((string)$subDoc->body->asXML())
		->url($link)
		->pubDate($date)
		->appendTo($channel);
}

echo 'Updating ' . $base_dir . 'archive/index.xml' . PHP_EOL;
file_put_contents($base_dir . 'archive/index.xml', (string)$feed);

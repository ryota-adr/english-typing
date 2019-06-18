<?php
require("EngTyping.php");
if (isset($_GET['text'])) {
    $filePath = __DIR__ . DIRECTORY_SEPARATOR . 'text' .DIRECTORY_SEPARATOR. $_GET['text'];

    if (! file_exists(__DIR__ . DIRECTORY_SEPARATOR . 'html')) {
        mkdir(__DIR__ . DIRECTORY_SEPARATOR . 'html');
    }

    if (! file_exists($htmlPath = __DIR__ . DIRECTORY_SEPARATOR . 'html' . DIRECTORY_SEPARATOR . $_GET['text'] . '.html')) {
        file_put_contents($htmlPath, EngTyping::creatTextLines($filePath));
    }

    $textBlocksArr = explode("\n", file_get_contents($htmlPath));
    $output = '';

    if (isset($_GET['idx'])) {
        for ($i = $_GET['idx']; $i < $_GET['idx'] + EngTyping::getFirstLoadNum(); $i++) {
            if (isset($textBlocksArr[$i])) {
                $output .= $textBlocksArr[$i];
            }
        }
    } else {
        for ($i = 0; $i < EngTyping::getFirstLoadNum(); $i++) {
            if (isset($textBlocksArr[$i])) {
                $output .= $textBlocksArr[$i];
            }
        }
    }
    echo $output;
} elseif (isset($_GET['file']) && isset($_GET['row']) && isset($_GET['len']) && isset($_GET['dir'])) {
    $filePath = __DIR__ . DIRECTORY_SEPARATOR . 'text' .DIRECTORY_SEPARATOR. $_GET['file'];

    if (! file_exists(__DIR__ . DIRECTORY_SEPARATOR . 'html')) {
        mkdir(__DIR__ . DIRECTORY_SEPARATOR . 'html');
    }

    if (! file_exists($htmlPath = __DIR__ . DIRECTORY_SEPARATOR . 'html' . DIRECTORY_SEPARATOR . $_GET['file'] . '.html')) {
        file_put_contents($htmlPath, EngTyping::creatTextLines($filePath));
    }

    $textBlocksArr = explode("\n", file_get_contents($htmlPath));
    $output = '';
    if ($_GET['dir'] > 0) {
        for ($i = $_GET['row']; $i < $_GET['row'] + $_GET['len']; $i++) {
            if (isset($textBlocksArr[$i])) {
                $output .= $textBlocksArr[$i];
            }
        }
    } else {
        for ($i = $_GET['row']; $i > $_GET['row'] - $_GET['len']; $i--) {
            if (isset($textBlocksArr[$i])) {
                $output = $textBlocksArr[$i] . $output;
            }
        }
    }

    echo $output;
}

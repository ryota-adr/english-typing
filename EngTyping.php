<?php
class EngTyping
{
    /**
     * The path of style sheet.
     * 
     * @var string
     */
    protected $cssPath = "style.css";

    /**
     * The path of javascript.
     * 
     * @var string
     */
    protected $jsPath = "script.js";

    /**
     * Request url without query 
     * 
     * @var string
     */
    protected $urlWithoutQuery;

    /**
     * Directory path of request url.
     * 
     * @var string
     */
    protected $dir;

    /**
     * The array of pathes of text files.
     * 
     * @var string[]
     */
    protected $textFiles = [];

    /**
     * Limit of string number.
     * 
     * @var int
     */
    protected static $strLimit = 75;

    /**
     * Number of first loading textBlocks.
     * 
     * @var int
     */
    protected static $firstLoadNum = 20;

    /**
     * Html to output.
     * 
     * @var string
     */
    protected $html;

    /**
     * Index of div.textBlock.
     * 
     * @var int
     */
    protected static $textBlockIdx = 0;

    public function __construct()
    {
        $this->setTextFiles();
        $this->urlWithoutQuery = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER["HTTP_HOST"] . strtok($_SERVER["REQUEST_URI"],'?');

        $this->dir = strpos($this->urlWithoutQuery, 'index.php') ? str_replace('index.php', '', $this->urlWithoutQuery) : $this->urlWithoutQuery;
    }

    /**
     * Set text files.
     */
    protected function setTextFiles()
    {
        $files = glob(__DIR__ . DIRECTORY_SEPARATOR . 'text' . DIRECTORY_SEPARATOR . '*.txt');
        foreach ($files as $file) {
            $this->textFiles[] = basename($file);
        }
    }

    public function getTextFiles()
    {
        return $this->textFiles;
    }

    /**
     * Creat html.
     * 
     * return $this
     */
    public function creatHtml()
    {
        $url = strpos($this->urlWithoutQuery, 'index.php') ? str_replace('index.php', '', $this->urlWithoutQuery) : $this->urlWithoutQuery;

        $style = '<link rel="stylesheet" href="'.$this->dir . $this->cssPath.'">';
        $head = "<head>$style</head>";

        $options = '';
        foreach ($this->getTextFiles() as $path) {
            $options .= "<option value\"$path\">$path</option>";
        }

        $form = "<select name=\"text\" class=\"textFiles\">$options</select><button>SHOW</button>";

        $js = $this->dir . $this->jsPath;

        $this->html =<<<HTML
<html>
    $head
<body>
<div class="container">
    <div class="article">
        <div class="form">
            $form
        </div>
        <div><textarea class="textarea" disabled></textarea></div>
        <div class="textContainer"></div>
        <div class="result"></div>
    </div>
    <script type="text/javascript" src="$js"></script>
</div>
</body>
</html>
HTML;

        return $this;
    }

    /**
     * Output html.
     * 
     * return void
     */
    public function output()
    {
        echo $this->html;
    }


    /**
     * Creat text lines wrapped with div.textBlock.
     * 
     * @param string $path
     * @return string[]
     */
    public static function creatTextLines($path)
    {
        if (file_exists($path)) {
            $text = file_get_contents($path);
            $text = static::mb2sb($text);
            
            $text = preg_replace(
                '/(\r\n|\r|\n)/',
                '⏎ ',
                $text
            );
            $words = explode(' ', $text);

            $idx = array_search('', $words);
            while ($idx !== false) {
                array_splice($words, $idx, 1);
                $idx = array_search('', $words);
            }
            $textBlocks = [];

            foreach ($words as $word) {
                $textBlocks[static::$textBlockIdx] = isset($textBlocks[static::$textBlockIdx]) ?  
                    $textBlocks[static::$textBlockIdx] : 
                    '';

                if (strpos($word, '⏎') !== false) {
                    $nlRemoved = str_replace('⏎', '', $word);
                    if (strlen($textBlocks[static::$textBlockIdx] . $nlRemoved) <= static::$strLimit) {
                        $textBlocks[static::$textBlockIdx] .= $word;
                        static::$textBlockIdx++;
                    } else {
                        //$textBlocks[static::$textBlockIdx] = preg_replace('/ $/', '', $textBlocks[static::$textBlockIdx]);
                        static::$textBlockIdx++;
                        $textBlocks[static::$textBlockIdx] = $word;
                        static::$textBlockIdx++;
                    }
                } else {
                    if (strlen($textBlocks[static::$textBlockIdx] . $word . ' ') <= static::$strLimit) {
                        $textBlocks[static::$textBlockIdx] .= $word . ' ';
                    } else {
                        //$textBlocks[static::$textBlockIdx] = preg_replace('/ $/', '', $textBlocks[static::$textBlockIdx]);
                        static::$textBlockIdx++;
                        $textBlocks[static::$textBlockIdx] = $word . ' ';
                    }
                }
            }

            static::$textBlockIdx = 0;
            $divTextBlocks = [];
            foreach ($textBlocks as $textBlock) {
                $divTextBlocks[] = '<div class="textBlock" data-text-block-idx="' . static::$textBlockIdx . '"><span class="textBlock">' . $textBlock . '</span></div>'. "\n";
                static::$textBlockIdx++;
            }
            return implode($divTextBlocks);;
        }
    }

    /**
     * Replace multibyte string with singlebyte sting.
     * 
     * @return string
     */
    public static function mb2sb($text)
    {
        $text = preg_replace('/\xef\xbb\xbf/', '', $text);
        $text = preg_replace('/\xe2\x80\x99/', "'", $text);
        $text = preg_replace('/\xe2\x80\x9c/', '"', $text);
        $text = preg_replace('/\xe2\x80\x9d/', '"', $text);
        $text = preg_replace('/\xE2\x80\x93/', '-', $text);
        $text = preg_replace('/\xe2\x80\xa6/', '...', $text);
        $text = preg_replace('/\xe2\x80\x98/', "'", $text);

        return $text;
    }

    /**
     * Get number of first loading textBlocks.
     * 
     * @return int
     */
    public static function getFirstLoadNum() {
        return static::$firstLoadNum;
    }
}

# Test File Format Specification

Test files are UTF-8 encoded text files. Each file represents a test script to
run. Each test script consists of a sequence of commands:

# Basic File Format

```
$contents = $text ($command $text)*
$text = any text; must not contain "$test."
$command = "$test.$" $commandName "(" $params ")"
$commandName = the command's name
$params = $param (";" $param)*
$param = a parameter as defined by $command
```

* $text can be any text content as required by its preceeding $command.
* Any whitespace at the beginning or at the end of $text will automatically be
  removed; i.e. all $text content will be trimmed.
* Any $text that preceeds the very first $command will be ignored and can
  therefore be used for documentation.
* Multiline commands are not supported; i.e. unlike $text, no $command should
  stretch over multiple lines.
* Each $param represents a parameter required by its $command. Care must be taken
  that these values don't contain semicolon characters.
  Currently, no escaping is supported.
* Any $text could be considered as an implicit additional $param of the preceeding
  $command.
* Commands that have an unknown $commandName will be ignored.

# $comment command

```
$test.$comment() $text
$test.$ignore() $text
```

* $comment commands can be used for additional documentation, or to visually
  separate multiple commands from each other.
* $comment and $ignore commands are in fact unknown commands and will simply
  be ignored.

# $html(selector) command

```
$test.$html($selector) $text
$text = any html content
```

* $html commands are used to define the HTML content for which outlines will
  be created.
* $selector is used to tell for which element to create an outline using
  jsdom.document.querySelector($selector) expressions. Therefore, outlines
  will only be created for the first matching DOM node.
* $text holds the HTML content for which to create outlines and can be any
  HTML content. Even fully blown HTML documents are supported.
* Each script file must have exactly one $html(selector) command.

# $outline() command

```
$test.$outline() $text
$text = ($line "\n")+
$line = $prefix \s $suffix
$prefix = ([1-9][0-9]*\.)+
$suffix = $key
```

* Essentially, $text defines what the outline generated by $test.$html()
  should look like.
* Each $line must be unique; should be guaranteed by each $prefix.
* Only one $outline() command per test script is allowed.
* $outline() commands must precede any $outline(line) commands.
* A $outline() command is not required. If none is specified, the test will
  merely try to parse the content given by $test.$html(selector). In such a
  case, no checks will be done to verify the generated outline.

# $outline(line) command

```
$test.$outline($key) $text
$key = a $line value from $test.$outline()
```

* Essentially, $text defines what an internal outline should look like.
* Only one $outline(line) command per $outline() $line is allowed.
* $outline(line) commands must be located after a $outline() command.
* If there is no $outline() command, then no $outline(line) commands are allowed.
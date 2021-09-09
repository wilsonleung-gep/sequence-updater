<?php

require_once(dirname(__FILE__) . "/VType.php");

class Validator
{
  public $unsafe;
  public $errors;
  public $clean;

  public function __construct($taintedArray)
  {
    $this->unsafe = $taintedArray;
    $this->errors = array();
    $this->clean = new stdClass();
  }

  public function validate($v)
  {
    if (array_key_exists($v->fieldName, $this->unsafe)) {

      if ($v->type === "Array") {
        $this->cleanArray($v);
      } else {
        $this->cleanField($v);
      }

    } else {
      if ($v->isRequired) {
        $this->addError("Required parameter {$v->fieldName} does not exists");
      }
    }
  }

  public function cleanField($v)
  {
    $fieldName = $v->fieldName;

    $this->unsafe[$fieldName] = trim($this->unsafe[$fieldName]);

    if ($this->isEmpty($this->unsafe[$fieldName])) {
      $this->addError("Field {$v->fieldLabel} is empty");
    } else {
      $func = "clean{$v->type}";
      $this->$func($v);
    }
  }

  protected function cleanArray($v)
  {
    $fieldName = $v->fieldName;
    $fieldLabel = $v->fieldLabel;
    $taintedInput = $this->unsafe[$fieldName];

    if (! is_array($taintedInput)) {
      $this->addError("{$fieldLabel} is not in the correct format");
    }

    if (($v->isRequired) &&
        (count($taintedInput) === 0)) {

      $this->addError("{$fieldLabel} is empty");

    } else {
      $this->clean->{$fieldName} = $taintedInput;
    }
  }

  protected function cleanJSON($v)
  {
    $fieldName = $v->fieldName;
    $taintedInput = $this->unsafe[$fieldName];

    $json = json_decode($taintedInput, true);

    if ($json === null) {
      throw new InvalidArgumentException("Cannot decode web request");
    }

    $this->clean->{$fieldName} = $json;
  }

  protected function cleanString($v)
  {
    $taintedInput = $this->unsafe[$v->fieldName];
    $sanitizedString = filter_var($taintedInput, FILTER_SANITIZE_STRING);

    $this->clean->{$v->fieldName} = $sanitizedString;
  }

  protected function cleanPositiveInt($v)
  {
    $taintedInput = $this->unsafe[$v->fieldName];

    $intValue = intval($taintedInput);

    if (strval($intValue) !== $taintedInput) {
      $this->addError("{$v->fieldLabel} is not a valid integer");
      return;
    }

    if ($intValue <= 0) {
      $this->addError("{$v->fieldLabel} must be a positive integer");
      return;
    }

    $this->clean->{$v->fieldName} = $intValue;
  }


  public function addError($errorMessage)
  {
    if (is_array($errorMessage)) {
      array_merge($this->errors, $errorMessage);
    } else {
      $this->errors[] = $errorMessage;
    }
  }

  public function clearErrors()
  {
    $this->errors = array();
  }

  public function hasErrors()
  {
    return (count($this->errors) != 0);
  }

  public function listErrors($separator = "\n")
  {
    return join($separator, $this->errors);
  }

  protected function isEmpty($taintedInput)
  {
    return (strlen(trim($taintedInput)) <= 0);
  }
}

?>

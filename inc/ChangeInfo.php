<?php
class ChangeInfo
{
  const PROJECT_NAME_PATTERN = '/^[A-Za-z0-9_]+$/';

  public $initErrors;
  public $db;
  public $project;
  public $changeList;

  public function __construct($changeInfo)
  {
    $this->initErrors = array();

    $validator = $this->checkRequiredProperties($changeInfo);

    if ($validator->hasErrors()) {
      $this->initErrors = $validator->listErrors();
      return;
    }

    $clean = $validator->clean;

    $this->db = $clean->db;
    $this->project = $clean->project;
    $this->changeList = $clean->changeList;
  }

  public function getName()
  {
    return sprintf("%s_%s", $this->db, $this->project);
  }

  public function hasInitErrors()
  {
    return (count($this->initErrors) > 0);
  }

  protected function checkRequiredProperties($changeInfo)
  {
    $requiredProperties = array(
        new VType("String", "db", "Database"),
        new VType("String", "project", "Project Name"),
        new VType("Array", "changeList", "Change List")
    );

    $validator = new Validator($changeInfo);

    foreach ($requiredProperties as $v) {
      $validator->validate($v);
    }

    if (! $validator->hasErrors()) {
      $this->validateDatabase($validator);
      $this->validateProjectName($validator);
    }

    return $validator;
  }

  protected function validateProjectName($validator)
  {
    $taintedInput = $validator->clean->project;

    if (preg_match(self::PROJECT_NAME_PATTERN, $taintedInput)) {
      $this->project = $taintedInput;
    } else {
      $validator->addError("Invalid project name");
    }
  }

  protected function validateDatabase($validator)
  {
    $taintedInput = $validator->clean->db;

    if (array_key_exists($taintedInput, ProjectRegions::$REGIONS)) {
      $this->db = $taintedInput;
    } else {
      $validator->addError("Unknown database name");
    }
  }
}


?>

<?php

define("SEQUENCE_PADDING", 15);

spl_autoload_register(
  function ($className) {
      include '../inc/' . $className . '.php';
  }
);


$APPCONFIG_FILE = "../conf/app.ini.php";
$APPCONFIG = initAppConfig($APPCONFIG_FILE);


function main()
{
  try {
    $validator = untaintVariables();

    $extractedSeqInfo = extractSequence($validator->clean);

    reportResults($extractedSeqInfo);

  } catch (Exception $e) {
    reportErrors($e->getMessage());
  }
}

main();

function extractSequence($clean)
{
  $seqInfo = retrieveSequenceFromTwoBit($clean);

  $position = $seqInfo["position"];
  $startPosition = $seqInfo["startPosition"];

  $sequence = $seqInfo["sequence"];

  $offset =  $position - $startPosition - 1;


  $surroundEnd = ($seqInfo["endPosition"] === $position) ?
      "" : substr($sequence, $offset + 1);

  return array_merge($seqInfo, array(
      "startPosition" => $startPosition + 1,
      "surroundStart" => substr($sequence, 0, $offset),
      "selectedBase" => substr($sequence, $offset, 1),
      "surroundEnd" => $surroundEnd));
}

function retrieveSequenceFromTwoBit($clean)
{
  global $APPCONFIG;

  $twoBitFilePath = getTwoBitPath($clean);

  $position = $clean->position;

  $startPosition = max(0, $position - $clean->padding - 1);
  $endPosition = min($position + $clean->padding, $clean->sequenceLength);

  $cmd = sprintf("%s -noMask %s:%s:%d-%d stdout",
      $APPCONFIG["bin"]["twoBitToFa"],
      $twoBitFilePath,
      $clean->project,
      $startPosition,
      $endPosition
  );

  $output = Utilities::runCommand($cmd);

  $sequence = str_replace("\n", "",
      preg_replace('/^>(.*)/', "", $output["stdout"]));

  if ($sequence === "") {
    throw new Exception("Extracted sequence is empty");
  }

  return array(
      "sequence" => $sequence,
      "startPosition" => $startPosition,
      "endPosition" => $endPosition,
      "position" => $position
  );
}

function getTwoBitPath($clean)
{
  global $APPCONFIG;
  $appSettings = $APPCONFIG["app"];

  $db = $clean->db;

  $twoBitFilePath =
      realpath(sprintf("%s/%s/%s.2bit", $appSettings["gbdbdir"], $db, $db));

  if (!is_readable($twoBitFilePath)) {
    throw new Exception("twoBit file for {$db} not found.");
  }

  return $twoBitFilePath;
}


function initAppConfig()
{
  global $APPCONFIG_FILE;
  $appConfig = parse_ini_file($APPCONFIG_FILE, true);

  return $appConfig;
}

function reportResults($clean)
{
  echo json_encode(array(
      "status" => "success",
      "message" => "",
      "result" => $clean));
}

function reportErrors($errors)
{
  echo json_encode(array(
      "status" => "failure",
      "message" => $errors,
      "result" => ""));

  exit;
}

function untaintVariables()
{
  $_GET["changeList"] = array("SKIP");
  $changeInfo = new ChangeInfo($_GET);

  $validator = new Validator($_GET);

  validatePosition($validator);
  $validator->addError($changeInfo->initErrors);

  if ($validator->hasErrors()) {
    reportErrors($validator->listErrors());
  }

  $validator->clean->db = $changeInfo->db;
  $validator->clean->project = $changeInfo->project;

  $validator->clean->padding = SEQUENCE_PADDING;

  return $validator;
}

function validatePosition($validator)
{
  $variablesToCheck = array(
      new VType("PositiveInt", "position", "Position"),
      new VType("PositiveInt", "sequenceLength", "Sequence Length")
  );

  foreach ($variablesToCheck as $v) {
    $validator->validate($v);
  }

  if ($validator->hasErrors()) {
    return;
  }

  $position = $validator->clean->position;
  $sequenceLength = $validator->clean->sequenceLength;

  if ($position > $sequenceLength) {
    $validator->addError(
        sprintf("Position %d exceeds total sequence length %d",
            $position, $sequenceLength));
  }
}

?>

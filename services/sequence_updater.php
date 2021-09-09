<?php
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

    generateTmpOutputNames($validator);

    createVcfFile($validator->clean);

    reportResults($validator->clean);

  } catch (Exception $e) {
    reportErrors($e->getMessage());
  }
}

main();


function initAppConfig()
{
  global $APPCONFIG_FILE;
  $appConfig = parse_ini_file($APPCONFIG_FILE, true);

  $appSettings = $appConfig["app"];

  $appConfig["app"]["trashPath"] =
    sprintf("%s/%s", $appSettings["rootdir"], $appSettings["trashdir"]);

  $appConfig["app"]["webTrashPath"] =
    sprintf("%s/%s", $appSettings["webroot"], $appSettings["trashdir"]);

  return $appConfig;
}

function createNewFastaFile($clean)
{
  global $APPCONFIG;

  $newFastaPath = sprintf("%s/%s",
      $APPCONFIG["app"]["trashPath"], $clean->tmpOutPrefix.".fa");

  $vcfConsensusCmd = sprintf("%s %s %s %s",
      $APPCONFIG["bin"]["vcfConsensus"],
      $clean->projectSequencePath,
      $clean->tmpVcfBgZipPath,
      $newFastaPath);

  Utilities::runCommand($vcfConsensusCmd);

  $clean->newFastaPath = $newFastaPath;
}

function createVcfFile($clean)
{
  $vcfCollection = new VcfTable();

  $changeInfo = $clean->changeInfo;

  foreach ($changeInfo->changeList as $c) {
    $item = new VcfItem(array(
        "db" => $changeInfo->db,
        "chrom" => $changeInfo->project,
        "position" => Utilities::fetch($c, "position"),
        "ref" => Utilities::fetch($c, "originalSequence"),
        "alt" => Utilities::fetch($c, "newSequence")
    ));

    $vcfCollection->addItem($item);
  }

  $vcfCollection->writeFile($clean->tmpVcfPath);

  indexVcf($clean);
}

function indexVcf($clean)
{
  global $APPCONFIG;

  $tmpVcfPath = $clean->tmpVcfPath;
  $tmpVcfBgZipPath = $clean->tmpVcfPath.".gz";

  $bgzipCmd = sprintf("%s -c %s > %s",
      $APPCONFIG["bin"]["bgzip"], $tmpVcfPath, $tmpVcfBgZipPath);

  Utilities::runCommand($bgzipCmd);


  $tabixCmd = sprintf("%s -p vcf %s",
      $APPCONFIG["bin"]["tabix"], $tmpVcfBgZipPath);

  Utilities::runCommand($tabixCmd);

  $clean->tmpVcfBgZipPath = $tmpVcfBgZipPath;
}

function retrieveOriginalSequence($clean)
{
  global $APPCONFIG;

  $changeInfo = $clean->changeInfo;
  $appSettings = $APPCONFIG["app"];

  $projectSequenceFile = sprintf("%s.fa", $changeInfo->getName());

  $projectSequencePath = sprintf(
    "%s/%s", $appSettings["trashPath"], $projectSequenceFile);

  if (! is_readable($projectSequencePath)) {
    createSequenceFileFromTwoBit($changeInfo, $projectSequencePath);
  }

  $clean->projectSequenceFile = $projectSequenceFile;
  $clean->projectSequencePath = realpath($projectSequencePath);
}

function createSequenceFileFromTwoBit($changeInfo, $outFilePath) {
  global $APPCONFIG;
  $appSettings = $APPCONFIG["app"];

  $project = $changeInfo->project;
  $db = $changeInfo->db;

  $twoBitFilePath =
      realpath(sprintf("%s/%s/%s.2bit", $appSettings["gbdbdir"], $db, $db));

  if (! is_readable($twoBitFilePath)) {
    throw new Exception("twoBit file for {$db} not found.");
  }

  $cmd = sprintf("%s -noMask %s:%s %s",
      $APPCONFIG["bin"]["twoBitToFa"],
      $twoBitFilePath,
      $changeInfo->project,
      $outFilePath
  );

  Utilities::runCommand($cmd);

  if (filesize($outFilePath) === 0) {
    unlink($outFilePath);
    throw new Exception("Project {$project} not found in region {$db}");
  }
}

function generateTmpOutputNames($validator)
{
  global $APPCONFIG;
  $appSettings = $APPCONFIG["app"];

  $changeInfo = $validator->clean->changeInfo;

  $outPrefix = sha1(sprintf("%s+%s", $changeInfo->getName(), rand()));

  $vcfPath = sprintf("%s/%s.vcf.txt", $appSettings["trashPath"], $outPrefix);

  $newFastaPath = sprintf("%s/%s.fa", $appSettings["trashPath"], $outPrefix);

  $validator->clean->tmpOutPrefix = $outPrefix;
  $validator->clean->tmpVcfPath = $vcfPath;
  $validator->clean->tmpNewFastaPath = $newFastaPath;
}


function reportResults($clean)
{
  global $APPCONFIG;
  $webTrashPath = $APPCONFIG["app"]["trashdir"];

  $result = array(
      "vcffile" => sprintf("%s/%s.vcf.txt", $webTrashPath, $clean->tmpOutPrefix)
  );

  echo json_encode(array(
      "status" => "success",
      "message" => "",
      "result" => $result));
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
  $validator = new Validator($_POST);

  $variablesToCheck = array(
    new VType("JSON", "changeset", "List of changes")
  );

  foreach ($variablesToCheck as $v) {
    $validator->validate($v);
  }

  if ($validator->hasErrors()) {
    reportErrors($validator->listErrors());
  } else {
    buildChangeInfo($validator);
  }

  return $validator;
}

function buildChangeInfo($validator)
{
  $changeInfo = new ChangeInfo($validator->clean->changeset);

  if ($changeInfo->hasInitErrors()) {
    reportErrors($changeInfo->initErrors);
  }

  unset($validator->clean->changeset);
  $validator->clean->changeInfo = $changeInfo;
}

?>

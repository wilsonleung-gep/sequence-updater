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
  global $APPCONFIG;

  try {
    $changeInfo = untaintVariables();

    $dbHandle = connectDB($changeInfo->db, $APPCONFIG["database"]);

    $chromInfo = findChromMatches($changeInfo, $dbHandle);

    $dbHandle->disconnect();

    reportResults(array("projectList" => $chromInfo));
  } catch (Exception $e) {
    reportErrors($e->getMessage());
  }
}

main();

function buildQueryString()
{
  $isExactMatch = (isset($_GET["match"]) && ($_GET["match"] === "exact"));

  $filter = $isExactMatch ? "chrom = ? LIMIT 1" : "chrom REGEXP ? LIMIT 10";

  return "SELECT chrom, size from chromInfo WHERE {$filter}";
}

function findChromMatches($changeInfo, $dbHandle)
{
  $query = buildQueryString();

  $chromInfo = array();
  $chrom = null;
  $size = null;

  $stmt = $dbHandle->prepare($query);
  $stmt->bind_param("s", $changeInfo->project);

  $status = $stmt->execute();
  if ($status === false) {
    throw new Exception("Cannot execute query: {$status}");
  }

  $stmt->bind_result($chrom, $size);

  while ($stmt->fetch()) {
    array_push($chromInfo, array("name" => $chrom, "sequenceLength" => $size));
  }

  return $chromInfo;
}

function connectDB($db, $dbConfig)
{
  $dbSettings = array_merge($dbConfig, array("db" => $db));

  return new DBUtilities($dbSettings);
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
  $_GET["changeList"] = array("skip");

  $changeInfo = new ChangeInfo($_GET);

  if ($changeInfo->hasInitErrors()) {
    reportErrors($changeInfo->initErrors);
  }

  return $changeInfo;
}

?>

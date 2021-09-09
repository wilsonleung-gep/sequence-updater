<?php

class DBUtilities
{
  protected $dbConnection;

  public function __construct($dbSettings)
  {
    $dbConfig = $this->loadDBConfig($dbSettings);

    $this->dbConnection = new mysqli(
        $dbConfig['hostname'], $dbConfig['username'],
        $dbConfig['password'], $dbConfig['db']
    );

    if (mysqli_connect_errno()) {
      throw new Exception(
      "Cannot connect to the database {$database}:\n".mysqli_connect_error());
    }
  }

  public function prepare($query)
  {
    $stmt = $this->dbConnection->prepare($query);

    if (empty($stmt)) {
      throw new Exception("Error in prepare statement:\n".
          $this->dbConnection->error);
    }

    return $stmt;
  }

  private function loadDBConfig($dbSettings)
  {
    $requiredParams = array('username', 'password', 'db');

    foreach ($requiredParams as $param) {
      if (!isset($dbSettings[$param])) {
        throw new Exception("Error in database configuration file");
      }
    }

    $dbSettings["hostname"] =
        Utilities::fetch($dbSettings, "hostname", "localhost");

    return $dbSettings;
  }

  public function disconnect()
  {
    $this->dbConnection->close();
    $this->dbConnection = null;
  }

  function getConnection()
  {
    return $this->dbConnection;
  }

}

?>

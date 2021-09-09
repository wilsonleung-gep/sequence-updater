<?php

class VcfItem
{
  const DEFAULT_QUALITY = 30;
  const DEFAULT_FILTER = "PASS";
  const DEFAULT_INFO = "NM=GEP";

  protected $db;
  protected $chrom;
  protected $position;
  protected $id;
  protected $ref;
  protected $alt;
  protected $quality;
  protected $filter;
  protected $info;

  function __construct($prop)
  {
    $this->db = $prop["db"];
    $this->chrom = $prop["chrom"];
    $this->position = $prop["position"];
    $this->id = $this->buildID($prop);
    $this->ref = $prop["ref"];
    $this->alt = $prop["alt"];

    $this->quality = Utilities::fetch($prop, "filter", self::DEFAULT_FILTER);
    $this->filter = Utilities::fetch($prop, "quality", self::DEFAULT_QUALITY);
    $this->info = Utilities::fetch($prop, "info", self::DEFAULT_INFO);
  }

  function __toString()
  {
    return implode("\t", array(
        $this->chrom,
        $this->position,
        $this->id,
        $this->ref,
        $this->alt,
        $this->filter,
        $this->quality,
        $this->info));
  }

  function buildID($prop)
  {
    return sprintf("vcf_%s_%s_%s",
      $prop["db"], $prop["chrom"], $prop["position"]
    );
  }

  function getChrom()
  {
    return $this->chrom;
  }

  function getPosition()
  {
    return $this->position;
  }

}

?>

<?php
class VcfTable {
    public $vcfItems;

    public function __construct() {
      $this->vcfItems = array();
    }

    public function writeFile($tmpfilename) {
        $fh_out = fopen($tmpfilename, "w");

        if (!$fh_out) {
            throw new Exception(
              sprintf("Cannot open output file: {$tmpfilename}")
            );
        }

        $this->writeHeader($fh_out);

        $this->writeItems($fh_out);

        fclose($fh_out);
    }

    public function addItem($vcfItem)
    {
      array_push($this->vcfItems, $vcfItem);
    }

    private function writeHeader($fh_out)
    {
      $vcfHeader = <<<EOL
##fileformat=VCFv4.1
##source=postulated_sequence_errors
##INFO=<ID=NM,Number=1,Type=String,Description="Authors">
EOL;
              
      
      $this->writeLine($fh_out, $vcfHeader);
      $this->writeLine($fh_out, implode("\t",
          array("#CHROM", "POS", "ID", "REF", "ALT", "QUAL", "FILTER", "INFO")
      ));
    }

    private function writeItems($fh_out) {
        usort($this->vcfItems, 'sortVcfItems');

        $numItems = count($this->vcfItems);

        for ($i = 0; $i < $numItems; $i++) {
            $this->writeLine($fh_out, $this->vcfItems[$i]->__toString());
        }
    }

    private function writeLine($fh_out, $line) {
        $line = sprintf("%s\n", $line);

        if (fwrite($fh_out, $line) === FALSE) {
            throw new Exception("Cannot write to GTF file");
        }
    }
}

function sortVcfItems($a, $b)
{
  if ($a->getChrom() === $b->getChrom()) {
    $difference = $a->getPosition() - $b->getPosition();

    if ($difference === 0) {
      return 0;
    }

    return ($difference < 0) ? -1 : 1;
  }

  return ($a->getChrom() < $b->getChrom()) ? -1 : 1;
}

?>

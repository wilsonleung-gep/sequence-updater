; <?php exit; ?>
;-------------------
; Setup for Sequence Updater
;-------------------
[database]
username = "[Database username]"
password = "[Database password]"
hgcentralDb = "[UCSC Genome Browser hgcentral database]"

[app]
trashdir = "[Path to directory for temporary files]"
rootdir = "[Path to sequence-updater directory]"
webroot = "[URL to sequence-updater directory]"
assemblylookup = "services/assemblylookup.php"
scaffoldlookup = "services/scaffoldlookup.php"
gbdbdir = "[Path to the gbdb directory for the UCSC Genome Browser]"
twobitdir = "[Path to directory containing the UCSC TwoBit files]"
twobitcache = "[Path to cache directory]"

[bin]
twoBitToFa = "/path/to/twoBitToFa"
bgzip = "/path/to/bgzip"
tabix = "/path/to/tabix"
vcfConsensus = "/path/to/runVcfConsensus.sh"

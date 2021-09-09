#!/bin/bash

if [[ $# -ne 3 ]]; then
  echo "usage: $0 <original_fasta> <vcf_file> <new_fasta>"
  exit 1
fi

originalFa=$1
vcfFile=$2
newFa=$3

SAMTOOLS_DIR="/path/to/samtools"
VCF_DIR="/path/to/vcftools"
VCF_LIB="/path/to/vcf_lib"
PERL_BIN="/usr/bin/perl"

cat "${originalFa}" | \
  PATH=${PATH}:${SAMTOOLS_DIR} \
  ${PERL_BIN} -I${VCF_LIB} ${VCF_DIR}/bin/vcf-consensus "${vcfFile}" > "${newFa}"

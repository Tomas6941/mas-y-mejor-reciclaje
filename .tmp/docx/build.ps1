$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$out = (Resolve-Path '.').Path + '\output\docx\paleta-de-colores.docx'
if (Test-Path $out) { Remove-Item -LiteralPath $out -Force }
$zip = [System.IO.Compression.ZipFile]::Open($out,[System.IO.Compression.ZipArchiveMode]::Create)
function Add-ZipText($zip,$name,$content) { $entry=$zip.CreateEntry($name); $stream=$entry.Open(); $writer=[System.IO.StreamWriter]::new($stream,[System.Text.UTF8Encoding]::new($false)); $writer.Write($content); $writer.Dispose(); $stream.Dispose() }
Add-ZipText $zip '[Content_Types].xml' '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="html" ContentType="text/html"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
Add-ZipText $zip '_rels/.rels' '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
Add-ZipText $zip 'word/document.xml' '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body><w:altChunk r:id="rId1"/><w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr></w:body></w:document>'
Add-ZipText $zip 'word/_rels/document.xml.rels' '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="afchunk.html"/></Relationships>'
$htmlContent = Get-Content '.tmp/docx/paleta.html' -Raw
Add-ZipText $zip 'word/afchunk.html' $htmlContent
$zip.Dispose()
Get-Item $out | Select-Object FullName,Length

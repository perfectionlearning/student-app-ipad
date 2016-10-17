@echo off
cd /d "%~dp0"
copy /b getresource_part1.txt + resource_list.txt + getresource_part2.txt "C:\Program Files (x86)\CodeAndWeb\TexturePacker\bin\exporters\cust-json\grantlee\0.2\getresource.qs"
TexturePacker PerfectWorksheet.tps
pause

@echo off
copy /b prehead.txt + libs.txt + modules.txt + bootstrap.txt + body.txt ..\..\..\project.html
copy /b prehead-test.txt + libs.txt + modules.txt + tests.txt + bootstrap.txt + body-test.txt ..\..\..\TestRunner.html
#==================================================================================
# Build Script for AMSCO Math
#
# This creates versions of the product that are ready for
# deployment, i.e. minified and stripped down to essentials.
#
# This assumes you have the \books\tools\deploy directory in your path
#
# We need a quick deploy, and a full deploy option
#==================================================================================
from Deploy import *

#============================================================
# Clean up any old deployment files that still exist
#============================================================
clean_old_files()

#============================================================
# Determine the current version and update it
#============================================================
version = process_version()

#============================================================
# Create all of the desired targets here
#
# These should be data structures, located inside this file
# Having the Deploy module know about the different targets
# is a bit silly.  It should just know about various actions
# that can be taken.
#============================================================


#--------------------------------------
# DEPLOY: Student, Staging, Marias
#
# Do this LAST! (So the correct config.js is active)
#--------------------------------------
create_target(
    title = "Student, Online, Test",
    out_dir = 'studenttest',
    user_type = 'student',
    environment = 'online',
    server = 'testdb'
)
create_target(
    title = "Student, Staging, Marias",
    out_dir = 'Dev',
    user_type = 'student',
    environment = 'staging',
    server = 'mariasdb'
)

#============================================================
# Move the deploy directories to their final reseting place
#============================================================
print("Final cleanup")

# Move StudentOnline to "student" and TeacherOnline to "teacher" in the Deploy/version directory
finalize_deploy(version)

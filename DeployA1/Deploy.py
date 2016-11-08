#==================================================================================
# This is getting to be too long. Split it into multiple modules.
#==================================================================================
from shutil import *        # Slightly bad form, but we use these utilities often.  This keeps the code smaller and clearer.
import subprocess           # Run external programs
import codecs               # Read/write UTF-8 files
import re                   # Regular expressions
import os                   # OS calls (used for file and directory manipulation)
from time import sleep      # We need a short delay
from glob import iglob      # Wildcard support

#===========================================================
# Smooth out Python 2.7 and 3.4 differences
#===========================================================
try:
    from subprocess import DEVNULL # py3k
except ImportError:
    import os
    DEVNULL = open(os.devnull, 'wb')

#===========================================================
# Global configuration
#===========================================================
verbose = False
out_dirs = []
deploy_var_list = {}     # Unfortunately, this needs to be global. It's needed in a function where it can't be passed in.

# Combined list of changes to perform
# Remove the hard-coded filename

# Change these as necessary
product_name = 'AMSCO_OHW'
config_file = '..\scripts\config.js'
global_file = '..\scripts\A1PARCC\GlobalDeploy.js'
student_pid = "101"
teacher_pid = "102"

#==================================================================================
# Primary Operation
#==================================================================================

#============================================================
# Main deploy action, called once per target.
#============================================================
def create_target(title, out_dir, user_type, environment, server):
    print("Deploying " + title + " version")

    # This doesn't do much anymore
    always_actions()

    # Reset the change_list
    global change_list
    change_list = ('comb.js', [])

    # Construct list of variables to replace
    global deploy_var_list
    deploy_var_list = {
        'BACKEND_SERVER': server,
        'USER_LEVEL': user_type
    }

    # Add global change items
    add_change("//REMOVEME:", "")

    # Add environment-specific change items
    if (environment == "online"):
        online_actions()
    elif (environment == "staging"):
        staging_actions()

    set_product_id(user_type)

    # Perform the actual deployment
    deploy(out_dir)


#==================================================================================
# General Utility Functions
#==================================================================================

#============================================================
#============================================================
def add_change(from_string, to_string):
    """Add a change request to the change list"""
    global change_list
    change_list[1].append([from_string, to_string])

#============================================================
#============================================================
def mod_file():
    """Perform regular expression modifications to a single file"""
    """Fill in variable blocks and perform conditional deletions"""
    fname = change_list[0]

    # Read the config file
    with codecs.open(fname, 'r', encoding='utf8') as f:
        contents = f.read(20*1024*1024);        # Choose a ridiculously large maximum

    # Perform each requested substitution
    for change in change_list[1]:
        contents = re.sub(change[0], change[1], contents)

    # Fill in variables
    for var in deploy_var_list:
        contents = re.sub('%%' + var + '%%', deploy_var_list[var], contents)

    # Handle conditional deletions
    for var in deploy_var_list:
        contents = re.sub('//%\?(' + var + ')=(\w+)%(.+?)//\?%', conditional_delete, contents, flags=re.S)

    # Write the config file
    with codecs.open(fname, 'w', encoding='utf8') as f:
        f.write(contents)

#============================================================
#============================================================
def conditional_delete(matchobj):

    # group 1 is the name of the variable to check against
    # group 2 is the conditional value to check against
    # group 3 is the text to include or delete

    if (deploy_var_list[matchobj.group(1)] == matchobj.group(2)):
        return matchobj.group(3)
    else:
        return ''

#============================================================
#============================================================
def copy_wild(src_glob, dst_folder):
    for fname in iglob(src_glob):
        copy(fname, dst_folder)

#============================================================
#============================================================
def concat_files(file_list, out_filename):
    with open(out_filename, 'w') as outfile:
        for fname in file_list:
            with open(fname) as infile:
                outfile.write(infile.read())


#==================================================================================
# Deployment helpers
#==================================================================================

#============================================================
#============================================================
def clean_old_files():
    """Clean up any old deployment files that still exist"""
    pass

#============================================================
# This uses the UpdateCodeVersion to change the version number
# and date. It then opens the version file and reads out the
# updated data. That's silly! Do the changes in Python!
#============================================================
def process_version():
    """Update the version number whereever appropriate, and return the current version"""
    subprocess.call('UpdateCodeVersion ..\scripts\Version.js')
#dg    subprocess.call('updateCacheVersion ..\main.appcache')

    with open('..\scripts\Version.js', 'r') as f:
        for line in f:
            mver = re.search('app.minorVersion\s*=\s*(\d+)', line)
            if mver != None and len(mver.group(1)) > 0:
                return mver.group(1)
        else:
            raise ValueError("Can't find version number in Version.js")

#============================================================
#============================================================
def restore_config():
    """Create a clean copy of the config file"""
    copy('..\scripts\config_staging.js', config_file)

#============================================================
#============================================================
def restore_global():
    """Create a clean copy of the Global.js file"""
    copy('..\scripts\A1PARCC\Global.js', global_file)

#============================================================
#============================================================
def always_actions():
    """Perform actions that always occur regardless of settings"""

    # Create a copy of the config file that we can safely operate on
    restore_config()
#    restore_global()

#============================================================
#============================================================
def online_actions():
    """Perform actions necessary for the online versions of the code"""

    # Set online book path (match any bookPath, not a specific value)
    add_change("app.bookPath = ['\"].+['\"]",
               "app.bookPath = '../content/'")

    # Disable video controls
#    add_change("app.showControls = .+;",
#               "app.showControls = false;")

#============================================================
#============================================================
def staging_actions():
    # Create a clean copy of the config file
    pass

#============================================================
# Set the product ID based on the user level
#============================================================
def set_product_id(user_type):
    """Set the product ID based on both the user type and the standards"""

    if (user_type == "student"):
        pid = student_pid
    else:
        pid = teacher_pid

    add_change("app.pid = 999",
               "app.pid = " + pid)


#==================================================================================
# The main deployment action.  This is common to all targets.
#==================================================================================

#============================================================
#============================================================
def deploy(dir_name):
    if verbose:
        stdout = None
    else:
        stdout = DEVNULL

    out_dirs.append(dir_name)

    # Clean up output directory
    clean_out_dirs(dir_name)

    # Set the current directory to the root of the project.  Without this, the tools won't work.
    os.chdir('..')

    # Process the main HTML and CSS files
    process_sources(dir_name, stdout)

    # Remove any temporary files that we generated (move this into the appropriate step?)
    #os.remove('comb.js')
    os.remove('css\combined.css')
#dg    os.remove('deploy.html')       # Needed if there's an appcache

    # Move and copy files to the output directory
    outdir = 'DeployA1/' + dir_name
    move('min.html', outdir + '/project.html')
    copy('imagesA1/atlas/atlas.png', outdir + '/imagesA1/atlas')
    copytree('imagesA1/Product/Tiled', outdir + '/imagesA1/Product/Tiled')
    copy('imagesA1/favicon.ico', outdir + '/imagesA1')
    copy_wild('scripts/lib/*min.js', outdir + '/scripts/lib')
    copy_wild('css/font/*', outdir + '/css/font')
#dg    copy('main.appcache', outdir)    # Needed if there's an appcache

    # Reset the current directory
    os.chdir('DeployA1')

#============================================================
#============================================================
def clean_out_dirs(dir_name):
    """Clean up output directory"""

    # Delete the directory
    rmtree(dir_name, True)      # The second argument suppresses error messages if the directory doesn't exist
    sleep(0.5)                  # We delete a tree, and then immediately try to recreate it.  It often fails without a delay.

    # Create the directory and all necessary subdirectories
    os.mkdir(dir_name)
    os.mkdir(dir_name + '/css')
    os.mkdir(dir_name + '/css/font')
    os.mkdir(dir_name + '/imagesA1')
    os.mkdir(dir_name + '/imagesA1/atlas')
    os.mkdir(dir_name + '/imagesA1/Product')
#    os.mkdir(dir_name + '/imagesA1/Product/Tiled')   # The entire tree is copied, so no need to make it (making it causes an exception!)
    os.mkdir(dir_name + '/scripts')
    os.mkdir(dir_name + '/scripts/lib')

#============================================================
#============================================================
def process_sources(dir_name, stdout):
    """Process the main HTML and CSS files"""

    # Add the appcache (if we're using one)
    add_app_cache(stdout)

    # Combine scripts into a single file
    combine_scripts(stdout)

    # Perform all deployment modifications to the file
    mod_file()

    print('--------------------')
#    subprocess.call('copy ..\comb.js ..\Unminified\\' + dir_name + '\comb.js')
    # Minify the Javascript file
    subprocess.call('java -jar "C:\Users\Student App Deploy\git-repos\student-app\Tools\yuicompressor-2.4.7.jar" --type js -o DeployA1\\' + dir_name + '\scripts\min.js comb.js', stdout=stdout)
    print('Minify Javascript file command: ' + 'java -jar C:\Users\Student App Deploy\git-repos\student-app\Tools\yuicompressor-2.4.7.jar --type js -o DeployA1\\' + dir_name + '\scripts\min.js comb.js')

    # Minify the CSS file(s)
    concat_files(['css\mathquill.css', 'css\worksheet.css'], 'css\combined.css')
    subprocess.call('java -jar "C:\Users\Student App Deploy\git-repos\student-app\Tools\yuicompressor-2.4.7.jar" --type css -o DeployA1\\' + dir_name + '\css\worksheet.css css\combined.css', stdout=stdout)

#============================================================
#============================================================
def add_app_cache(stdout):
    """Add an appcache reference to the project HTML file"""
#dg    subprocess.call('AddAppCache project.html deploy.html main.appcache', stdout=stdout)    # Suppress output

#============================================================
#============================================================
def combine_scripts(stdout):
    """Combine all non-minimized Javascript files into a single file"""

    # This also creates a new HTML file with all of the old script includes removed, replaced by a single
    # new include.

#dg    subprocess.call('jsConcat deploy.html comb.js', stdout=stdout)   # Needed if there's an appcache
    subprocess.call('jsConcat project.html comb.js', stdout=stdout)



#==================================================================================
# Post-Deploy Actions. These occur only once, regardless of the number of targets.
#==================================================================================

#============================================================
#============================================================
def finalize_deploy(version):
    """Do something with the online versions.  Currently, compress them and then move them to an archive directory."""

    # Delete any existing compressed file
    try:
        os.remove(product_name + version + '.7z')
    except:
        pass

    dir_list = ' '.join(out_dirs)

    subprocess.call('7za a -t7z ' + product_name + version + '.7z ' + dir_list, stdout=DEVNULL)

    for dir in out_dirs:
        rmtree(dir)

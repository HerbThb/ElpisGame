import os
import sys

# keystorePath = "/Develop/project/tea/source/branches/liqing/teagame/client/packages/build-pipeline/shell/gameley.keystore"
# srcPath = "/Develop/project/tea/source/branches/liqing/teagame/client/build/temp/unsigned.zip"
# destPath = "/Develop/project/tea/source/branches/liqing/teagame/client/build/com.gameley.teagame.nearme.gamecenter.gpk"

keystorePath = sys.argv[1]
srcPath = sys.argv[2]
destPath = sys.argv[3]

cmd = "jarsigner -storepass gameleyandroid -verbose -keystore %s -signedjar %s %s -digestalg SHA1 -sigalg MD5withRSA gameley" %(keystorePath, destPath, srcPath)
print(cmd)
os.system(cmd)
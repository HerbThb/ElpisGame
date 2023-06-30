import os
import sys

adbPath = "/Develop/android/android-sdk/platform-tools/"

length = len(sys.argv)
index = 1

while index + 1 < length:
    srcPath = sys.argv[index]
    dstPath = sys.argv[index + 1]
    index += 2
    cmd = "%sadb push %s %s" %(adbPath, srcPath, dstPath)
    print(cmd)
    os.system(cmd)

# #oppo
# if length == 3:
#     srcPath = sys.argv[1]
#     destPath = "/sdcard/Android/data/com.nearme.play/files/debug_config.json"
#     cmd = "%sadb push %s %s" %(adbPath, srcPath, destPath)
#     print(cmd)
#     os.system(cmd)

#     srcPath = sys.argv[2]
#     destPath = "/sdcard/Android/data/com.nearme.play/files/com.gameley.teagame.nearme.gamecenter.gpk"
#     cmd = "%sadb push %s %s" %(adbPath, srcPath, destPath)
#     print(cmd)
#     os.system(cmd)
# # vivo
# elif length == 2:
#     srcPath = sys.argv[1]
#     destPath = "/sdcard/Android/data/com.nearme.instant.platform/files/vivo.teagame.gameley.com.rpk"
#     cmd = "%sadb push %s %s" %(adbPath, srcPath, destPath)
#     print(cmd)
#     os.system(cmd)
# else:
#     print("argv length error")